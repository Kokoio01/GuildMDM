interface ErrorMessage {
	title: string;
	description: string;
}

const errorMessages = {
	UNEXPECTED: {
		title: "An error has occurred",
		description:
			"An unexpected error has occurred, the error has been reported.",
	},

	UNKNOWN_CMD: { title: "Unknown", description: "This command does not exist" },
	UNKNOWN_BUTTON: {
		title: "Unknown",
		description: "This button does not exist",
	},
	UNKNOWN_MODAL: { title: "Unknown", description: "This modal does not exist" },
	UNKNOWN_SELECT_MENU: {
		title: "Unknown",
		description: "This modal does not exist",
	},

	NOT_CONFIRMED: {
		title: "Not Confirmed",
		description: "You failed to confirm this action!",
	},

	NO_GUILD: {
		title: "Guild required!",
		description: "This Action can only be performed in a guild!",
	},
	NO_NODE: {
		title: "Not a Node!",
		description: "This Action can only be performed in a node!",
	},
	NO_MASTER: {
		title: "Not a Master!",
		description: "This Action can only be performed by a master!",
	},
	NO_NETWORK: {
		title: "Not in a Network!",
		description: "This server is not part of a network!",
	},

	NONE_NETWORK: {
		title: "No Network!",
		description: "This Instance has no networks to join!",
	},

	ALREADY_NETWORK: {
		title: "Already in a network!",
		description: "This server is already part of a network!",
	},

	DB_ERROR: {
		title: "Database Error!",
		description: "An error occurred with the database!",
	},

	CREATION_RESTRICTED: {
		title: "Creation Restricted!",
		description: "This Instance is restricted from creating new networks!",
	},
	NOT_FOUND: {
		title: "Not Found!",
		description: "The requested resource could not be found!",
	},
	BEING_EDITED: {
		title: "Being Edited!",
		description: "This resource is currently being edited!",
	},

	INVALID_NET_NAME: {
		title: "Invalid Name!",
		description: "The Name must be between 2 and 200 characters long.",
	},

	PERM_ADMINISTRATOR: {
		title: "No Permission!",
		description: "To execute this action you must have **Administrator**",
	},
} satisfies Record<string, ErrorMessage>;

export type ErrorCode = keyof typeof errorMessages;

export class AppError extends Error {
	public readonly title: string;
	public readonly code: ErrorCode;

	constructor(code: ErrorCode, customMessage?: string) {
		const errorConfig = errorMessages[code];

		const message = customMessage ?? errorConfig.description;

		super(message);

		this.code = code;
		this.title = errorConfig.title;
		this.name = "AppError";

		Object.setPrototypeOf(this, new.target.prototype);
	}
}
