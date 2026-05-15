import EventEmitter from "node:events";
import type { Network } from "../types/network.js";

export interface internalEvents {
	mock_register: [];

	network_disband: [guildId: string, network: Network];
	network_leave: [masterId: string, leavingId: string];

	joinRequest_decline: [guildId: string, network: Network];
	joinRequest_accept: [guildId: string, network: Network];
}

export class EventBus extends EventEmitter {
	override emit<K extends keyof internalEvents>(
		eventName: K,
		...args: internalEvents[K]
	) {
		return super.emit(eventName, ...args);
	}

	override on<K extends keyof internalEvents>(
		eventName: K,
		listener: (...args: internalEvents[K]) => void,
	): this {
		return super.on(eventName, listener);
	}
}

export const internalBus = new EventBus();
