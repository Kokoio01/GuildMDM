import { Pool } from "pg";
import { validateSchema } from "./schema.js";

const pool = new Pool({
	host: process.env.DB_HOST as string,
	user: process.env.DB_USER as string,
	password: process.env.DB_PASS as string,
	database: process.env.DB_NAME as string,
	ssl: process.env.DB_SSL !== "false",
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000,
	maxLifetimeSeconds: 60,
});

export async function initDB(): Promise<void> {
	const client = await pool.connect();
	await validateSchema(client);
	client.release();
}
