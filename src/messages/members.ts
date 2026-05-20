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
	StringSelectMenuOptionBuilder,
	TextDisplayBuilder,
} from "discord.js";
import { guilds } from "../db/index.js";
import type { Network } from "../types/network.js";
import { type Node, NodeType } from "../types/node.js";

export async function memberMenu(
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
		...(current - 1 > 1
			? [
					new StringSelectMenuOptionBuilder()
						.setEmoji("◀️")
						.setLabel("Go Back")
						.setValue(`members:page:${current - 1}`),
				]
			: []),
		...selected.map((node) =>
			new StringSelectMenuOptionBuilder()
				.setLabel(
					guild.find((guild) => guild.id === node.guildid)?.name || "Unknown",
				)
				.setDescription(node.guildid)
				.setValue(`member:${node.guildid}`),
		),
		...(current + 1 < pages
			? [
					new StringSelectMenuOptionBuilder()
						.setEmoji("▶️")
						.setLabel("Go forward")
						.setValue(`members:page:${current + 1}`),
				]
			: []),
	];

	const container = new ContainerBuilder()
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder({
						content: `**Setup/Members**\n-# You are managing **${network.name || "Deleted"}**`,
					}),
				)
				.setButtonAccessory(
					new ButtonBuilder()
						.setCustomId("master")
						.setEmoji("↩️")
						.setStyle(ButtonStyle.Secondary),
				),
		)

		.addTextDisplayComponents(
			new TextDisplayBuilder({
				content: [
					"Use the Select Menu below to select the Server in your Network you want to manage.",
					"",
					`**Join Key:** ${network.joinkey || "Deleted"}`,
					`**Members:** ${nodes.length || 0}`,
				].join("\n"),
			}),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addActionRowComponents(
			new ActionRowBuilder<StringSelectMenuBuilder>({
				components: [
					new StringSelectMenuBuilder({
						customId: "members:main",
						options: [...items.map((item) => item?.toJSON())],
					}),
				],
			}),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder({ content: `-# Page ${current}/${pages}` }),
		);

	return {
		components: [container],
		flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral]
	};
}

export async function memberDetail(
	node: Node,
): Promise<InteractionReplyOptions> {
	const guild = ((await guilds.getGuilds([node.guildid])) || [])[0];
	const name = guild ? guild.name : "Unknown";

	const container = new ContainerBuilder()
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder({
						content: `**Setup/Members**\n-# You are managing **${node.network.name || "Deleted"}**`,
					}),
				)
				.setButtonAccessory(
					new ButtonBuilder()
						.setCustomId("members")
						.setEmoji("↩️")
						.setStyle(ButtonStyle.Secondary),
				),
		)

		.addTextDisplayComponents(
			new TextDisplayBuilder({
				content: [
					`**Viewing: ${name || "Removed"}**`,
					"",
					`**ID:** ${node.id}`,
					`**Guild ID:** ${node.guildid}`,
					`**Type:** ${node.type === NodeType.master ? "Master" : "Member"}`,
				].join("\n"),
			}),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addActionRowComponents(
			new ActionRowBuilder<ButtonBuilder>({
				components: [
					new ButtonBuilder()
						.setCustomId(`members:kick:${node.guildid}`)
						.setStyle(ButtonStyle.Danger)
						.setLabel("Kick from Network")
						.setDisabled(node.type === NodeType.master),
				],
			}),
		);

	return {
		components: [container],
		flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
	};
}
