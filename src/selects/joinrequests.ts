import type { StringSelectMenuInteraction } from "discord.js";
import { joinrequests, networks } from "../db/index.js";
import {
	joinRequestDetail,
	masterMessage,
	memberMessage,
} from "../messages/setup.js";
import { SelectHandler } from "../structures/selecthandler.js";
import { NodeType } from "../types/node.js";
import { errorMessage } from "../utils/messages.js";
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
			case "members": {
				const network = await networks.getNetwork(node.networkid);
				if (!network) {
					await interaction.reply(
						errorMessage(
							"This Network does not exist!",
							"Please make sure that you are in a Network and that the Network exists!",
						),
					);
					return;
				}
				const networkNodes = await networks.getNodes(network.id);

				await interaction.reply(await memberMessage(network, networkNodes, 0));
				return;
			}
		}
		if (action.split(":")[0] === "jr") {
			const requestId = action.split(":")[1];
			if (!requestId) return;

			const request = await joinrequests.getJoinRequest(requestId);
			if (!request) return;

			await interaction.reply(await joinRequestDetail(request));
			return;
		}
	}
}
