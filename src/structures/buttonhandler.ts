import type { ButtonInteraction } from "discord.js";

export abstract class ButtonHandler {
	public abstract name: string;

	abstract execute(interaction: ButtonInteraction): Promise<void>;
}
