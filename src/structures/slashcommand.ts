import type {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";

export abstract class SlashCommand {
	public readonly data: SlashCommandBuilder;

	constructor(data: SlashCommandBuilder) {
		this.data = data;
	}

	abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
