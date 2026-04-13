import { type Interaction, MessageFlags } from "discord.js";
import type { ButtonHandler } from "../structures/buttonhandler.js";
import { GatewayEvent } from "../structures/gatewayevent.js";
import type { SelectHandler } from "../structures/selecthandler.js";

export default class InteractionCreate extends GatewayEvent {
	public name: string = "interactionCreate";

	async execute(interaction: Interaction): Promise<void> {
		if (interaction.isChatInputCommand()) {
			const command = this.client.slashcommands.get(interaction.commandName);
			if (!command) return;

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);

				await interaction.reply({
					content: "An Error accrued while executing this command",
					flags: MessageFlags.Ephemeral,
				});
			}
		}
		if (interaction.isMessageComponent()) {
			const componentname =
				interaction.customId.split(":")[0] || "ERROR_BUTTON_NOT_FOUND";
			try {
				if (interaction.isButton()) {
					const component: ButtonHandler | undefined =
						this.client.buttons.get(componentname);
					if (component) return await component.execute(interaction);
				}
				if (interaction.isAnySelectMenu()) {
					const component: SelectHandler | undefined =
						this.client.selects.get(componentname);
					if (component) return await component.execute(interaction);
				}
			} catch (error) {
				console.error(error);

				await interaction.reply({
					content: "An Error accrued while executing this command",
					flags: MessageFlags.Ephemeral,
				});
			}
		}
	}
}
