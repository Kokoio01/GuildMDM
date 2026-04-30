import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
	SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../structures/slashcommand.js";

export default class PingCommand extends SlashCommand {
	constructor() {
		super(
			new SlashCommandBuilder()
				.setName("ping")
				.setDescription("Check the Bot's ping"),
		);
	}

	async execute(interaction: ChatInputCommandInteraction) {
		const embed = new EmbedBuilder()
			.setTitle("Bot Ping")
			.setColor(0x1f6f5f)
			.setDescription(
				[`Websocket Ping: ${interaction.client.ws.ping}`].join("\n"),
			);

		await interaction.reply({
			embeds: [embed],
			flags: MessageFlags.Ephemeral,
		});
	}
}
