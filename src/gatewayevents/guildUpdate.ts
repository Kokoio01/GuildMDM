import type { Guild } from "discord.js";
import { GatewayEvent } from "../structures/gatewayevent.js";
import { guildHandler } from "../utils/guildHandler.js";

export default class GuildUpdate extends GatewayEvent {
	public name: string = "guildUpdate";

	async execute(_oldGuild: Guild, newGuild: Guild): Promise<void> {
		await guildHandler.pushGuilds([newGuild]);
	}
}
