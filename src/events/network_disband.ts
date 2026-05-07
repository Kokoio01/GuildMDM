import { EmbedBuilder } from "discord.js";
import { InternalEvent } from "../structures/internalevent.js";
import type { Network } from "../types/network.js";

export default class Disband extends InternalEvent<"network_disband"> {
	public name: "network_disband" = "network_disband";

	// sent to guilds separately, not per network
	async execute(guildId: string, network: Network): Promise<void> {
		const guild = this.client.guilds.cache.get(guildId);
		if (!guild) return;

		const channel = guild.systemChannel;
		if (!channel) return;

		const embed = new EmbedBuilder()
			.setTitle("Network Deleted")
			.setDescription(
				`Network ${network.name} has been deleted by the network owner.` +
					"This server has been automatically removed from the network.",
			);

		await channel.send({ embeds: [embed] });
	}
}
