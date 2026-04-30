export interface Network {
	id: number;
	name: string;
	joinkey: string;
}

export enum RequestStatus {
	PENDING = 0,
	ACCEPTED = 1,
	DECLINED = 2,
}

export interface JoinRequest {
	id: number;
	networkid: number;
	guildid: string;
	message: string;
	status:
		| RequestStatus.PENDING
		| RequestStatus.ACCEPTED
		| RequestStatus.DECLINED;
}
