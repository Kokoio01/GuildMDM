import { MessageFlags, type ModalSubmitInteraction } from "discord.js";
import { nodes } from "../db/index.js";
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

export default class MembersModal extends ModalHandler {
	name = "members";

	async execute(interaction: ModalSubmitInteraction): Promise<void> {
		if (!ensureGuild(interaction)) return;
		const admin = await validateAdmin(interaction);
		const node = await ensureNodeType(interaction, NodeType.master);
		if (!admin || !node) return;
		const action = interaction.customId.split(":")[1];
		if (!action) throw new AppError("UNKNOWN_MODAL");

		switch (action) {
			case "kick": {
				const guildId = interaction.customId.split(":")[2] || "0";
				await interaction.deferReply({ flags: MessageFlags.Ephemeral });

				const leaver = await nodes.getNode(guildId);
				if (!leaver || leaver.network.id !== node.network.id) {
					throw new AppError("NO_NETWORK");
				}

				try {
					lockManager.lock(LockType.Node, leaver.id);

					await nodes.deleteNode(leaver.guildid);

					internalBus.emit("network_leave", node.guildid, leaver.guildid);

					await interaction.followUp(
						successMessage(
							"Deleted",
							"The Node has been kicked from the Network.",
						),
					);
				} finally {
					lockManager.release(LockType.Node, leaver.id);
				}
			}
		}
	}
}
