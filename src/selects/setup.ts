import {
	ActionRowBuilder,
	type AnySelectMenuInteraction,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	MessageFlags,
	PermissionsBitField,
} from "discord.js";
import { SelectHandler } from "../structures/selecthandler.js";
import { errorMessage, permissionErrorMessage } from "../utils/messages.js";

export default class setupSelect extends SelectHandler {
	public name: string = "setup";

	async execute(interaction: AnySelectMenuInteraction): Promise<void> {
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

		switch (action) {
			case "selector": {
				if (interaction.values[0] === "netsetup") {
					const embed = new EmbedBuilder()
						.setTitle("Setup - Network")
						.setDescription(
							"Welcome to GuildMDM, let's set up your Network! \nThis guild will act as the Master Node of your network.\n\n" +
								"If this is not the correct guild, please run this command in the right guild and set ADMIN_GUILD to the correct guild in your config!\n\n" +
								"If you want to join a network, please also set the ADMIN_GUILD to the correct value in your config!",
						);

					const row = new ActionRowBuilder<ButtonBuilder>({
						components: [
							new ButtonBuilder()
								.setCustomId("setup:netsetup")
								.setLabel("Setup Network")
								.setStyle(ButtonStyle.Secondary),
						],
					});

					await interaction.reply({
						embeds: [embed],
						components: [row],
						flags: MessageFlags.Ephemeral,
					});
				} else {
					const embed = new EmbedBuilder()
						.setTitle("Setup - Node")
						.setDescription(
							"Welcome to GuildMDM, let's set up your server! \nThis guild will act as a node to a network.\n" +
								"Joining a network allows the network administrators to set rules this server has to follow. " +
								"It might also, based on the settings of the network, allow the administrators to change parts " +
								"of this server! (More on what the administrators can do will be provided on the next screen.)" +
								"\n \n **WARNING: Only join Networks which Administrators you trust!**",
						);

					const row = new ActionRowBuilder<ButtonBuilder>({
						components: [
							new ButtonBuilder()
								.setCustomId("setup:nodesetup")
								.setLabel("Setup Node")
								.setStyle(ButtonStyle.Secondary),
						],
					});

					await interaction.reply({
						embeds: [embed],
						components: [row],
						flags: MessageFlags.Ephemeral,
					});
				}
			}
		}
	}
}
