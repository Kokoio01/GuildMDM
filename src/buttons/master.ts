import {
	type ButtonInteraction,
	ModalBuilder,
	TextDisplayBuilder,
} from "discord.js";
import { networks } from "../db/index.js";
import { masterMessage } from "../messages/setup.js";
import { ButtonHandler } from "../structures/buttonhandler.js";
import type { Network } from "../types/network.js";
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
				const network = await networks.getNetwork(node.networkid);
				if (!network) {
					await interaction.followUp(
						errorMessage(
							"This Network does not exist!",
							"Please make sure that you are in a Network and that the Network exists!",
						),
					);
					return;
				}

				await interaction.reply(masterMessage(network || ({} as Network)));
				return;
			}
		}
	}
}
