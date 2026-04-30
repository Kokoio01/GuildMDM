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

export function errorMessage(
	title: string,
	description: string,
): InteractionReplyOptions {
	return {
		embeds: [
			new EmbedBuilder()
				.setTitle(title)
				.setDescription(description)
				.setColor(0x800020),
		],
		flags: MessageFlags.Ephemeral,
	};
}

export function permissionErrorMessage(
	permission: string,
): InteractionReplyOptions {
	return errorMessage(
		"No Permission!",
		`To execute this Command you must have the ${permission} permission`,
	);
}
