import EventEmitter from "node:events";

import type { ChatInputCommandInteraction } from "discord.js";

export interface internalEvents {
	mock_register: [];
	test: [interaction: ChatInputCommandInteraction];
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
