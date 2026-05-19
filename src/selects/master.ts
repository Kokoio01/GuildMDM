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
import { networks, nodes } from "../db/index.js";
import { memberMessage } from "../messages/setup.js";
import { SelectHandler } from "../structures/selecthandler.js";
import { NodeType } from "../types/node.js";
import { errorMessage } from "../utils/messages.js";
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
				const node = await nodes.getNode(interaction.guild.id);
				if (!node || node.type !== NodeType.master) {
					await interaction.reply(
						errorMessage(
							"This server is not a network master!",
							"This node is either not in a network or is not a network master!",
						),
					);
					return;
				}

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

				await interaction.reply(await memberMessage(network, networkNodes, 0));
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
						.setCustomId("setup:master:delete")
						.setLabel("Confirm")
						.setStyle(ButtonStyle.Danger),
					new ButtonBuilder()
						.setCustomId("setup:master")
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
