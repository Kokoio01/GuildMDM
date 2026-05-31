import {
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	type InteractionReplyOptions,
	MessageFlags,
	SectionBuilder,
	TextDisplayBuilder,
} from "discord.js";
import type { AppError } from "../structures/apperror.js";
import { type Node, NodeType } from "../types/node.js";

export function error(error: AppError, node?: Node): InteractionReplyOptions {
	const section = new SectionBuilder().addTextDisplayComponents(
		new TextDisplayBuilder({
			content: `GuildMDM/Error\n${node?.network ? `-# You are managing **${node.network.name || "Deleted"}**` : null}`,
		}),
	);

	if (node) {
		section.setButtonAccessory(
			new ButtonBuilder()
				.setCustomId(node?.type === NodeType.master ? "master" : "node")
				.setEmoji("↩️")
				.setStyle(ButtonStyle.Secondary),
		);
	}

	const container = new ContainerBuilder({ accent_color: 0x800020 })
		.addSectionComponents(section)
		.addTextDisplayComponents(
			new TextDisplayBuilder({
				content: [`**${error.title}**`, `*${error.message}*`].join("\n"),
			}),
		);

	return {
		components: [container],
		flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
	};
}

export function success(
	title: string,
	description: string,
	back: string,
	node?: Node,
): InteractionReplyOptions {
	const section = new SectionBuilder().addTextDisplayComponents(
		new TextDisplayBuilder({
			content: `GuildMDM/Success\n${node?.network ? `-# You are managing **${node.network.name || "Deleted"}**` : null}`,
		}),
	);

	if (node) {
		section.setButtonAccessory(
			new ButtonBuilder()
				.setCustomId(back)
				.setEmoji("↩️")
				.setStyle(ButtonStyle.Secondary),
		);
	}

	const container = new ContainerBuilder({ accent_color: 0x1f6f5f })
		.addSectionComponents(section)
		.addTextDisplayComponents(
			new TextDisplayBuilder({
				content: [`**${title}**`, `*${description}*`].join("\n"),
			}),
		);

	return {
		components: [container],
		flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
	};
}
