import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
	PermissionsBitField,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
} from "discord.js";
import { networks, nodes } from "../db/index.js";
import { SlashCommand } from "../structures/slashcommand.js";
import { errorMessage, permissionErrorMessage } from "../utils/messages.js";

export default class SetupCommand extends SlashCommand {
	constructor() {
		super(
			new SlashCommandBuilder()
				.setName("setup")
				.setDescription("Set up your Server!"),
		);
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
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

		const adminGuild = process.env.ADMIN_GUILD as string;
		const node = await nodes.getNode(interaction.guild.id);
		const nodeStatus =
			node?.type === undefined ? "setup" : node.type === 1 ? "master" : "node";

		switch (nodeStatus) {
			case "setup": {
				if (adminGuild) {
					if (adminGuild === interaction.guild.id) {
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
				} else {
					const embed = new EmbedBuilder()
						.setTitle("Setup")
						.setDescription(
							"Welcome to GuildMDM, let's set up your server! \n \n" +
								"**Network Setup** - Set this server up as a master that controls other servers. \n" +
								"**Node Setup** - Join an existing network to copy its policies.",
						);

					const row = new ActionRowBuilder<StringSelectMenuBuilder>({
						components: [
							new StringSelectMenuBuilder()
								.setCustomId("setup:selector")
								.setOptions([
									{ label: "Network Setup", value: "netsetup" },
									{ label: "Node Setup", value: "nodesetup" },
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
			case "node": {
				if (!node) return;
				const network = await networks.getNetwork(node.networkid);

				const embed = new EmbedBuilder()
					.setTitle("Setup - Home")
					.setDescription(
						[
							`You are part of the Network: **${network?.name || "Deleted"}**`,
							"",
							`**ID:** ${network?.id || "Deleted"}`,
							`**Join Key:** ${network?.joinkey || "Deleted"}`,
						].join("\n"),
					);

				const row = new ActionRowBuilder<StringSelectMenuBuilder>({
					components: [
						new StringSelectMenuBuilder()
							.setCustomId("setup:node")
							.setOptions([{ label: "Leave Network", value: "leave" }]),
					],
				});

				await interaction.reply({
					embeds: [embed],
					components: [row],
					flags: MessageFlags.Ephemeral,
				});
				return;
			}
			case "master": {
				if (!node) return;
				const network = await networks.getNetwork(node.networkid);

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
				return;
			}
		}
	}
}
