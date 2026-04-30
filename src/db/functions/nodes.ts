import type { Node } from "../../types/node.js";
import { pool } from "../index.js";

export class node {
	public async getNode(guildId: string): Promise<Node | null> {
		const conn = await pool.connect();
		try {
			const result = await conn.query(
				"SELECT * FROM nodes WHERE guildid = $1 LIMIT 1",
				[guildId],
			);

			return result.rows[0] as Node;
		} catch {
			return null;
		} finally {
			conn.release();
		}
	}
}
