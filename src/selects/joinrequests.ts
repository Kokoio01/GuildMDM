import type { StringSelectMenuInteraction } from "discord.js";
import { joinrequests } from "../db/index.js";
import {
	joinRequestDetail,
	joinRequestMenu,
} from "../messages/joinrequests.js";
import { SelectHandler } from "../structures/selecthandler.js";
import { RequestStatus } from "../types/network.js";
import { NodeType } from "../types/node.js";
import {
	ensureGuild,
	ensureNodeType,
	validateAdmin,
} from "../utils/permissions.js";

export default class JoinRequestSelect extends SelectHandler {
	name = "joinrequests";

	async execute(interaction: StringSelectMenuInteraction) {
		if (!ensureGuild(interaction)) return;
		const admin = await validateAdmin(interaction);
		const node = await ensureNodeType(interaction, NodeType.master);
		if (!admin || !node) return;
		const action = interaction.values[0];
		if (!action) return;

		if (action.split(":")[0] === "page") {
			const page = interaction.customId.split(":")[2];

			const joinRequests = await joinrequests.getJoinRequests(
				node.network.id,
				RequestStatus.PENDING,
			);

			await interaction.reply(
				await joinRequestMenu(
					node.network,
					joinRequests,
					parseInt(page || "1", 10),
				),
			);
			return;
		}
		if (action.split(":")[0] === "jr") {
			const requestId = action.split(":")[1];
			if (!requestId) return;

			const request = await joinrequests.getJoinRequest(requestId);
			if (!request) return;

			await interaction.reply(await joinRequestDetail(request, node));
			return;
		}
	}
}
