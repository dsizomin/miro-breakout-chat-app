import {CLIENT_ID} from '../config'
import appIcon from './icon'

const initChat = async (breakoutChatRoomId: string) => {
	await miro.__setRuntimeState({
		[CLIENT_ID]: {
			breakoutChatRoomId,
		},
	})

	miro.board.ui.closeLeftSidebar()
	miro.board.ui.openLeftSidebar('/chat')
}

const destroyChatIfNeeded = async (breakoutChatRoomIds: string[]) => {
	const runtimeState = await miro.__getRuntimeState()
	const currentBreakoutChatRoomId = runtimeState[CLIENT_ID]?.breakoutChatRoomId;

	if (currentBreakoutChatRoomId && breakoutChatRoomIds.includes(currentBreakoutChatRoomId)) {
		miro.board.ui.closeLeftSidebar()
	}
}

const handleAddChatClick = async () => {
	const viewport = await miro.board.viewport.get()

	const widget = (
		await miro.board.widgets.create({
			type: 'SHAPE',
			text: 'click to join a breakout chat',
			width: 300,
			style: {
				shapeType: 6,
				backgroundColor: '#fff',
				fontFamily: miro.enums.fontFamily.PERMANENT_MARKER,
				borderWidth: 7,
			},
			metadata: {
				[CLIENT_ID]: {
					isBreakoutChatButton: true,
				},
			},
			x: viewport.x + viewport.width / 2,
			y: viewport.y + viewport.height / 2,
		})
	)[0]

	// @ts-ignore
	miro.board.viewport.zoomToObject(widget)

	await initChat(widget.id)
}

const initPlugin = async () => {
	// @ts-ignore
	miro.addListener(miro.enums.event.SELECTION_UPDATED, async () => {
		const widgets = await miro.board.selection.get()
		if (widgets.length === 1 && widgets[0].metadata[CLIENT_ID]?.isBreakoutChatButton) {
			initChat(widgets[0].id)
		}
	})

	miro

	// @ts-ignore
	miro.addListener(miro.enums.event.WIDGETS_DELETED, async (event) => {
		const deletedWidgetIds = event.data.map(({id}) => id)
		await destroyChatIfNeeded(deletedWidgetIds)
	})

	await miro.initialize({
		extensionPoints: {
			bottomBar: {
				title: 'Create a new breakout chat',
				svgIcon: appIcon,
				onClick: handleAddChatClick,
			},
		},
	})
}

miro.onReady(async () => {
	const authorized = await miro.isAuthorized()
	if (authorized) {
		initPlugin()
	} else {
		const res = await miro.board.ui.openModal('/not-authorized.html')
		if (res === 'success') {
			initPlugin()
		}
	}
})
