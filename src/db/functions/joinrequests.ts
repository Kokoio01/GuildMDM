import { type JoinRequest, RequestStatus } from "../../types/network.js";
import { NodeType } from "../../types/node.js";
import { logger } from "../../utils/logger.js";
import { pool } from "../index.js";
import { safeQuery } from "../utils.js";

export class joinrequest {
	public async getJoinRequests(
		networkId: number,
		status: RequestStatus,
	): Promise<JoinRequest[] | null> {
		const result = await safeQuery(
			"SELECT * FROM joinrequests WHERE networkid = $1 AND status = $2",
			[networkId, status],
		);
		if (!result) return null;
		return result.rows as JoinRequest[];
	}

	public async getJoinRequest(id: string): Promise<JoinRequest | null> {
		const result = await safeQuery("SELECT * FROM joinrequests WHERE id = $1", [
			id,
		]);
		if (!result) return null;
		return result.rows[0] as JoinRequest;
	}

	public async createJoinRequest(
		guildId: string,
		networkId: number,
		message: string,
	): Promise<JoinRequest | null> {
		const result = await safeQuery(
			"INSERT INTO joinrequests (guildid, networkid, message, status) VALUES ($1, $2, $3, 0) RETURNING *",
			[guildId, networkId, message],
		);
		if (!result) return null;
		return result.rows[0] as JoinRequest;
	}

	public async acceptJoinRequest(joinRequest: JoinRequest): Promise<void> {
		const conn = await pool.connect();
		try {
			await conn.query("BEGIN;");
			await conn.query(
				"UPDATE joinrequests SET status = $1 WHERE guildid = $2 and id != $3",
				[RequestStatus.EXPIRED, joinRequest.guildid, joinRequest.id],
			);
			await conn.query("UPDATE joinrequests SET status = $1 WHERE id = $2", [
				RequestStatus.ACCEPTED,
				joinRequest.id,
			]);
			await conn.query(
				"INSERT INTO nodes (guildid, networkid, type) VALUES ($1, $2, $3)",
				[joinRequest.guildid, joinRequest.networkid, NodeType.normal],
			);
			await conn.query("COMMIT;");
		} catch (err) {
			await conn.query("ROLLBACK;");
			logger.error(err);
		} finally {
			conn.release();
		}
	}

	public async denyJoinRequest(joinRequest: JoinRequest): Promise<void> {
		await safeQuery("Update joinrequests SET status = $1 WHERE id = $2", [
			RequestStatus.DECLINED,
			joinRequest.id,
		]);
	}
}
