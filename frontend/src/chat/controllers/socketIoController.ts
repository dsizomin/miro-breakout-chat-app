import io from 'socket.io-client'

import {CHAT_HOST, CHAT_OPTIONS} from '../../config'

import type {ChatSettings, ChatController, MessageResponse} from '../interfaces/chat'

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
        fetchMessages: (roomId: string) => {
            // TODO (dsizomin) This approach to url might break in case if `CHAT_HOST` contains trailing slash.
			const url = `${CHAT_HOST}/rooms/${roomId}/messages`
			return fetch(url, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            }).then(response => response.json())
        }
    } as ChatController
}

export default initChat
