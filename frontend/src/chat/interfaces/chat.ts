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

export type MessageHandler = (msg: string, id: string, name: string) => void

export type EmitHandler = (error: any, response: any) => void

export interface ChatSettings {
	roomId: string
	user: User,
	messageHandler: MessageHandler
}

export interface ChatController {
	sendMessage: (msg: string) => void
}

export interface User {
	id: string,
	name: string,
	token: string
}
