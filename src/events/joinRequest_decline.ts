import { EmbedBuilder } from "discord.js";
import { InternalEvent } from "../structures/internalevent.js";
import type { Network } from "../types/network.js";

export default class Disband extends InternalEvent<"joinRequest_decline"> {
	public name: "joinRequest_decline" = "joinRequest_decline";

	// sent to guilds separately, not per network
	async execute(guildId: string, network: Network): Promise<void> {
		const guild = this.client.guilds.cache.get(guildId);
		if (!guild) return;

		const channel = guild.systemChannel;
		if (!channel) return;

		const embed = new EmbedBuilder()
			.setTitle("Join Request Declined")
			.setDescription(
				`Your Join Request to join the network ${network.name} has been declined.`
			);

		await channel.send({ embeds: [embed] });
	}
}
