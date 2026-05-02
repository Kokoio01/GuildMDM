import type { JoinRequest, RequestStatus } from "../../types/network.js";
import { logger } from "../../utils/logger.js";
import { pool } from "../index.js";

export class joinrequest {
	public async getJoinRequests(
		guildId: string,
		status: RequestStatus,
	): Promise<JoinRequest[] | null> {
		const conn = await pool.connect();
		try {
			const result = await conn.query(
				"SELECT * FROM joinrequests WHERE guildId = $1 AND status = $2",
				[guildId, status],
			);
			return result.rows as JoinRequest[];
		} catch (err) {
			logger.error(err);
			return null;
		} finally {
			conn.release();
		}
	}

	public async createJoinRequest(
		guildId: string,
		networkId: number,
		message: string,
	): Promise<JoinRequest | null> {
		const conn = await pool.connect();
		try {
			const result = await conn.query(
				"INSERT INTO joinrequests (guildid, networkid, message, status) VALUES ($1, $2, $3, 0) RETURNING *",
				[guildId, networkId, message],
			);
			return result.rows[0] as JoinRequest;
		} catch (err) {
			logger.error(err);
			return null;
		} finally {
			conn.release();
		}
	}

	public async updateJoinRequest(
		id: number,
		status: RequestStatus,
	): Promise<JoinRequest | null> {
		const conn = await pool.connect();
		try {
			const result = await conn.query(
				"UPDATE joinrequests SET status = $1 WHERE id = $2 RETURNING *",
				[status, id],
			);
			return result.rows[0] as JoinRequest;
		} catch (err) {
			logger.error(err);
			return null;
		} finally {
			conn.release();
		}
	}
}
