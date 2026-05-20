import type { AnySelectMenuInteraction } from "discord.js";
import { netSetup, nodeSetup } from "../messages/setup.js";
import { SelectHandler } from "../structures/selecthandler.js";
import { ensureGuild, validateAdmin } from "../utils/permissions.js";

export default class setupSelect extends SelectHandler {
	public name: string = "setup";

	async execute(interaction: AnySelectMenuInteraction): Promise<void> {
		if (!ensureGuild(interaction)) return;
		if (!(await validateAdmin(interaction))) return;
		const action = interaction.customId.split(":")[1];

		switch (action) {
			case "selector": {
				if (interaction.values[0] === "netsetup") {
					await interaction.reply(netSetup());
				} else {
					await interaction.reply(nodeSetup());
				}
				return;
			}
		}
	}
}
