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
import { AppError } from "../structures/apperror.js";
import { type Node, NodeType } from "../types/node.js";

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
	if (!interaction.guild) throw new AppError("NO_GUILD");
	return true;
}

export async function validateAdmin(
	interaction: PermissionInteraction,
): Promise<boolean> {
	if (
		!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)
	) {
		throw new AppError("PERM_ADMINISTRATOR");
	}
	return true;
}

export async function ensureNodeType(
	interaction: PermissionInteraction,
	type: NodeType,
): Promise<Node | undefined> {
	const node = await nodes.getNode(interaction.guild.id);
	if (!node || node.type !== type) {
		throw type === NodeType.master
			? new AppError("NO_MASTER")
			: new AppError("NO_NODE");
	}
	return node;
}
