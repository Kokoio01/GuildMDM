import {
	type ButtonInteraction,
	LabelBuilder,
	ModalBuilder,
	PermissionsBitField,
	TextDisplayBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { networks, nodes } from "../db/index.js";
import { ButtonHandler } from "../structures/buttonhandler.js";
import { errorMessage, permissionErrorMessage } from "../utils/messages.js";

export default class SetupButton extends ButtonHandler {
	public name: string = "setup";

	async execute(interaction: ButtonInteraction): Promise<void> {
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

				const modal = new ModalBuilder()
					.setCustomId("setup:netsetup")
					.setTitle("Setup - Network - Create")
					.addLabelComponents(
						new LabelBuilder()
							.setLabel("Network Name")
							.setTextInputComponent(
								new TextInputBuilder()
									.setCustomId("name")
									.setMaxLength(200)
									.setStyle(TextInputStyle.Short)
									.setRequired(true),
							),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder({
							content:
								"By submiting this Modal you are creating a new **Network** and adding this server as the **master node** to it.",
						}),
					);

				await interaction.showModal(modal);
				return;
			}
			case "nodesetup": {
				if (adminGuild) {
					const adminNode = await nodes.getNode(adminGuild);
					if (!adminNode) {
						await interaction.reply(
							errorMessage(
								"Not available!",
								"This Instance has no current Network to join!",
							),
						);
						return;
					}
					const network = await networks.getNetwork(adminNode?.id);

					const modal = new ModalBuilder()
						.setCustomId("setup:nodesetup:admin")
						.setTitle("Setup - Node - Join Network")
						.addTextDisplayComponents(
							new TextDisplayBuilder({
								content:
									"By joining a Network you are **allowing** the Networks Administrators to **create rules**, " +
									"which this server has to follow and based on the configuration of the Network " +
									"you may also allow the Network Owner to **change parts of your Server**. \n \n" +
									"**WARNING: Only join Networks which Administrators you trust!**",
							}),
							new TextDisplayBuilder({
								content: `You are sending a request to join **${network?.name || "ERROR"}**`,
							}),
						)
						.addLabelComponents(
							new LabelBuilder()
								.setLabel("Message")
								.setTextInputComponent(
									new TextInputBuilder()
										.setCustomId("message")
										.setMaxLength(250)
										.setStyle(TextInputStyle.Paragraph)
										.setRequired(true),
								),
						);

					await interaction.showModal(modal);
				} else {
					const modal = new ModalBuilder()
						.setCustomId("setup:nodesetup")
						.setTitle("Setup - Node - Join Network")
						.addTextDisplayComponents(
							new TextDisplayBuilder({
								content:
									"By joining a Network you are **allowing** the Networks Administrators to **create rules**, " +
									"which this server has to follow and based on the configuration of the Network " +
									"you may also allow the Network Owner to **change parts of your Server**. \n \n" +
									"**WARNING: Only join Networks which Administrators you trust!**",
							}),
						)
						.addLabelComponents(
							new LabelBuilder()
								.setLabel("Network's Join Key")
								.setTextInputComponent(
									new TextInputBuilder()
										.setCustomId("joinkey")
										.setMaxLength(8)
										.setStyle(TextInputStyle.Short)
										.setRequired(true),
								),
							new LabelBuilder()
								.setLabel("Message")
								.setTextInputComponent(
									new TextInputBuilder()
										.setCustomId("message")
										.setMaxLength(250)
										.setStyle(TextInputStyle.Paragraph)
										.setRequired(true),
								),
						);

					await interaction.showModal(modal);
				}
				return;
			}
		}
	}
}
