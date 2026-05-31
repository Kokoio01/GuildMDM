import {
	ModalBuilder,
	type StringSelectMenuInteraction,
	TextDisplayBuilder,
} from "discord.js";
import { AppError } from "../structures/apperror.js";
import { SelectHandler } from "../structures/selecthandler.js";
import { NodeType } from "../types/node.js";
import {
	ensureGuild,
	ensureNodeType,
	validateAdmin,
} from "../utils/permissions.js";

export default class nodeSelector extends SelectHandler {
	name = "node";

	async execute(interaction: StringSelectMenuInteraction): Promise<void> {
		if (!ensureGuild(interaction)) return;
		const admin = await validateAdmin(interaction);
		const node = await ensureNodeType(interaction, NodeType.normal);
		if (!admin || !node) return;
		const action = interaction.values[0];
		if (!action) throw new AppError("UNKNOWN_SELECT_MENU");

		switch (action) {
			case "leave": {
				const modal = new ModalBuilder()
					.setCustomId("node:leave")
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
	}
}
