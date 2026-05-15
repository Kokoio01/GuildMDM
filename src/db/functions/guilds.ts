import type { Guild } from "discord.js";
import { pool } from "../index.js";
import { safeQuery } from "../utils.js";

interface DBGuild {
	id: string;
	shardId: number;
	name: string;
	updatedAt: Date;
}

export class guild {
	/**
	 * Warning: throws error
	 */
	public async massUpsertGuilds(guilds: Guild[]): Promise<void> {
		const conn = await pool.connect();
		try {
			const ids = guilds.map((g) => g.id);
			const names = guilds.map((g) => g.name);
			const shardIds = guilds.map((g) => g.shardId);

			await conn.query(
				"INSERT INTO guilds (id, shardId, name, updatedAt) SELECT unnest($1::text[]),unnest($2::int[]),unnest($3::text[]), NOW() ON CONFLICT (id) DO UPDATE SET shardId = EXCLUDED.shardId,name = EXCLUDED.name,updatedAt = EXCLUDED.updatedAt;",
				[ids, shardIds, names],
			);
		} finally {
			conn.release();
		}
	}

	/**
	 * Warning: throws error
	 */
	public async massDeleteGuilds(guilds: Guild[]): Promise<void> {
		const conn = await pool.connect();
		try {
			const ids = guilds.map((g) => g.id);

			await conn.query("DELETE FROM guilds WHERE id = ANY($1::text[])", [ids]);
		} finally {
			conn.release();
		}
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
