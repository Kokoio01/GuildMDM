import type { ModalSubmitInteraction } from "discord.js";
import { joinrequests, networks, nodes } from "../db/index.js";
import { masterMenu } from "../messages/master.js";
import { AppError } from "../structures/apperror.js";
import { ModalHandler } from "../structures/modalhandler.js";
import type { Network } from "../types/network.js";
import { successMessage } from "../utils/messages.js";
import { ensureGuild, validateAdmin } from "../utils/permissions.js";

export default class SetupModal extends ModalHandler {
	public name: string = "setup";

	async execute(interaction: ModalSubmitInteraction): Promise<void> {
		if (!ensureGuild(interaction)) return;
		if (!(await validateAdmin(interaction))) return;
		const action = interaction.customId.split(":")[1];
		if (!action) throw new AppError("UNKNOWN_MODAL");
		const adminGuild = process.env.ADMIN_GUILD as string;

		switch (action) {
			case "netsetup": {
				if (adminGuild && adminGuild !== interaction.guild?.id) {
					throw new AppError("CREATION_RESTRICTED");
				}
				const name = interaction.fields.getTextInputValue("name");
				const node = await nodes.getNode(interaction.guild.id);

				if (node) {
					throw new AppError("ALREADY_NETWORK");
				} else {
					const network = await networks.createNetwork(
						name,
						interaction.guild.id,
					);

					await interaction.reply(masterMenu(network || ({} as Network)));
				}
				return;
			}
			case "nodesetup": {
				const joinKey = interaction.fields.getTextInputValue("joinkey");
				const message = interaction.fields.getTextInputValue("message");
				if (adminGuild) {
					const adminNode = await nodes.getNode(adminGuild);
					if (!adminNode) {
						throw new AppError("NONE_NETWORK");
					} else {
						await joinrequests.createJoinRequest(
							interaction.guild.id,
							adminNode.network.id,
							message,
						);

						await interaction.reply(
							successMessage(
								"Application submitted",
								"Your Application has been submitted to the Network Owner. They will respond to you as soon as possible.",
							),
						);
					}
				} else {
					const network = await networks.getNetworkByJoinKey(joinKey);
					if (!network) {
						throw new AppError("NOT_FOUND");
					} else {
						await joinrequests.createJoinRequest(
							interaction.guild.id,
							network.id,
							message,
						);

						await interaction.reply(
							successMessage(
								"Application submitted",
								"Your Application has been submitted to the Network Owner. They will respond to you as soon as possible.",
							),
						);
					}
				}
				return;
			}
		}
	}
}
