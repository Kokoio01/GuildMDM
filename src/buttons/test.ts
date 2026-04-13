import type { ButtonInteraction } from "discord.js";
import { ButtonHandler } from "../structures/buttonhandler.js";

export default class TestButton extends ButtonHandler {
	public name: string = "test";

	async execute(interaction: ButtonInteraction): Promise<void> {
		await interaction.reply("Test! wuhhh!");
	}
}
