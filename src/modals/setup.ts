import {
	ActionRowBuilder,
	EmbedBuilder,
	MessageFlags,
	type ModalSubmitInteraction,
	PermissionsBitField,
	StringSelectMenuBuilder,
} from "discord.js";
import { joinrequests, networks, nodes } from "../db/index.js";
import { ModalHandler } from "../structures/modalhandler.js";
import {
	errorMessage,
	permissionErrorMessage,
	successMessage,
} from "../utils/messages.js";

export default class SetupModal extends ModalHandler {
	public name: string = "setup";

	async execute(interaction: ModalSubmitInteraction): Promise<void> {
		if (!interaction.guild) {
			await interaction.reply(
				errorMessage(
					"Not a Guild!",
					"This command can only be executed in guilds.",
				),
			);
			return;
		}
		if (
			!interaction.memberPermissions?.has(
				PermissionsBitField.Flags.Administrator,
			)
		) {
			await interaction.reply(permissionErrorMessage("Administrator"));
			return;
		}
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
					const embed = new EmbedBuilder()
						.setTitle("Setup - Home")
						.setDescription(
							[
								`You are the master of the Network: **${network?.name || "Deleted"}**`,
								"",
								`**ID:** ${network?.id || "Deleted"}`,
								`**Join Key:** ${network?.joinkey || "Deleted"}`,
							].join("\n"),
						);

					const row = new ActionRowBuilder<StringSelectMenuBuilder>({
						components: [
							new StringSelectMenuBuilder()
								.setCustomId("setup:master")
								.setOptions([
									{ label: "Manage Members", value: "members" },
									{ label: "Rename Network", value: "rename" },
									{ label: "Delete Network", value: "delete" },
								]),
						],
					});

					await interaction.reply({
						embeds: [embed],
						components: [row],
						flags: MessageFlags.Ephemeral,
					});
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
