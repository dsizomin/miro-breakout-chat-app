export interface MessageGroupItem {
	text: string,
	timestamp: Date
}

export interface MessageGroup {
	authorId: string,
	authorName: string,
	items: MessageGroupItem[]
	// I'm not particularly happy with this member name
	isAuthorCurrentUser: boolean
}

export type MessageHandler = (message: MessageResponse) => void

export type EmitHandler = (error: any, response: any) => void

export interface ChatSettings {
	roomId: string
	user: User,
	messageHandler: MessageHandler
}

export type MessageResponse = {
	authorId: string,
	authorName: string,
	roomId: string,
	text: string,
	timestamp: number
}

export interface ChatController {
	sendMessage: (msg: string) => void,
	fetchMessages: (roomId: string) => Promise<Array<MessageResponse>>
}

export interface User {
	id: string,
	name: string,
	token: string
}
