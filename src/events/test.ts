import type { ChatInputCommandInteraction } from "discord.js";
import { InternalEvent } from "../structures/internalevent.js";

export default class TestEvent extends InternalEvent<"test"> {
	public name: "test" = "test";

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.reply("Test");
	}
}
