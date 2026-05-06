import "dotenv/config";
import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Events, GatewayIntentBits } from "discord.js";
import { initDB } from "./src/db/index.js";
import type { ButtonHandler } from "./src/structures/buttonhandler.js";
import { ExtendedClient } from "./src/structures/extendedclient.js";
import type { GatewayEvent } from "./src/structures/gatewayevent.js";
import type { InternalEvent } from "./src/structures/internalevent.js";
import type { ModalHandler } from "./src/structures/modalhandler.js";
import type { SelectHandler } from "./src/structures/selecthandler.js";
import type { SlashCommand } from "./src/structures/slashcommand.js";
import { internalBus } from "./src/utils/eventBus.js";
import { logger } from "./src/utils/logger.js";

const client = new ExtendedClient({ intents: [GatewayIntentBits.Guilds] });
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

client.once(Events.ClientReady, async (readyClient) => {
	await initDB();

	const events = fs.readdirSync("./src/events");
	for (const event of events) {
		const fpath = path.join(__dirname, "src", "events", event);
		const eventClass = await import(fpath);
		const eventInstance: InternalEvent<"mock_register"> =
			new eventClass.default(internalBus, readyClient);
		eventInstance.register();
	}

	const gevents = fs.readdirSync("./src/gatewayevents");
	for (const event of gevents) {
		const fpath = path.join(__dirname, "src", "gatewayevents", event);
		const eventClass = await import(fpath);
		const eventInstance: GatewayEvent = new eventClass.default(readyClient);
		eventInstance.register();
	}

	const buttons = fs.readdirSync("./src/buttons");
	for (const button of buttons) {
		const fpath = path.join(__dirname, "src", "buttons", button);
		const buttonClass = await import(fpath);
		const buttonInstance: ButtonHandler = new buttonClass.default();
		client.buttons.set(buttonInstance.name, buttonInstance);
	}

	const selects = fs.readdirSync("./src/selects");
	for (const select of selects) {
		const fpath = path.join(__dirname, "src", "selects", select);
		const selectClass = await import(fpath);
		const selectInstance: SelectHandler = new selectClass.default();
		client.selects.set(selectInstance.name, selectInstance);
	}

	const modals = fs.readdirSync("./src/modals");
	for (const modal of modals) {
		const fpath = path.join(__dirname, "src", "modals", modal);
		const modalClass = await import(fpath);
		const modalInstance: ModalHandler = new modalClass.default();
		client.modals.set(modalInstance.name, modalInstance);
	}

	const slashcommands = fs.readdirSync("./src/slashcommands");
	for (const slashcommand of slashcommands) {
		const fpath = path.join(__dirname, "src", "slashcommands", slashcommand);
		const eventClass = await import(fpath);
		const commandInstance: SlashCommand = new eventClass.default();
		client.slashcommands.set(commandInstance.data.name, commandInstance);
	}

	logger.info(`Syncing ${client.slashcommands.size} Slash commands`);
	await client.application?.commands.set(
		client.slashcommands.map((cmd) => cmd.data.toJSON()),
	);

	client.user?.setPresence({
		activities: [
			{
				name: "Managing Guilds",
				type: 4,
			},
		],
	});

	logger.info(`Logged in as ${readyClient.user.tag}`);
});

client.login(process.env.TOKEN);
