import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	type InteractionReplyOptions,
	MessageFlags,
	SectionBuilder,
	SeparatorBuilder,
	StringSelectMenuBuilder,
	TextDisplayBuilder,
} from "discord.js";
import type { Node } from "../types/node.js";

export function nodeMenu(node: Node): InteractionReplyOptions {
	const container = new ContainerBuilder()
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder({
						content: `**Setup/Node**\n-# You are managing **${node.network.name || "Deleted"}**`,
					}),
				)
				.setButtonAccessory(
					new ButtonBuilder()
						.setCustomId("disabled")
						.setEmoji("↩️")
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(true),
				),
		)

		.addTextDisplayComponents(
			new TextDisplayBuilder({
				content: [
					`You are part of the Network: **${node.network.name || "Deleted"}** Use the Select Menu below to select what you want to configure.`,
					"",
					"### Network:",
					`**ID:** ${node.network.id || "Deleted"}`,
					`**Join Key:** ${node.network.joinkey || "Deleted"}`,
				].join("\n"),
			}),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addActionRowComponents(
			new ActionRowBuilder<StringSelectMenuBuilder>({
				components: [
					new StringSelectMenuBuilder({
						customId: "node:main",
						options: [{ label: "Leave Network", value: "leave" }],
					}),
				],
			}),
		);

	return {
		components: [container],
		flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
	};
}
