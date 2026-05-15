import { EmbedBuilder } from "discord.js";
import { InternalEvent } from "../structures/internalevent.js";
import type { Network } from "../types/network.js";

export default class Disband extends InternalEvent<"joinRequest_accept"> {
	public name: "joinRequest_accept" = "joinRequest_accept";

	// sent to guilds separately, not per network
	async execute(guildId: string, network: Network): Promise<void> {
		const guild = this.client.guilds.cache.get(guildId);
		if (!guild) return;

		const channel = guild.systemChannel;
		if (!channel) return;

		const embed = new EmbedBuilder()
			.setTitle("Join Request Accepted")
			.setDescription(
				`Your Join Request to join the network ${network.name} has been accepted.\n` +
					"This server has been automatically added to the network. All other join requests will be ignored.",
			);

		await channel.send({ embeds: [embed] });
	}
}
