import type { StringSelectMenuInteraction } from "discord.js";
import { networks, nodes } from "../db/index.js";
import { masterMessage, memberDetail } from "../messages/setup.js";
import { SelectHandler } from "../structures/selecthandler.js";
import { NodeType } from "../types/node.js";
import { errorMessage } from "../utils/messages.js";
import {
	ensureGuild,
	ensureNodeType,
	validateAdmin,
} from "../utils/permissions.js";

export default class MembersSelect extends SelectHandler {
	name = "members";

	async execute(interaction: StringSelectMenuInteraction) {
		if (!ensureGuild(interaction)) return;
		const admin = await validateAdmin(interaction);
		const node = await ensureNodeType(interaction, NodeType.master);
		if (!admin || !node) return;
		const action = interaction.values[0];
		if (!action) return;

		switch (action) {
			case "back": {
				const network = await networks.getNetwork(node.networkid);
				if (!network) {
					await interaction.reply(
						errorMessage(
							"Not in a Network!",
							"This server isn't part of a network",
						),
					);
					return;
				}
				await interaction.reply(masterMessage(network));
				return;
			}
			case "joinrequests": {
				// TODO: JoinR
				return;
			}
		}
		if (action.split(":")[0] === "member") {
			const guildId = action.split(":")[1];
			if (!guildId) return;

			const node = await nodes.getNode(guildId);
			if (!node) return;

			await interaction.reply(await memberDetail(node));
			return;
		}
	}
}
