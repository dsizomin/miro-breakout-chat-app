import io from 'socket.io-client'

import {CHAT_HOST, CHAT_OPTIONS} from '../../config'

import type {ChatSettings, ChatController} from '../interfaces/chat'

const initChat = ({roomId, userId, userName, messageHandler}: ChatSettings) => {
	const socket = io(CHAT_HOST, CHAT_OPTIONS)

	socket.emit('join', roomId, userId, userName, () => {})

	socket.on('chat message', messageHandler)

	return {
		sendMessage: (msg: string) => {
			socket.emit('chat message', msg, () => {})
		},
	} as ChatController
}

export default initChat
