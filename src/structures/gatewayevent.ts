import type { ExtendedClient } from "./extendedclient.js";

export abstract class GatewayEvent {
	public abstract name: string;

	constructor(protected client: ExtendedClient) {}

	abstract execute(...args: unknown[]): void;

	register() {
		this.client.on(this.name, (...args) => this.execute(...args));
	}
}
