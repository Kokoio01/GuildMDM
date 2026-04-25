import type { ModalSubmitInteraction } from "discord.js";

export abstract class ModalHandler {
	public abstract name: string;

	abstract execute(interaction: ModalSubmitInteraction): Promise<void>;
}
