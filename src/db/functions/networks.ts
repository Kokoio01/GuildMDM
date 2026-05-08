import { nanoid } from "nanoid";
import type { Network } from "../../types/network.js";
import type { Node } from "../../types/node.js";
import { logger } from "../../utils/logger.js";
import { pool } from "../index.js";

export class network {
	public async getNetwork(networkId: number): Promise<Network | null> {
		const conn = await pool.connect();
		try {
			const result = await conn.query(
				"SELECT * FROM networks WHERE id = $1 LIMIT 1",
				[networkId],
			);
			return result.rows[0] as Network;
		} catch (err) {
			logger.error(err);
			return null;
		} finally {
			conn.release();
		}
	}

	public async getNetworkByJoinKey(joinKey: string): Promise<Network | null> {
		const conn = await pool.connect();
		try {
			const result = await conn.query(
				"SELECT * FROM networks WHERE joinKey = $1 LIMIT 1",
				[joinKey],
			);

			return result.rows[0] as Network;
		} catch (err) {
			logger.error(err);
			return null;
		} finally {
			conn.release();
		}
	}

	public async getNodes(networkId: number): Promise<Node[] | null> {
		const conn = await pool.connect();
		try {
			const result = await conn.query(
				"SELECT * FROM nodes WHERE networkId = $1",
				[networkId],
			);
			return result.rows as Node[];
		} catch (err) {
			logger.error(err);
			return null;
		} finally {
			conn.release();
		}
	}

	public async getMasterNode(networkId: number): Promise<Node | null> {
		const conn = await pool.connect();
		try {
			const result = await conn.query(
				"SELECT * FROM nodes WHERE networkId = $1 AND type = 1 LIMIT 1",
				[networkId],
			);
			return result.rows[0] as Node;
		} catch (err) {
			logger.error(err);
			return null;
		} finally {
			conn.release();
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
		const conn = await pool.connect();
		try {
			await conn.query("UPDATE networks SET name = $1 WHERE id = $2", [
				name,
				networkId,
			]);
		} catch (err) {
			logger.error(err);
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
