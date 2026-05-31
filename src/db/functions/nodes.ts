import type { Node } from "../../types/node.js";
import { safeQuery } from "../utils.js";

export class node {
	public async getNode(guildId: string): Promise<Node | undefined> {
		const result = await safeQuery(
			"SELECT \n" +
				"    n.id,\n" +
				"    n.type,\n" +
				"    n.guildId,\n" +
				"    nw.id AS nw_id,\n" +
				"    nw.name AS nw_name,\n" +
				"    nw.joinKey AS nw_joinKey\n" +
				"FROM nodes n\n" +
				"INNER JOIN networks nw ON n.networkId = nw.id\n" +
				"WHERE n.guildId = $1;",
			[guildId],
		);
		if (!result) return undefined;
		const row = result.rows[0];
		return {
			id: row.id,
			type: row.type,
			guildid: row.guildid,
			network: {
				id: row.nw_id,
				name: row.nw_name,
				joinkey: row.nw_joinkey,
			},
		} as Node;
	}

	public async deleteNode(guildId: string): Promise<void> {
		await safeQuery("DELETE FROM nodes WHERE guildId = $1;", [guildId]);
	}
}
