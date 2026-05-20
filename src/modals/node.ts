import type { ModalSubmitInteraction } from "discord.js";
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

export default class NodeModal extends ModalHandler {
	name = "node";

	async execute(interaction: ModalSubmitInteraction): Promise<void> {
		if (!ensureGuild(interaction)) return;
		const admin = await validateAdmin(interaction);
		const node = await ensureNodeType(interaction, NodeType.normal);
		if (!admin || !node) return;
		const action = interaction.customId.split(":")[1];
		if (!action) return;

		switch (action) {
			case "leave": {
				await interaction.deferReply();

				if (workLocks.has(node.id)) {
					await interaction.followUp(
						errorMessage(
							"Leaving in progress",
							"This node is already leaving the network.",
						),
					);
					return;
				}

				const master = await networks.getMasterNode(node.network.id);
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
						successMessage("Goodbye!", "The Node has been left the Network."),
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
