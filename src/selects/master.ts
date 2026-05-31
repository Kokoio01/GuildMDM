import {
	LabelBuilder,
	ModalBuilder,
	type StringSelectMenuInteraction,
	TextDisplayBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { joinrequests, networks } from "../db/index.js";
import { joinRequestMenu } from "../messages/joinrequests.js";
import { memberMenu } from "../messages/members.js";
import { AppError } from "../structures/apperror.js";
import { SelectHandler } from "../structures/selecthandler.js";
import { RequestStatus } from "../types/network.js";
import { NodeType } from "../types/node.js";
import {
	ensureGuild,
	ensureNodeType,
	validateAdmin,
} from "../utils/permissions.js";

export default class masterSelector extends SelectHandler {
	name = "master";

	async execute(interaction: StringSelectMenuInteraction): Promise<void> {
		if (!ensureGuild(interaction)) return;
		const admin = await validateAdmin(interaction);
		const node = await ensureNodeType(interaction, NodeType.master);
		if (!admin || !node) return;
		const action = interaction.values[0];
		if (!action) throw new AppError("UNKNOWN_SELECT_MENU");

		switch (action) {
			case "members": {
				const networkNodes = await networks.getNodes(node.network.id);

				await interaction.reply(
					await memberMenu(node.network, networkNodes, 0),
				);
				return;
			}
			case "joinrequests": {
				const joinRequests = await joinrequests.getJoinRequests(
					node.network.id,
					RequestStatus.PENDING,
				);

				await interaction.reply(
					await joinRequestMenu(node.network, joinRequests, 0),
				);
				return;
			}
			case "rename": {
				const modal = new ModalBuilder()
					.setCustomId("master:rename")
					.setTitle("Setup - Master - Rename Network")
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
				const modal = new ModalBuilder()
					.setCustomId("master:delete")
					.setTitle("Setup - Master - Delete Network")
					.addTextDisplayComponents(
						new TextDisplayBuilder({
							content:
								"**This Action can not be undone**, are you really sure that you want to delete this Network, this will force leave all Nodes and force delete all policies!",
						}),
					)
					.addLabelComponents(
						new LabelBuilder()
							.setLabel("Confirm Deletion")
							.setDescription("Enter DELETE below to confirm!")
							.setTextInputComponent(
								new TextInputBuilder()
									.setCustomId("confirm")
									.setMaxLength(6)
									.setRequired(true)
									.setStyle(TextInputStyle.Short),
							),
					);

				await interaction.showModal(modal);
				return;
			}
		}
		return;
	}
}
