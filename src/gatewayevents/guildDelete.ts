import type { Guild } from "discord.js";
import { GatewayEvent } from "../structures/gatewayevent.js";
import { guildHandler } from "../utils/guildHandler.js";

export default class GuildDelete extends GatewayEvent {
	public name: string = "guildDelete";

	async execute(guild: Guild): Promise<void> {
		await guildHandler.deleteGuilds([guild]);
	}
}
