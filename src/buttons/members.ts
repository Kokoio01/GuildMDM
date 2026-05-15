import {
	type ButtonInteraction,
	ModalBuilder,
	TextDisplayBuilder,
} from "discord.js";
import { networks } from "../db/index.js";
import { memberMessage } from "../messages/setup.js";
import { ButtonHandler } from "../structures/buttonhandler.js";
import { NodeType } from "../types/node.js";
import { errorMessage } from "../utils/messages.js";
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
		if (!action) return;

		switch (action) {
			case "page": {
				const page = interaction.customId.split(":")[2];

				const network = await networks.getNetwork(node.networkid);
				if (!network) {
					await interaction.reply(
						errorMessage(
							"This Network does not exist!",
							"Please make sure that you are in a Network and that the Network exists!",
						),
					);
					return;
				}
				const networkNodes = await networks.getNodes(network.id);

				await interaction.reply(
					await memberMessage(network, networkNodes, parseInt(page || "1", 10)),
				);
				return;
			}
			case "overview": {
				const network = await networks.getNetwork(node.networkid);
				if (!network) {
					await interaction.reply(
						errorMessage(
							"This Network does not exist!",
							"Please make sure that you are in a Network and that the Network exists!",
						),
					);
					return;
				}
				const networkNodes = await networks.getNodes(network.id);

				await interaction.reply(await memberMessage(network, networkNodes, 1));
				return;
			}
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
		}
	}
}
