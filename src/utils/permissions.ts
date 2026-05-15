import {
	type ButtonInteraction,
	type ChatInputCommandInteraction,
	type Guild,
	type Interaction,
	type ModalSubmitInteraction,
	PermissionsBitField,
	type SelectMenuInteraction,
	type StringSelectMenuInteraction,
} from "discord.js";
import { nodes } from "../db/index.js";
import { type Node, NodeType } from "../types/node.js";
import { errorMessage, permissionErrorMessage } from "./messages.js";

type PermissionInteraction = (
	| ChatInputCommandInteraction
	| ButtonInteraction
	| SelectMenuInteraction
	| ModalSubmitInteraction
	| StringSelectMenuInteraction
) & { guild: Guild };

export function ensureGuild(
	interaction: Interaction,
): interaction is PermissionInteraction {
	return interaction.guild !== null;
}

export async function validateAdmin(
	interaction: PermissionInteraction,
): Promise<boolean> {
	if (
		!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)
	) {
		await interaction.reply(permissionErrorMessage("Administrator"));
		return false;
	}
	return true;
}

export async function ensureNodeType(
	interaction: PermissionInteraction,
	type: NodeType,
): Promise<Node | undefined> {
	const node = await nodes.getNode(interaction.guild.id);
	if (!node || node.type !== type) {
		await interaction.reply(
			errorMessage(
				`This server is not ${type === NodeType.master ? "a master of a network!" : "part of a network"}`,
				"Please ensure you are in the correct server and that you are a part of a network!",
			),
		);
		return undefined;
	}
	return node;
}
