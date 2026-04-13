import type { AnySelectMenuInteraction } from "discord.js";

export abstract class SelectHandler {
	public abstract name: string;

	abstract execute(interaction: AnySelectMenuInteraction): Promise<void>;
}
