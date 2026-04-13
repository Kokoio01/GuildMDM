import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
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

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const embed = new EmbedBuilder()
			.setTitle("Bot Ping")
			.setColor(0x1f6f5f)
			.setDescription(
				[`Websocket Ping: ${interaction.client.ws.ping}`].join("\n"),
			);

		const row1 = new ActionRowBuilder<ButtonBuilder>({
			components: [
				new ButtonBuilder()
					.setLabel("Test")
					.setCustomId("test:test")
					.setStyle(ButtonStyle.Secondary),
			],
		});

		const row2 = new ActionRowBuilder<StringSelectMenuBuilder>({
			components: [
				new StringSelectMenuBuilder()
					.setCustomId("tests:test")
					.addOptions([{ label: "test", value: "test" }]),
			],
		});

		await interaction.reply({
			embeds: [embed],
			components: [row1, row2],
			flags: MessageFlags.Ephemeral,
		});
	}
}
