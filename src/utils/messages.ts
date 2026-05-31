import {
	EmbedBuilder,
	type InteractionReplyOptions,
	MessageFlags,
} from "discord.js";

export function successMessage(
	title: string,
	description: string,
): InteractionReplyOptions {
	return {
		embeds: [
			new EmbedBuilder()
				.setTitle(title)
				.setDescription(description)
				.setColor(0x1f6f5f),
		],
		flags: MessageFlags.Ephemeral,
	};
}
