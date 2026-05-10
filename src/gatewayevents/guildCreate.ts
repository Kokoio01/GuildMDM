import type { Guild } from "discord.js";
import { GatewayEvent } from "../structures/gatewayevent.js";
import { guildHandler } from "../utils/guildHandler.js";

export default class GuildCreate extends GatewayEvent {
	public name: string = "guildCreate";

	async execute(guild: Guild): Promise<void> {
		await guildHandler.pushGuilds([guild]);
	}
}
