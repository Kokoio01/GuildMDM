import { logger } from "../utils/logger.js";
import { pool } from "./index.js";

// biome-ignore lint/suspicious/noExplicitAny: pg itself uses any[] for the query
export async function safeQuery(query: string, params: any[]) {
	const conn = await pool.connect();
	try {
		return await conn.query(query, params);
	} catch (err) {
		logger.error(err);
	} finally {
		conn.release();
	}
}
