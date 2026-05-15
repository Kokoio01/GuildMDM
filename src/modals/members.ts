import { MessageFlags, type ModalSubmitInteraction } from "discord.js";
import { networks, nodes } from "../db/index.js";
import { ModalHandler } from "../structures/modalhandler.js";
import { NodeType } from "../types/node.js";
import { internalBus } from "../utils/eventBus.js";
import { logger } from "../utils/logger.js";
import { errorMessage, successMessage } from "../utils/messages.js";
import {
	ensureGuild,
	ensureNodeType,
	validateAdmin,
} from "../utils/permissions.js";

// TODO: Move this to a proper Spot, this is not synced between setup and members and should really be in the DB
const workLocks = new Set<number>();

export default class MembersModal extends ModalHandler {
	name = "members";

	async execute(interaction: ModalSubmitInteraction): Promise<void> {
		if (!ensureGuild(interaction)) return;
		const admin = await validateAdmin(interaction);
		const node = await ensureNodeType(interaction, NodeType.master);
		if (!admin || !node) return;
		const action = interaction.customId.split(":")[1];
		if (!action) return;

		switch (action) {
			case "kick": {
				const guildId = interaction.customId.split(":")[2] || "0";
				await interaction.deferReply({ flags: MessageFlags.Ephemeral });

				const node = await nodes.getNode(guildId);
				if (!node || node.type !== NodeType.normal) return;

				if (workLocks.has(node.id)) {
					await interaction.followUp(
						errorMessage(
							"Leaving in progress",
							"This node is already leaving the network.",
						),
					);
					return;
				}

				const master = await networks.getMasterNode(node.networkid);
				if (!master) {
					await interaction.followUp(
						errorMessage(
							"This Node is not part of a Network!",
							"Please make sure that you are in a Network and that the Network exists!",
						),
					);
					return;
				}

				try {
					workLocks.add(node.id);

					await nodes.deleteNode(node.guildid);

					internalBus.emit("network_leave", master.guildid, node.guildid);

					await interaction.followUp(
						successMessage(
							"Deleted",
							"The Node has been kicked from the Network.",
						),
					);
				} catch (err) {
					logger.error(err);
					await interaction.followUp(
						errorMessage(
							"Error",
							"An error occurred while deleting the Network. Please try again later.",
						),
					);
				} finally {
					workLocks.delete(node.id);
				}
			}
		}
	}
}
