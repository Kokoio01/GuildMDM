import type { Guild } from "discord.js";
import { safeQuery } from "../utils.js";

interface DBGuild {
	id: string;
	shardId: number;
	name: string;
	updatedAt: Date;
}

export class guild {
	public async massUpsertGuilds(guilds: Guild[]): Promise<void> {
		const ids = guilds.map((g) => g.id);
		const names = guilds.map((g) => g.name);
		const shardIds = guilds.map((g) => g.shardId);

		await safeQuery(
			"INSERT INTO guilds (id, shardId, name, updatedAt) SELECT unnest($1::text[]),unnest($2::int[]),unnest($3::text[]), NOW() ON CONFLICT (id) DO UPDATE SET shardId = EXCLUDED.shardId,name = EXCLUDED.name,updatedAt = EXCLUDED.updatedAt;",
			[ids, shardIds, names],
		);
	}

	public async massDeleteGuilds(guilds: Guild[]): Promise<void> {
		const ids = guilds.map((g) => g.id);

		await safeQuery("DELETE FROM guilds WHERE id = ANY($1::text[])", [ids]);
	}

	public async getGuilds(ids: string[]): Promise<DBGuild[] | null> {
		const result = await safeQuery(
			"SELECT id, shardId, name, updatedAt FROM guilds WHERE id = ANY($1::text[])",
			[ids],
		);
		if (!result) return null;
		return result.rows as DBGuild[];
	}
}
