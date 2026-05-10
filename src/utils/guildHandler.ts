import type { Guild } from "discord.js";
import { guilds } from "../db/index.js";
import { logger } from "./logger.js";

class GuildHandler {
	private running = false;
	private updateCache: Guild[] = [];
	private deleteCache: Guild[] = [];

	public async pushGuilds(guilds: Guild[]): Promise<void> {
		this.updateCache.push(...guilds);
	}

	public async deleteGuilds(guilds: Guild[]): Promise<void> {
		this.deleteCache.push(...guilds);
	}

	public async setRunning(running: boolean): Promise<void> {
		if (this.running === running) return;
		this.running = running;
		if (running)
			this.run().catch((err) => logger.error("Fatal loop error", err));
	}

	private async run() {
		if (!this.running) return;

		const updateSnapshot = [...this.updateCache];
		this.updateCache = [];
		const deleteSnapshot = [...this.deleteCache];
		this.deleteCache = [];

		if (updateSnapshot.length > 0) {
			try {
				await guilds.massUpsertGuilds(updateSnapshot);
			} catch (err) {
				logger.error(err);
				this.updateCache.unshift(...updateSnapshot);
			}
		}

		if (deleteSnapshot.length > 0) {
			try {
				await guilds.massDeleteGuilds(deleteSnapshot);
			} catch (err) {
				logger.error(err);
				this.deleteCache.unshift(...deleteSnapshot);
			}
		}

		setTimeout(() => this.run(), 30000); // 30 seconds
	}
}

export const guildHandler = new GuildHandler();
