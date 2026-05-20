import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import { nodes } from "../db/index.js";
import { masterMenu } from "../messages/master.js";
import { nodeMenu } from "../messages/node.js";
import { netSetup, nodeSetup, setupMenu } from "../messages/setup.js";
import { SlashCommand } from "../structures/slashcommand.js";
import { NodeType } from "../types/node.js";
import { ensureGuild, validateAdmin } from "../utils/permissions.js";

export default class SetupCommand extends SlashCommand {
	constructor() {
		super(
			new SlashCommandBuilder()
				.setName("setup")
				.setDescription("Set up your Server!"),
		);
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		if (!ensureGuild(interaction)) return;
		if (!(await validateAdmin(interaction))) return;
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
						await interaction.reply(netSetup());
					} else {
						await interaction.reply(nodeSetup());
					}
				} else {
					await interaction.reply(setupMenu());
				}
				return;
			}
			case "node": {
				if (!node) return;

				await interaction.reply(nodeMenu(node));
				return;
			}
			case "master": {
				if (!node) return;

				await interaction.reply(masterMenu(node.network));
				return;
			}
		}
	}
}
