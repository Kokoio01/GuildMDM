import { type Interaction, PermissionsBitField } from "discord.js";
import { errorMessage, permissionErrorMessage } from "./messages.js";

export async function validateAdmin(
	interaction: Interaction,
): Promise<boolean> {
	if (interaction.isAutocomplete()) return true;
	if (!interaction.guild) {
		await interaction.reply(
			errorMessage(
				"Not a Guild!",
				"This command can only be executed in guilds.",
			),
		);
		return false;
	}
	if (
		!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)
	) {
		await interaction.reply(permissionErrorMessage("Administrator"));
		return false;
	}
	return true;
}
