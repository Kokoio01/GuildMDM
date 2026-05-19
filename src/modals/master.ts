import type { ModalSubmitInteraction } from "discord.js";
import { networks } from "../db/index.js";
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

export default class MasterModal extends ModalHandler {
	name = "master";

	async execute(interaction: ModalSubmitInteraction): Promise<void> {
		if (!ensureGuild(interaction)) return;
		const admin = await validateAdmin(interaction);
		const node = await ensureNodeType(interaction, NodeType.master);
		if (!admin || !node) return;
		const action = interaction.customId.split(":")[1];
		if (!action) return;

		const network = await networks.getNetwork(node.networkid);
		if (!network) {
			await interaction.followUp(
				errorMessage(
					"This Network does not exist!",
					"Please make sure that you are in a Network and that the Network exists!",
				),
			);
			return;
		}

		switch (action) {
			case "rename": {
				const name = interaction.fields.getTextInputValue("name");
				if (name.length > 200 || name.length < 2) {
					await interaction.followUp(
						errorMessage(
							"Invalid Name",
							"The name must be between 2 and 200 characters long.",
						),
					);
					return;
				}

				try {
					workLocks.add(network.id);

					await networks.updateNetwork(network.id, name);

					await interaction.followUp(
						successMessage(
							"Network renamed",
							`The Network has been renamed to **${name}**`,
						),
					);
				} catch (err) {
					logger.error(err);
					await interaction.followUp(
						errorMessage(
							"Error",
							"An error occurred while renaming the Network. Please try again later.",
						),
					);
				} finally {
					workLocks.delete(network.id);
				}
				return;
			}
			case "delete": {
				try {
					workLocks.add(network.id);

					const networkNodes = await networks.getNodes(network.id);

					await networks.deleteNetwork(network.id);

					networkNodes?.forEach((node) => {
						internalBus.emit("network_disband", node.guildid, network);
					});

					await interaction.followUp(
						successMessage("Deleted", "The Network has been deleted."),
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
					workLocks.delete(network.id);
				}
				return;
			}
		}
	}
}
