import io from 'socket.io-client'

import {CHAT_HOST, CHAT_OPTIONS} from '../../config'

import type {ChatSettings, ChatController} from '../interfaces/chat'

const initChat = ({roomId, user, messageHandler}: ChatSettings) => {
	const socket = io(CHAT_HOST, {
		...CHAT_OPTIONS,
		query: {
			access_token: user.token
		}
	})

	socket.emit('join', roomId, () => {})

	socket.on('chat message', messageHandler)

	return {
		sendMessage: (msg: string) => {
			socket.emit('chat message', msg, () => {})
		},
	} as ChatController
}

export default initChat
