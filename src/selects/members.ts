import type { StringSelectMenuInteraction } from "discord.js";
import { networks, nodes } from "../db/index.js";
import { memberDetail, memberMenu } from "../messages/members.js";
import { AppError } from "../structures/apperror.js";
import { SelectHandler } from "../structures/selecthandler.js";
import { NodeType } from "../types/node.js";
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
		if (!action) throw new AppError("UNKNOWN_SELECT_MENU");

		if (action.split(":")[0] === "page") {
			const page = interaction.customId.split(":")[1];
			const networkNodes = await networks.getNodes(node.network.id);

			await interaction.reply(
				await memberMenu(node.network, networkNodes, parseInt(page || "1", 10)),
			);
			return;
		}
		if (action.split(":")[0] === "member") {
			const guildId = action.split(":")[1];
			if (!guildId) throw new AppError("NOT_FOUND");

			const node = await nodes.getNode(guildId);
			if (!node) throw new AppError("NOT_FOUND");

			await interaction.reply(await memberDetail(node));
			return;
		}
	}
}
