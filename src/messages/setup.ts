import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	type InteractionReplyOptions,
	MessageFlags,
	SectionBuilder,
	SeparatorBuilder,
	StringSelectMenuBuilder,
	TextDisplayBuilder,
} from "discord.js";

export function setupMenu(): InteractionReplyOptions {
	const container = new ContainerBuilder()
		.addSectionComponents(
			new SectionBuilder().addTextDisplayComponents(
				new TextDisplayBuilder({
					content: `**Setup**`,
				}),
			),
		)

		.addTextDisplayComponents(
			new TextDisplayBuilder({
				content: [
					"Welcome to GuildMDM, let's set up your server! \n \n" +
						"**Network Setup** - Set this server up as a master that controls other servers. \n" +
						"**Node Setup** - Join an existing network to copy its policies.",
				].join("\n"),
			}),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addActionRowComponents(
			new ActionRowBuilder<StringSelectMenuBuilder>({
				components: [
					new StringSelectMenuBuilder()
						.setCustomId("setup:selector")
						.setOptions([
							{ label: "Network Setup", value: "netsetup" },
							{ label: "Node Setup", value: "nodesetup" },
						]),
				],
			}),
		);

	return {
		components: [container],
		flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
	};
}

export function netSetup(): InteractionReplyOptions {
	const container = new ContainerBuilder()
		.addSectionComponents(
			new SectionBuilder().addTextDisplayComponents(
				new TextDisplayBuilder({
					content: `**Setup/Network**`,
				}),
			),
		)

		.addTextDisplayComponents(
			new TextDisplayBuilder({
				content: [
					"Welcome to GuildMDM, let's set up your Network! \nThis guild will act as the Master Node of your network.\n\n" +
						"If this is not the correct guild, please run this command in the right guild and set ADMIN_GUILD to the correct guild in your config!\n\n" +
						"If you want to join a network, please also set the ADMIN_GUILD to the correct value in your config!",
				].join("\n"),
			}),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addActionRowComponents(
			new ActionRowBuilder<ButtonBuilder>({
				components: [
					new ButtonBuilder()
						.setCustomId("setup:netsetup")
						.setLabel("Setup Network")
						.setStyle(ButtonStyle.Secondary),
				],
			}),
		);

	return {
		components: [container],
		flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
	};
}

export function nodeSetup(): InteractionReplyOptions {
	const container = new ContainerBuilder()
		.addSectionComponents(
			new SectionBuilder().addTextDisplayComponents(
				new TextDisplayBuilder({
					content: `**Setup/Node**`,
				}),
			),
		)

		.addTextDisplayComponents(
			new TextDisplayBuilder({
				content: [
					"Welcome to GuildMDM, let's set up your server! \nThis guild will act as a node to a network.\n" +
						"Joining a network allows the network administrators to set rules this server has to follow. " +
						"It might also, based on the settings of the network, allow the administrators to change parts " +
						"of this server! (More on what the administrators can do will be provided on the next screen.)" +
						"\n \n **WARNING: Only join Networks which Administrators you trust!**",
				].join("\n"),
			}),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addActionRowComponents(
			new ActionRowBuilder<ButtonBuilder>({
				components: [
					new ButtonBuilder()
						.setCustomId("setup:nodesetup")
						.setLabel("Setup Node")
						.setStyle(ButtonStyle.Secondary),
				],
			}),
		);

	return {
		components: [container],
		flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral]
	};
}
