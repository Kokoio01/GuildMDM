import type { EventBus, internalEvents } from "../utils/eventBus.js";
import type { ExtendedClient } from "./extendedclient.js";

export abstract class InternalEvent<K extends keyof internalEvents> {
	public abstract name: K;

	constructor(
		protected bus: EventBus,
		protected client: ExtendedClient,
	) {}

	abstract execute(...args: internalEvents[K]): void;

	register() {
		this.bus.on(this.name, (...args) => this.execute(...args));
	}
}
