import { MessageFlags, type ModalSubmitInteraction } from "discord.js";
import { joinrequests, networks, nodes } from "../db/index.js";
import { masterMessage } from "../messages/setup.js";
import { ModalHandler } from "../structures/modalhandler.js";
import type { Network } from "../types/network.js";
import { NodeType } from "../types/node.js";
import { internalBus } from "../utils/eventBus.js";
import { logger } from "../utils/logger.js";
import { errorMessage, successMessage } from "../utils/messages.js";
import { validateAdmin } from "../utils/permissions.js";

// A bit janky, but it works
const workLocks = new Set<number>();

export default class SetupModal extends ModalHandler {
	public name: string = "setup";

	async execute(interaction: ModalSubmitInteraction): Promise<void> {
		if (!(await validateAdmin(interaction))) return;
		if (!interaction.guild) return; //already in validate just for ts
		const action = interaction.customId.split(":")[1];
		const adminGuild = process.env.ADMIN_GUILD as string;

		switch (action) {
			case "netsetup": {
				if (adminGuild && adminGuild !== interaction.guild?.id) {
					await interaction.reply(
						errorMessage(
							"Not allowed!",
							"This Instance has restricted Network creation",
						),
					);
					return;
				}
				const name = interaction.fields.getTextInputValue("name");
				const node = await nodes.getNode(interaction.guild.id);

				if (node) {
					await interaction.reply(
						errorMessage(
							"Already in a Network!",
							"This Server is already part of a Network! Please remove it from the Network first!",
						),
					);
				} else {
					const network = await networks.createNetwork(
						name,
						interaction.guild.id,
					);

					await interaction.reply(masterMessage(network || ({} as Network)));
				}
				return;
			}
			case "nodesetup": {
				const joinKey = interaction.fields.getTextInputValue("joinkey");
				const message = interaction.fields.getTextInputValue("message");
				if (adminGuild) {
					const adminNode = await nodes.getNode(adminGuild);
					if (!adminNode) {
						await interaction.reply(
							errorMessage(
								"Not available!",
								"This Instance has no current Network to join!",
							),
						);
					} else {
						const result = await joinrequests.createJoinRequest(
							interaction.guild.id,
							adminNode.networkid,
							message,
						);

						if (!result) {
							await interaction.reply(
								errorMessage(
									"Error",
									"An error occurred while creating the join request. Please try again later.",
								),
							);
						} else {
							await interaction.reply(
								successMessage(
									"Application submitted",
									"Your Application has been submitted to the Network Owner. They will respond to you as soon as possible.",
								),
							);
						}
					}
				} else {
					const network = await networks.getNetworkByJoinKey(joinKey);
					if (!network) {
						await interaction.reply(
							errorMessage(
								"Invalid Join Key",
								"There is no Network with this Join Key!",
							),
						);
					} else {
						const result = await joinrequests.createJoinRequest(
							interaction.guild.id,
							network.id,
							message,
						);
						if (!result) {
							await interaction.reply(
								errorMessage(
									"Error",
									"An error occurred while creating the join request. Please try again later.",
								),
							);
						} else {
							await interaction.reply(
								successMessage(
									"Application submitted",
									"Your Application has been submitted to the Network Owner. They will respond to you as soon as possible.",
								),
							);
						}
					}
				}
				return;
			}
			case "master": {
				const type = interaction.customId.split(":")[2];

				await interaction.deferReply({ flags: MessageFlags.Ephemeral });

				const node = await nodes.getNode(interaction.guild.id);
				if (!node || node.type !== NodeType.master) return;

				if (workLocks.has(node.networkid)) {
					await interaction.followUp(
						errorMessage(
							"Deletion in progress",
							"This network is already being deleted.",
						),
					);
					return;
				}

				const network = await networks.getNetwork(node.networkid);
				if (!network) {
					await interaction.followUp(
						errorMessage(
							"This Network does not exist!",
							"Please make sure that you are in a Network and that the Network exists!",
						),
					);
					return;
				}

				switch (type) {
					case "rename": {
						const name = interaction.fields.getTextInputValue("name");
						if (name.length > 200 || name.length < 2) {
							await interaction.followUp(
								errorMessage(
									"Invalid Name",
									"The name must be between 2 and 200 characters long.",
								),
							);
							return;
						}

						try {
							workLocks.add(network.id);

							await networks.updateNetwork(network.id, name);

							await interaction.followUp(
								successMessage(
									"Network renamed",
									`The Network has been renamed to **${name}**`,
								),
							);
						} catch (err) {
							logger.error(err);
							await interaction.followUp(
								errorMessage(
									"Error",
									"An error occurred while renaming the Network. Please try again later.",
								),
							);
						} finally {
							workLocks.delete(network.id);
						}
						return;
					}
					case "delete": {
						try {
							workLocks.add(network.id);

							const networkNodes = await networks.getNodes(network.id);

							await networks.deleteNetwork(network.id);

							networkNodes?.forEach((node) => {
								internalBus.emit("network_disband", node.guildid, network);
							});

							await interaction.followUp(
								successMessage("Deleted", "The Network has been deleted."),
							);
						} catch (err) {
							logger.error(err);
							await interaction.followUp(
								errorMessage(
									"Error",
									"An error occurred while deleting the Network. Please try again later.",
								),
							);
						} finally {
							workLocks.delete(network.id);
						}
						return;
					}
				}
				return;
			}
			case "node": {
				const type = interaction.customId.split(":")[2];

				switch (type) {
					case "leave": {
						await interaction.deferReply();

						const node = await nodes.getNode(interaction.guild.id);
						if (!node || node.type !== NodeType.normal) return;

						if (workLocks.has(node.id)) {
							await interaction.followUp(
								errorMessage(
									"Leaving in progress",
									"This node is already leaving the network.",
								),
							);
							return;
						}

						const master = await networks.getMasterNode(node.networkid);
						if (!master) {
							await interaction.followUp(
								errorMessage(
									"This Node is not part of a Network!",
									"Please make sure that you are in a Network and that the Network exists!",
								),
							);
							return;
						}

						try {
							workLocks.add(node.id);

							await nodes.deleteNode(node.guildid);

							internalBus.emit("network_leave", master.guildid, node.guildid);
						} catch (err) {
							logger.error(err);
							await interaction.followUp(
								errorMessage(
									"Error",
									"An error occurred while deleting the Network. Please try again later.",
								),
							);
						} finally {
							workLocks.delete(node.id);
						}
					}
				}
			}
		}
	}
}
