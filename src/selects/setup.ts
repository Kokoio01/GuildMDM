import {
	ActionRowBuilder,
	type AnySelectMenuInteraction,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	LabelBuilder,
	MessageFlags,
	ModalBuilder,
	PermissionsBitField,
	TextDisplayBuilder,
	TextInputBuilder,
	TextInputStyle,
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
				return;
			}
			case "node": {
				const type = interaction.values[0];
				switch (type) {
					case "leave": {
						const modal = new ModalBuilder()
							.setCustomId("setup:node:leave")
							.setTitle("Setup - Node - Leave Network")
							.addTextDisplayComponents(
								new TextDisplayBuilder({
									content:
										"You are leaving the network, leaving a network will remove all policies from the guild and the bot will cease all operations on this server.",
								}),
							);

						await interaction.showModal(modal);
						return;
					}
				}
				return;
			}
			case "master": {
				const type = interaction.values[0];
				switch (type) {
					case "members": {
						//TODO: MEMBERS
						return;
					}
					case "rename": {
						const modal = new ModalBuilder()
							.setCustomId("setup:master:rename")
							.setTitle("Setup - Node - Rename Network")
							.addLabelComponents(
								new LabelBuilder()
									.setLabel("New Network Name")
									.setTextInputComponent(
										new TextInputBuilder({
											customId: "name",
											style: TextInputStyle.Short,
											required: true,
											max_length: 200,
										}),
									),
							);

						await interaction.showModal(modal);
						return;
					}
					case "delete": {
						const embed = new EmbedBuilder()
							.setTitle("Delete Network")
							.setDescription(
								"**You are about to delete your network. This action is irreversible!**\n\n**Are you sure you want to continue?**",
							)
							.setColor(0x800020);

						const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
							new ButtonBuilder()
								.setCustomId("setup:master:delete")
								.setLabel("Confirm")
								.setStyle(ButtonStyle.Danger),
							new ButtonBuilder()
								.setCustomId("setup:master")
								.setLabel("Cancel")
								.setStyle(ButtonStyle.Secondary),
						]);

						await interaction.reply({
							embeds: [embed],
							components: [row],
							flags: MessageFlags.Ephemeral,
						});
						return;
					}
				}
				return;
			}
		}
	}
}
