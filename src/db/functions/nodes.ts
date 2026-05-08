import type { Node } from "../../types/node.js";
import { pool } from "../index.js";
import { safeQuery } from "../utils.js";

export class node {
	public async getNode(guildId: string): Promise<Node | null> {
		const result = await safeQuery(
			"SELECT * FROM nodes WHERE guildid = $1 LIMIT 1",
			[guildId],
		);
		if (!result) return null;
		return result.rows[0] as Node;
	}

	public async deleteNode(guildId: string): Promise<void> {
		const conn = await pool.connect();
		try {
			// throw error to cancel leaving events
			await conn.query("DELETE FROM nodes WHERE guildid = $1", [guildId]);
		} finally {
			conn.release();
		}
	}
}
