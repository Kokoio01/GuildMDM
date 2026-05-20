import {
	type ButtonInteraction,
	ModalBuilder,
	TextDisplayBuilder,
} from "discord.js";
import { networks } from "../db/index.js";
import { memberMenu } from "../messages/members.js";
import { ButtonHandler } from "../structures/buttonhandler.js";
import { NodeType } from "../types/node.js";
import {
	ensureGuild,
	ensureNodeType,
	validateAdmin,
} from "../utils/permissions.js";

export default class MembersButton extends ButtonHandler {
	name = "members";

	async execute(interaction: ButtonInteraction): Promise<void> {
		if (!ensureGuild(interaction)) return;
		const admin = await validateAdmin(interaction);
		const node = await ensureNodeType(interaction, NodeType.master);
		if (!admin || !node) return;
		const action = interaction.customId.split(":")[1];

		switch (action) {
			case "kick": {
				const guildId = interaction.customId.split(":")[2];

				const modal = new ModalBuilder()
					.setCustomId(`members:kick:${guildId}`)
					.setTitle("Setup - Members - Kick")
					.addTextDisplayComponents(
						new TextDisplayBuilder({
							content: `Are you sure you want to kick **${guildId}** from the Network?`,
						}),
					);
				await interaction.showModal(modal);
				return;
			}
			default: {
				const networkNodes = await networks.getNodes(node.network.id);

				await interaction.reply(
					await memberMenu(node.network, networkNodes, 1),
				);
				return;
			}
		}
	}
}
