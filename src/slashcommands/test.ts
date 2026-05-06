import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../structures/slashcommand.js";
import { internalBus } from "../utils/eventBus.js";

export default class TestCommand extends SlashCommand {
	constructor() {
		super(new SlashCommandBuilder().setName("test").setDescription("test"));
	}

	async execute(interaction: ChatInputCommandInteraction) {
		internalBus.emit("test", interaction);
	}
}
