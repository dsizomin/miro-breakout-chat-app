import socketioControllerFactory from './controllers/socketIoController'
import Chat from './components/Chat/Chat.svelte'
import Error from './components/Error.svelte'

import {CLIENT_ID} from '../config'

const initApp = (roomId: string, userId: string, userName: string) => {
	const app = new Chat({
		target: document.body,
		props: {
			roomId,
			userId,
			userName,
			chatFactory: socketioControllerFactory,
		},
	})
}

const getCurrentUserData = async (): Promise<{ id: string, name: string }> => {
	const id = await miro.currentUser.getId()
	// @ts-ignore
	const onlineUsers = await miro.board.getOnlineUsers()

	const name = onlineUsers.find((user) => user.id === id)?.name

	return { id, name }
}

miro.onReady(async () => {
	const savedState = await miro.__getRuntimeState()
	const user = await getCurrentUserData()

	if (savedState[CLIENT_ID]?.breakoutChatRoomId && user) {
		initApp(savedState[CLIENT_ID]?.breakoutChatRoomId, user.id, user.name)
	} else {
		const app = new Error({
			target: document.body,
		})
	}
})
