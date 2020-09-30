export interface Message {
	text: string
	author: string
	timestamp: Date
}

export interface MessageGroupItem {
	text: string,
	timestamp: Date
}

export interface MessageGroup {
	author: string,
	items: MessageGroupItem[]
	// I'm not particularly happy with this member name
	isAuthorCurrentUser: boolean
}

export type MessageHandler = (msg: string, name: string) => void

export type EmitHandler = (error: any, response: any) => void

export interface ChatSettings {
	roomId: string
	name: string
	messageHandler: MessageHandler
}

export interface ChatController {
	sendMessage: (msg: string) => void
}
