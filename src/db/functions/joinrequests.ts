import type { JoinRequest, RequestStatus } from "../../types/network.js";
import { pool } from "../index.js";

export class joinrequest {
	public async getJoinRequests(
		guildId: string,
		status: RequestStatus,
	): Promise<JoinRequest[] | null> {
		try {
			const conn = await pool.connect();

			const result = await conn.query(
				"SELECT * FROM joinrequests WHERE guildId = $1 AND status = $2",
				[guildId, status],
			);
			if (result.rowCount || 0 < 1) return null;
			conn.release();
			return result.rows as JoinRequest[];
		} catch {
			return null;
		}
	}

	public async createJoinRequest(
		guildId: string,
		networkId: number,
		message: string,
	): Promise<JoinRequest | null> {
		try {
			const conn = await pool.connect();

			const result = await conn.query(
				"INSERT INTO joinrequests (guildid, networkid, message, status) VALUES ($1, $2, $3, 0) RETURNING *",
				[guildId, networkId, message],
			);
			conn.release();
			return result.rows[0] as JoinRequest;
		} catch {
			return null;
		}
	}

	public async updateJoinRequest(
		id: number,
		status: RequestStatus,
	): Promise<JoinRequest | null> {
		try {
			const conn = await pool.connect();

			const result = await conn.query(
				"UPDATE joinrequests SET status = $1 WHERE id = $2 RETURNING *",
				[status, id],
			);
			conn.release();
			return result.rows[0] as JoinRequest;
		} catch {
			return null;
		}
	}
}
