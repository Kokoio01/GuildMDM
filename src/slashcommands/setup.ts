import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
} from "discord.js";
import { networks, nodes } from "../db/index.js";
import { masterMessage, nodeMessage } from "../messages/setup.js";
import { SlashCommand } from "../structures/slashcommand.js";
import type { Network } from "../types/network.js";
import { NodeType } from "../types/node.js";
import { validateAdmin } from "../utils/permissions.js";

export default class SetupCommand extends SlashCommand {
	constructor() {
		super(
			new SlashCommandBuilder()
				.setName("setup")
				.setDescription("Set up your Server!"),
		);
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		if (!(await validateAdmin(interaction))) return;
		if (!interaction.guild) return; //already in validate just for ts
		const adminGuild = process.env.ADMIN_GUILD as string;
		const node = await nodes.getNode(interaction.guild.id);
		const nodeStatus =
			node?.type === undefined
				? "setup"
				: node.type === NodeType.master
					? "master"
					: "node";

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

				await interaction.reply(nodeMessage(network || ({} as Network)));
				return;
			}
			case "master": {
				if (!node) return;
				const network = await networks.getNetwork(node.networkid);

				await interaction.reply(masterMessage(network || ({} as Network)));
				return;
			}
		}
	}
}
