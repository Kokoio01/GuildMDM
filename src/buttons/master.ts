import {
	type ButtonInteraction,
	ModalBuilder,
	TextDisplayBuilder,
} from "discord.js";
import { masterMenu } from "../messages/master.js";
import { ButtonHandler } from "../structures/buttonhandler.js";
import { NodeType } from "../types/node.js";
import {
	ensureGuild,
	ensureNodeType,
	validateAdmin,
} from "../utils/permissions.js";

export default class MasterButton extends ButtonHandler {
	name = "master";

	async execute(interaction: ButtonInteraction): Promise<void> {
		if (!ensureGuild(interaction)) return;
		const admin = await validateAdmin(interaction);
		const node = await ensureNodeType(interaction, NodeType.master);
		if (!admin || !node) return;
		const action = interaction.customId.split(":")[1];

		switch (action) {
			case "delete": {
				const modal = new ModalBuilder()
					.setCustomId("master:delete")
					.setTitle("Setup - Master - Delete Network")
					.addTextDisplayComponents(
						new TextDisplayBuilder({
							content:
								"**This Action can not be undone**, are you really sure that you want to delete this Network, this will force leave all Nodes and force delete all policies!",
						}),
					);

				await interaction.showModal(modal);
				return;
			}
			default: {
				await interaction.reply(masterMenu(node.network));
				return;
			}
		}
	}
}
