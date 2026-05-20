import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	LabelBuilder,
	MessageFlags,
	ModalBuilder,
	type StringSelectMenuInteraction,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { joinrequests, networks } from "../db/index.js";
import { joinRequestMenu } from "../messages/joinrequests.js";
import { memberMenu } from "../messages/members.js";
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
		if (!action) return;

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
				const embed = new EmbedBuilder()
					.setTitle("Delete Network")
					.setDescription(
						"**You are about to delete your network. This action is irreversible!**\n\n**Are you sure you want to continue?**",
					)
					.setColor(0x800020);

				const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
					new ButtonBuilder()
						.setCustomId("master:delete")
						.setLabel("Confirm")
						.setStyle(ButtonStyle.Danger),
					new ButtonBuilder()
						.setCustomId("master")
						.setLabel("Cancel")
						.setStyle(ButtonStyle.Secondary),
				]);

				await interaction.reply({
					embeds: [embed],
					components: [row],
					flags: MessageFlags.Ephemeral,
				});
				return;
			}
		}
		return;
	}
}
