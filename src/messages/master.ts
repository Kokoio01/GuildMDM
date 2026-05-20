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
import type { Network } from "../types/network.js";

export function masterMenu(network: Network): InteractionReplyOptions {
	const container = new ContainerBuilder()
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder({
						content: `**Setup/Master**\n-# You are managing **${network.name || "Deleted"}**`,
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
					`You are the master of the Network: **${network?.name || "Deleted"}** Use the Select Menu below to select what you want to configure`,
					"",
					`**ID:** ${network?.id || "Deleted"}`,
					`**Join Key:** ${network?.joinkey || "Deleted"}`,
				].join("\n"),
			}),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addActionRowComponents(
			new ActionRowBuilder<StringSelectMenuBuilder>({
				components: [
					new StringSelectMenuBuilder({
						customId: "master:main",
						options: [
							{ label: "Manage Members", value: "members" },
							{ label: "Manage Join Requests", value: "joinrequests" },
							{ label: "Rename Network", value: "rename" },
							{ label: "Delete Network", value: "delete" },
						],
					}),
				],
			}),
		);

	return {
		components: [container],
		flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
	};
}
