import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	type InteractionReplyOptions,
	MessageFlags,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import { guilds } from "../db/index.js";
import type { JoinRequest, Network } from "../types/network.js";
import { type Node, NodeType } from "../types/node.js";

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

export async function memberMessage(
	network: Network,
	nodes: Node[] | null,
	page: number = 1,
): Promise<InteractionReplyOptions> {
	if (!nodes) nodes = [];
	const total = nodes.length;
	const pages = Math.ceil(total / 23);
	const current = Math.min(Math.max(page, 1), pages);
	const start = (current - 1) * 23;
	const selected = nodes.slice(start, start + 23);

	let guild = await guilds.getGuilds(selected.map((node) => node.guildid));
	if (!guild) guild = [];
	const items = [
		new StringSelectMenuOptionBuilder()
			.setLabel("Go Back")
			.setDescription("Return to the main menu")
			.setValue("back")
			.setEmoji("↩️"),
		new StringSelectMenuOptionBuilder()
			.setLabel("View Join requests")
			.setDescription("See all pending join requests")
			.setValue("joinrequests")
			.setEmoji("🆕"),
		...selected.map((node) =>
			new StringSelectMenuOptionBuilder()
				.setLabel(
					guild.find((guild) => guild.id === node.guildid)?.name || "Unknown",
				)
				.setDescription(node.guildid)
				.setValue(`member:${node.guildid}`),
		),
	];

	const embed = new EmbedBuilder()
		.setTitle("Setup - Members")
		.setDescription(
			[
				`You are the master of the Network: **${network?.name || "Deleted"}**`,
				"",
				`**Servers in Network:** ${total}`,
				`**Join Key:** ${network?.joinkey || "Deleted"}`,
			].join("\n"),
		);

	const components: ActionRowBuilder[] = [];

	components.push(
		new ActionRowBuilder<StringSelectMenuBuilder>({
			components: [
				new StringSelectMenuBuilder()
					.setCustomId("members:main")
					.setMaxValues(1)
					.setOptions(items),
			],
		}),
	);

	if (pages > 1) {
		components.push(
			new ActionRowBuilder<ButtonBuilder>({
				components: [
					new ButtonBuilder()
						.setCustomId(`members:page:${current - 1}`)
						.setEmoji("◀️")
						.setDisabled(current - 1 < 1)
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId("disabled")
						.setLabel(`Page ${current}/${pages}`)
						.setDisabled(true)
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId(`members:page:${current + 1}`)
						.setEmoji("▶️")
						.setDisabled(current + 1 > pages)
						.setStyle(ButtonStyle.Secondary),
				],
			}),
		);
	}

	return {
		embeds: [embed],
		components: components.map((component) => component.toJSON()),
		flags: MessageFlags.Ephemeral,
	};
}

export async function memberDetail(
	node: Node,
): Promise<InteractionReplyOptions> {
	const guild = ((await guilds.getGuilds([node.guildid])) || [])[0];
	const name = guild ? guild.name : "Unknown";

	const embed = new EmbedBuilder()
		.setTitle(`Viewing member: ${name}`)
		.setDescription(
			[
				`**ID:** ${node.id}`,
				`**Guild ID:** ${node.guildid}`,
				`**Type:** ${node.type === NodeType.master ? "Master" : "Member"}`,
			].join("\n"),
		);

	const row = new ActionRowBuilder<ButtonBuilder>({
		components: [
			new ButtonBuilder()
				.setCustomId("members:overview")
				.setEmoji("↩️")
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId(`members:kick:${node.guildid}`)
				.setStyle(ButtonStyle.Danger)
				.setLabel("Kick from Network")
				.setDisabled(node.type === NodeType.master),
		],
	});

	return {
		embeds: [embed],
		components: [row],
		flags: MessageFlags.Ephemeral,
	};
}

export async function joinRequestMessage(
	network: Network,
	joinRequests: JoinRequest[] | null,
	page: number = 1,
): Promise<InteractionReplyOptions> {
	if (!joinRequests) joinRequests = [];
	const total = joinRequests.length;
	const pages = Math.ceil(total / 23);
	const current = Math.min(Math.max(page, 1), pages);
	const start = (current - 1) * 23;
	const selected = joinRequests.slice(start, start + 23);

	let guild = await guilds.getGuilds(
		selected.map((joinRequest) => joinRequest.guildid),
	);
	if (!guild) guild = [];
	const items = [
		new StringSelectMenuOptionBuilder()
			.setLabel("Go Back")
			.setDescription("Return to the main menu")
			.setValue("back")
			.setEmoji("↩️"),
		new StringSelectMenuOptionBuilder()
			.setLabel("View Members")
			.setDescription("See all pending join requests")
			.setValue("members")
			.setEmoji("🆕"),
		...selected.map((jr) =>
			new StringSelectMenuOptionBuilder()
				.setLabel(
					`${guild.find((guild) => guild.id === jr.guildid)?.name} | ${jr.id}` ||
						"Unknown",
				)
				.setDescription(jr.guildid)
				.setValue(`jr:${jr.id}`),
		),
	];

	const embed = new EmbedBuilder()
		.setTitle("Setup - Join Requests")
		.setDescription(
			[
				`You are the master of the Network: **${network?.name || "Deleted"}**`,
				"",
				`**Pending Join Requests:** ${total}`,
				`**Join Key:** ${network?.joinkey || "Deleted"}`,
			].join("\n"),
		);

	const components: ActionRowBuilder[] = [];

	components.push(
		new ActionRowBuilder<StringSelectMenuBuilder>({
			components: [
				new StringSelectMenuBuilder()
					.setCustomId("joinrequests:main")
					.setMaxValues(1)
					.setOptions(items),
			],
		}),
	);

	if (pages > 1) {
		components.push(
			new ActionRowBuilder<ButtonBuilder>({
				components: [
					new ButtonBuilder()
						.setCustomId(`joinrequests:page:${current - 1}`)
						.setEmoji("◀️")
						.setDisabled(current - 1 < 1)
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId("disabled")
						.setLabel(`Page ${current}/${pages}`)
						.setDisabled(true)
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId(`joinrequests:page:${current + 1}`)
						.setEmoji("▶️")
						.setDisabled(current + 1 > pages)
						.setStyle(ButtonStyle.Secondary),
				],
			}),
		);
	}

	return {
		embeds: [embed],
		components: components.map((component) => component.toJSON()),
		flags: MessageFlags.Ephemeral,
	};
}

export async function joinRequestDetail(
	joinRequest: JoinRequest,
): Promise<InteractionReplyOptions> {
	const guild = ((await guilds.getGuilds([joinRequest.guildid])) || [])[0];
	const name = guild ? guild.name : "Unknown";

	const embed = new EmbedBuilder()
		.setTitle(`Viewing Join request: ${name}`)
		.setDescription(
			[
				`**ID:** ${joinRequest.id}`,
				`**Guild ID:** ${joinRequest.guildid}`,
				`**Message:** ${joinRequest.message}`,
			].join("\n"),
		);

	const row = new ActionRowBuilder<ButtonBuilder>({
		components: [
			new ButtonBuilder()
				.setCustomId("joinrequests:overview")
				.setEmoji("↩️")
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId(`joinrequests:accept:${joinRequest.id}`)
				.setStyle(ButtonStyle.Success)
				.setLabel("Accept"),
			new ButtonBuilder()
				.setCustomId(`joinrequests:decline:${joinRequest.id}`)
				.setStyle(ButtonStyle.Danger)
				.setLabel("Decline"),
		],
	});

	return {
		embeds: [embed],
		components: [row],
		flags: MessageFlags.Ephemeral,
	};
}
