import { Client, type ClientOptions, Collection } from "discord.js";
import type { ButtonHandler } from "./buttonhandler.js";
import type { SelectHandler } from "./selecthandler.js";
import type { SlashCommand } from "./slashcommand.js";

export class ExtendedClient extends Client {
	slashcommands: Collection<string, SlashCommand>;
	buttons: Collection<string, ButtonHandler>;
	selects: Collection<string, SelectHandler>;

	constructor(options: ClientOptions) {
		super(options);
		this.slashcommands = new Collection();
		this.buttons = new Collection();
		this.selects = new Collection();
	}
}
