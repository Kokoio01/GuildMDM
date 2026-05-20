import type { ButtonInteraction } from "discord.js";
import { joinrequests, networks } from "../db/index.js";
import { joinRequestMenu } from "../messages/joinrequests.js";
import { ButtonHandler } from "../structures/buttonhandler.js";
import { RequestStatus } from "../types/network.js";
import { NodeType } from "../types/node.js";
import { internalBus } from "../utils/eventBus.js";
import { errorMessage, successMessage } from "../utils/messages.js";
import {
	ensureGuild,
	ensureNodeType,
	validateAdmin,
} from "../utils/permissions.js";

export default class JoinRequestButton extends ButtonHandler {
	name = "joinrequests";

	async execute(interaction: ButtonInteraction): Promise<void> {
		if (!ensureGuild(interaction)) return;
		const admin = await validateAdmin(interaction);
		const node = await ensureNodeType(interaction, NodeType.master);
		if (!admin || !node) return;
		const action = interaction.customId.split(":")[1];
		if (!action) return;

		switch (action) {
			case "accept": {
				const requestId = interaction.customId.split(":")[2];
				if (!requestId) return;

				const joinRequest = await joinrequests.getJoinRequest(requestId);
				if (!joinRequest || joinRequest.status !== RequestStatus.PENDING) {
					await interaction.reply(
						errorMessage(
							"Join Request not found",
							"This Join Request doesn't exist or is not pending!",
						),
					);
					return;
				}

				const network = await networks.getNetwork(joinRequest.networkid);
				if (!network) return;

				// TODO: Actually Error handle this when db fails
				await joinrequests.acceptJoinRequest(joinRequest);
				internalBus.emit("joinRequest_accept", joinRequest.guildid, network);
				await interaction.reply(
					successMessage(
						"Join Request accepted",
						"The Join Request has been accepted!",
					),
				);
				return;
			}
			case "decline": {
				const requestId = interaction.customId.split(":")[2];
				if (!requestId) return;

				const joinRequest = await joinrequests.getJoinRequest(requestId);
				if (!joinRequest || joinRequest.status !== RequestStatus.PENDING) {
					await interaction.reply(
						errorMessage(
							"Join Request not found",
							"This Join Request doesn't exist or is not pending!",
						),
					);
					return;
				}

				const network = await networks.getNetwork(joinRequest.networkid);
				if (!network) return;

				// TODO: Actually Error handle this when db fails
				await joinrequests.denyJoinRequest(joinRequest);
				internalBus.emit("joinRequest_decline", joinRequest.guildid, network);
				await interaction.reply(
					successMessage(
						"Join Request declined",
						"The Join Request has been declined!",
					),
				);
				return;
			}
			default: {
				const joinRequests = await joinrequests.getJoinRequests(
					node.network.id,
					RequestStatus.PENDING,
				);

				await interaction.reply(
					await joinRequestMenu(node.network, joinRequests, 0),
				);
				return;
			}
		}
	}
}
