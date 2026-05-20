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
import type { JoinRequest, Network } from "../types/network.js";
import type { Node } from "../types/node.js";

export async function joinRequestMenu(
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
		selected.map((request) => request.guildid),
	);
	if (!guild) guild = [];
	const items = [
		...(current - 1 > 1
			? [
					new StringSelectMenuOptionBuilder()
						.setEmoji("◀️")
						.setLabel("Go Back")
						.setValue(`joinrequests:page:${current - 1}`),
				]
			: []),
		...selected.map((node) =>
			new StringSelectMenuOptionBuilder()
				.setLabel(
					guild.find((guild) => guild.id === node.guildid)?.name || "Unknown",
				)
				.setDescription(node.guildid)
				.setValue(`joinrequests:${node.guildid}`),
		),
		...(selected.length < 1
			? [
					new StringSelectMenuOptionBuilder()
						.setLabel("No pending Join Requests")
						.setDescription("Return when there are pending Join Requests.")
						.setValue("disabled"),
				]
			: []),
		...(current + 1 < pages
			? [
					new StringSelectMenuOptionBuilder()
						.setEmoji("▶️")
						.setLabel("Go forward")
						.setValue(`joinrequests:page:${current + 1}`),
				]
			: []),
	];

	const container = new ContainerBuilder()
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder({
						content: `**Setup/Join Requests**\n-# You are managing **${network.name || "Deleted"}**`,
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
					"Use the Select Menu below to select which Join Request you want to look ath.",
					"",
					`**Join Key:** ${network.joinkey || "Deleted"}`,
					`**Pending Requests:** ${joinRequests.length || 0}`,
				].join("\n"),
			}),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addActionRowComponents(
			new ActionRowBuilder<StringSelectMenuBuilder>({
				components: [
					new StringSelectMenuBuilder({
						customId: "joinrequests:main",
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
		flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
	};
}

export async function joinRequestDetail(
	joinRequest: JoinRequest,
	node: Node, // The Node of the managing Sever not JR one
): Promise<InteractionReplyOptions> {
	const guild = ((await guilds.getGuilds([joinRequest.guildid])) || [])[0];
	const name = guild ? guild.name : "Unknown";

	const container = new ContainerBuilder()
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder({
						content: `**Setup/Join Requests**\n-# You are managing **${node.network.name || "Deleted"}**`,
					}),
				)
				.setButtonAccessory(
					new ButtonBuilder()
						.setCustomId("joinrequests")
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
					"",
					`**Message:** ${joinRequest.message}`,
				].join("\n"),
			}),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addActionRowComponents(
			new ActionRowBuilder<ButtonBuilder>({
				components: [
					new ButtonBuilder()
						.setCustomId(`joinrequests:accept:${joinRequest.id}`)
						.setStyle(ButtonStyle.Success)
						.setLabel("Accept"),
					new ButtonBuilder()
						.setCustomId(`joinrequests:decline:${joinRequest.id}`)
						.setStyle(ButtonStyle.Danger)
						.setLabel("Decline"),
				],
			}),
		);

	return {
		components: [container],
		flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
	};
}
