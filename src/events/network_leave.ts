import { EmbedBuilder } from "discord.js";
import { InternalEvent } from "../structures/internalevent.js";

export default class Leave extends InternalEvent<"network_leave"> {
	public name: "network_leave" = "network_leave";

	// sent to guilds separately, not per network
	async execute(masterId: string, leavingId: string): Promise<void> {
		const masterGuild = this.client.guilds.cache.get(masterId);
		if (!masterGuild) return;

		const channel = masterGuild.systemChannel;
		if (!channel) return;

		const embed = new EmbedBuilder()
			.setTitle("Guild Left")
			.setDescription(
				`The guild ${leavingId} has left the network.` +
					"If you did not intend for this, contact the guild administrators.",
			);

		await channel.send({ embeds: [embed] });
	}
}
