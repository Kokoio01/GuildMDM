import type { Network } from "./network.js";

export enum NodeType {
	normal = 0,
	master = 1,
}

export interface Node {
	id: number;
	type: NodeType.normal | NodeType.master;
	guildid: string;
	network: Network;
}
