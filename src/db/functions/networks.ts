import { nanoid } from "nanoid";
import type { Network } from "../../types/network.js";
import { pool } from "../index.js";

export class network {
	public async getNetwork(networkId: number): Promise<Network | null> {
		try {
			const conn = await pool.connect();

			const result = await conn.query(
				"SELECT * FROM networks WHERE id = $1 LIMIT 1",
				[networkId],
			);
			conn.release();
			return result.rows[0] as Network;
		} catch {
			return null;
		}
	}

	public async getNetworkByJoinKey(joinKey: string): Promise<Network | null> {
		try {
			const conn = await pool.connect();

			const result = await conn.query(
				"SELECT * FROM networks WHERE joinKey = $1 LIMIT 1",
				[joinKey],
			);

			conn.release();
			return result.rows[0] as Network;
		} catch {
			return null;
		}
	}

	public async createNetwork(
		name: string,
		guildId: string,
	): Promise<Network | null> {
		const conn = await pool.connect();
		try {
			const joinKey = nanoid(8);

			await conn.query("BEGIN");
			const result = await conn.query(
				"INSERT INTO networks (name, joinKey) VALUES ($1, $2) RETURNING *;",
				[name, joinKey],
			);
			await conn.query(
				"INSERT INTO nodes (guildid, networkId, type) VALUES ($1, $2, 1);",
				[guildId, result.rows[0].id],
			);
			await conn.query("COMMIT");

			conn.release();
			return result.rows[0] as Network;
		} catch {
			await conn.query("ROLLBACK");
			return null;
		}
	}
}
