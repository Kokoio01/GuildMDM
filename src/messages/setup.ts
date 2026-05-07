import {
	ActionRowBuilder,
	EmbedBuilder,
	type InteractionReplyOptions,
	MessageFlags,
	StringSelectMenuBuilder,
} from "discord.js";
import type { Network } from "../types/network.js";

export function masterMessage(network: Network): InteractionReplyOptions {
	const embed = new EmbedBuilder()
		.setTitle("Setup - Home")
		.setDescription(
			[
				`You are the master of the Network: **${network?.name || "Deleted"}**`,
				"",
				`**ID:** ${network?.id || "Deleted"}`,
				`**Join Key:** ${network?.joinkey || "Deleted"}`,
			].join("\n"),
		);

	const row = new ActionRowBuilder<StringSelectMenuBuilder>({
		components: [
			new StringSelectMenuBuilder().setCustomId("setup:master").setOptions([
				{ label: "Manage Members", value: "members" },
				{ label: "Rename Network", value: "rename" },
				{ label: "Delete Network", value: "delete" },
			]),
		],
	});

	return {
		embeds: [embed],
		components: [row],
		flags: MessageFlags.Ephemeral,
	};
}

export function nodeMessage(network: Network): InteractionReplyOptions {
	const embed = new EmbedBuilder()
		.setTitle("Setup - Home")
		.setDescription(
			[
				`You are part of the Network: **${network?.name || "Deleted"}**`,
				"",
				`**ID:** ${network?.id || "Deleted"}`,
				`**Join Key:** ${network?.joinkey || "Deleted"}`,
			].join("\n"),
		);

	const row = new ActionRowBuilder<StringSelectMenuBuilder>({
		components: [
			new StringSelectMenuBuilder()
				.setCustomId("setup:node")
				.setOptions([{ label: "Leave Network", value: "leave" }]),
		],
	});

	return {
		embeds: [embed],
		components: [row],
		flags: MessageFlags.Ephemeral,
	};
}
