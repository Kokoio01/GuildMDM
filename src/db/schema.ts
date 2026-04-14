import fs from "node:fs";
import { readFile } from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { PoolClient } from "pg";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function validateSchema(client: PoolClient): Promise<void> {
	const VERSION = await checkVersion(client);
	if (VERSION === -1) {
		logger.error(
			"Cannot Initialize Database, no schema found and data is present!",
		);
		logger.error("Please empty the Database before retrying!");
		return;
	}

	const files_migrations = fs.readdirSync("./src/db/migrations");
	let ids_migrations: number[] = [];
	for (const file of files_migrations) {
		const prefix = file.split("_")[0];
		if (prefix === undefined) return;
		ids_migrations.push(parseInt(prefix, 10));
	}
	const MAX_VERSION: number =
		ids_migrations.sort((a, b) => a - b)[ids_migrations.length - 1] || 0;

	if (VERSION > MAX_VERSION) {
		logger.error(
			"Cannot connect to Database as it contains a newer version as this programm supports.",
		);
		logger.error("Please update this programm to a newer Version!");
		return;
	}

	ids_migrations = ids_migrations.filter((id) => id > VERSION);

	for (const id of ids_migrations) {
		const file = files_migrations.find((name) => {
			const parts = name.split("_");
			const prefix = parts[0];
			return prefix !== undefined && parseInt(prefix, 10) === id;
		});
		if (!file) return;

		const fpath = path.join(__dirname, "migrations", file);
		const migration = await readFile(fpath, "utf8");
		try {
			await client.query("BEGIN");
			await client.query(migration);
			await client.query("UPDATE version SET version = $1 WHERE id = 0", [id]);
			await client.query("COMMIT");
		} catch (err) {
			await client.query("ROLLBACK");
			throw err;
		}
		logger.info(`Applied migraton: ${file}`);
	}
	return;
}

async function checkVersion(client: PoolClient): Promise<number> {
	let VERSION = 0;
	try {
		const result_version = await client.query(
			"SELECT * FROM version WHERE id = 0;",
		);
		VERSION = result_version.rows[0].version;
		return VERSION;
	} catch {
		const tables = await client.query(`
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
        `);
		if (tables.rows.length > 0) {
			return -1;
		}
		await client.query(`
      CREATE TABLE IF NOT EXISTS version (
        id int PRIMARY KEY,
        version int NOT NULL
      );
    `);
		await client.query("INSERT INTO version VALUES (0, 0);");
		return 0;
	}
}
