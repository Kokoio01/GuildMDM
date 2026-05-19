import type { ModalSubmitInteraction } from "discord.js";
import { joinrequests, networks, nodes } from "../db/index.js";
import { masterMessage } from "../messages/setup.js";
import { ModalHandler } from "../structures/modalhandler.js";
import type { Network } from "../types/network.js";
import { errorMessage, successMessage } from "../utils/messages.js";
import { ensureGuild, validateAdmin } from "../utils/permissions.js";

// A bit janky, but it works
const _workLocks = new Set<number>();

export default class SetupModal extends ModalHandler {
	public name: string = "setup";

	async execute(interaction: ModalSubmitInteraction): Promise<void> {
		if (!ensureGuild(interaction)) return;
		if (!(await validateAdmin(interaction))) return;
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
		}
	}
}
