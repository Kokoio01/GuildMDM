import type { Interaction } from "discord.js";
import { nodes } from "../db/index.js";
import { error } from "../messages/feedback.js";
import { AppError } from "../structures/apperror.js";
import type { ButtonHandler } from "../structures/buttonhandler.js";
import { GatewayEvent } from "../structures/gatewayevent.js";
import type { ModalHandler } from "../structures/modalhandler.js";
import type { SelectHandler } from "../structures/selecthandler.js";
import { logger } from "../utils/logger.js";

export default class InteractionCreate extends GatewayEvent {
	public name: string = "interactionCreate";

	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isAutocomplete()) {
			try {
				if (interaction.isChatInputCommand()) {
					const command = this.client.slashcommands.get(
						interaction.commandName,
					);
					if (!command) throw new AppError("UNKNOWN_CMD");

					await command.execute(interaction);
				}
				if (interaction.isMessageComponent()) {
					const componentname =
						interaction.customId.split(":")[0] || "ERROR_BUTTON_NOT_FOUND";

					if (interaction.isButton()) {
						const component: ButtonHandler | undefined =
							this.client.buttons.get(componentname);
						if (!component) throw new AppError("UNKNOWN_BUTTON");
						return await component.execute(interaction);
					}
					if (interaction.isAnySelectMenu()) {
						const component: SelectHandler | undefined =
							this.client.selects.get(componentname);
						if (!component) throw new AppError("UNKNOWN_SELECT_MENU");
						return await component.execute(interaction);
					}
				}

				if (interaction.isModalSubmit()) {
					const componentname =
						interaction.customId.split(":")[0] || "ERROR_MODAL_NOT_FOUND";
					const component: ModalHandler | undefined =
						this.client.modals.get(componentname);
					if (!component) throw new AppError("UNKNOWN_MODAL");
					return await component.execute(interaction);
				}
			} catch (err) {
				const node = interaction.guild
					? await nodes.getNode(interaction.guild.id)
					: undefined;

				if (!(err instanceof AppError)) logger.error(err);
				const appError =
					err instanceof AppError ? err : new AppError("UNEXPECTED");

				const replyOptions = error(appError, node);
				await (interaction.replied || interaction.deferred
					? interaction.followUp(replyOptions)
					: interaction.reply(replyOptions));
			}
		}
	}
}
