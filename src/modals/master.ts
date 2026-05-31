import { MessageFlags, type ModalSubmitInteraction } from "discord.js";
import { networks } from "../db/index.js";
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

export default class MasterModal extends ModalHandler {
	name = "master";

	async execute(interaction: ModalSubmitInteraction): Promise<void> {
		if (!ensureGuild(interaction)) return;
		const admin = await validateAdmin(interaction);
		const node = await ensureNodeType(interaction, NodeType.master);
		if (!admin || !node) return;
		const action = interaction.customId.split(":")[1];
		if (!action) throw new AppError("UNKNOWN_MODAL");

		switch (action) {
			case "rename": {
				await interaction.deferReply({ flags: MessageFlags.Ephemeral });
				const name = interaction.fields.getTextInputValue("name");
				if (name.length > 200 || name.length < 2) {
					throw new AppError("INVALID_NET_NAME");
				}

				try {
					lockManager.lock(LockType.Network, node.network.id);

					await networks.updateNetwork(node.network.id, name);

					await interaction.followUp(
						successMessage(
							"Network renamed",
							`The Network has been renamed to **${name}**`,
						),
					);
				} finally {
					lockManager.release(LockType.Network, node.network.id);
				}
				return;
			}
			case "delete": {
				await interaction.deferReply({ flags: MessageFlags.Ephemeral });
				try {
					lockManager.lock(LockType.Network, node.network.id);

					const networkNodes = await networks.getNodes(node.network.id);

					await networks.deleteNetwork(node.network.id);

					networkNodes?.forEach((node) => {
						internalBus.emit("network_disband", node.guildid, node.network);
					});

					await interaction.followUp(
						successMessage("Deleted", "The Network has been deleted."),
					);
				} finally {
					lockManager.release(LockType.Network, node.network.id);
				}
				return;
			}
		}
	}
}
