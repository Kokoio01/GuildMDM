import type { ModalSubmitInteraction } from "discord.js";
import { networks, nodes } from "../db/index.js";
import { AppError } from "../structures/apperror.js";
import { ModalHandler } from "../structures/modalhandler.js";
import { NodeType } from "../types/node.js";
import { internalBus } from "../utils/eventBus.js";
import { LockType, lockManager } from "../utils/lockManager.js";
import { successMessage } from "../utils/messages.js";
import {
	ensureGuild,
	ensureNodeType,
	validateAdmin,
} from "../utils/permissions.js";

export default class NodeModal extends ModalHandler {
	name = "node";

	async execute(interaction: ModalSubmitInteraction): Promise<void> {
		if (!ensureGuild(interaction)) return;
		const admin = await validateAdmin(interaction);
		const node = await ensureNodeType(interaction, NodeType.normal);
		if (!admin || !node) return;
		const action = interaction.customId.split(":")[1];
		if (!action) throw new AppError("UNKNOWN_MODAL");

		switch (action) {
			case "leave": {
				await interaction.deferReply();

				const master = await networks.getMasterNode(node.network.id);
				if (!master) throw new AppError("NO_NETWORK");

				try {
					lockManager.lock(LockType.Node, node.id);

					await nodes.deleteNode(node.guildid);

					internalBus.emit("network_leave", master.guildid, node.guildid);

					await interaction.followUp(
						successMessage("Goodbye!", "The Node has been left the Network."),
					);
				} finally {
					lockManager.release(LockType.Node, node.id);
				}
			}
		}
	}
}
