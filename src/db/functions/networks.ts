import { nanoid } from "nanoid";
import type { Network } from "../../types/network.js";
import type { Node } from "../../types/node.js";
import { logger } from "../../utils/logger.js";
import { pool } from "../index.js";
import { safeQuery } from "../utils.js";

export class network {
	public async getNetwork(networkId: number): Promise<Network | null> {
		const result = await safeQuery(
			"SELECT * FROM networks WHERE id = $1 LIMIT 1",
			[networkId],
		);
		if (!result) return null;
		return result.rows[0] as Network;
	}

	public async getNetworkByJoinKey(joinKey: string): Promise<Network | null> {
		const result = await safeQuery(
			"SELECT * FROM networks WHERE joinKey = $1 LIMIT 1",
			[joinKey],
		);
		if (!result) return null;
		return result.rows[0] as Network;
	}

	public async getNodes(networkId: number): Promise<Node[] | null> {
		const result = await safeQuery("SELECT * FROM nodes WHERE networkId = $1", [
			networkId,
		]);
		if (!result) return null;
		return result.rows as Node[];
	}

	public async getMasterNode(networkId: number): Promise<Node | null> {
		const result = await safeQuery(
			"SELECT * FROM nodes WHERE networkId = $1 AND type = 1 LIMIT 1",
			[networkId],
		);
		if (!result) return null;
		return result.rows[0] as Node;
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

			return result.rows[0] as Network;
		} catch (err) {
			await conn.query("ROLLBACK");
			logger.error(err);
			return null;
		} finally {
			conn.release();
		}
	}

	public async updateNetwork(networkId: number, name: string): Promise<void> {
		// throw error to cancel followup
		const conn = await pool.connect();
		try {
			await conn.query("UPDATE networks SET name = $1 WHERE id = $2", [
				name,
				networkId,
			]);
		} finally {
			conn.release();
		}
	}

	public async deleteNetwork(networkId: number): Promise<void> {
		// throw error to cancel disband events
		const conn = await pool.connect();
		try {
			await conn.query("DELETE FROM networks WHERE id = $1", [networkId]);
		} catch (err) {
			logger.error(err);
		} finally {
			conn.release();
		}
	}
}
