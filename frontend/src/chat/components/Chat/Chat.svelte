<script lang="ts">
    import {onMount, afterUpdate} from 'svelte'
    import Message from './Message.svelte'

    import type {
        User,
        MessageResponse,
        MessageHandler,
        EmitHandler,
        ChatController,
        ChatSettings,
        MessageGroup,
        MessageGroupItem
    } from '../../interfaces/chat'

    export let chatFactory: (settings: ChatSettings) => ChatController
    export let roomId: string
    export let user: User

    /*
        This value tells if messages are being fetch right now
        TODO (dsizomin) Implement a proper loading indicator based on this value
    */
    let isLoading: boolean = false

    let newMessageText: string = ''

    let chatController: ChatController = null

    let messageGroups: Array<MessageGroup> = [];

    /*
        Helper function which puts a new message to existing array of message groups,
        either by creating a new group, or appending a message to the last one, if author is same.

        I've extracted it to a separate function because it's being used in 2 scenarios:
            - initial fetch of messages history (see onMount)
            - processing new message (see handleNewMessage)

        TODO (dsizomin) Consider moving it to some kind of `utils.js` so the component code is clean.
     */
    const groupNewMessage = (messageGroups: Array<MessageGroup>, message: MessageResponse): Array<MessageGroup> => {
        const {authorId, authorName, text, timestamp} = message

        const isAuthorCurrentUser = authorId === user.id;

        const newMessageGroupItem: MessageGroupItem = {
            text: text,
            timestamp: new Date(timestamp)
        };

        const latestMessageGroup: ?MessageGroup = messageGroups.length ? messageGroups[messageGroups.length - 1] : null;

        /*
            TODO (dsizomin) Grouping logic might be improved
            Do we need to group together messages from different dates (one yesterday, one today)?
            Maybe we should only group messages if they fit within some time slot, let's say 5 minutes?
         */
        if (latestMessageGroup && latestMessageGroup.authorId === authorId) {
            // Message from same author is the last one, so we append it to existing message group.
            // It is important that we're replacing the item in array, as mutation won't trigger update.
            return [...messageGroups.slice(0, -2), {
                authorId,
                authorName,
                isAuthorCurrentUser,
                items: [...latestMessageGroup.items, newMessageGroupItem]
            }];
        } else {
            // Message from different author, so we create a new group.
            return [...messageGroups, {
                authorId,
                authorName,
                isAuthorCurrentUser,
                items: [newMessageGroupItem]
            }];
        }
    }

    const handleNewMessage: MessageHandler = (message) => {
        messageGroups = groupNewMessage(messageGroups, message)
    }

    const handleMessageSend = () => {
        if (!newMessageText) return

        chatController.sendMessage(newMessageText)

        newMessageText = ''

        return false
    }

    const handleZoomToWidget = async () => {
        const widgets = await miro.board.widgets.get({ id: roomId })

        if (widgets.length) {
            // TODO (dsizomin) zoomToObject method is deprecated and needs to be changed
            // @ts-ignore
            miro.board.viewport.zoomToObject(widget)
        }
    }

    onMount(() => {
        chatController = chatFactory({roomId, user, messageHandler: handleNewMessage})

        isLoading = true
        chatController
            .fetchMessages(roomId)
            .then(messages => {
                messageGroups = messages.reduce(groupNewMessage, [])
            })
            /*
                TODO (dsizomin) Using console like this might be dangerous in browsers like IE, as it might be undefined
                Consider using a console polyfill https://github.com/paulmillr/console-polyfill
             */
            .catch(err => console.error(err))
            .finally(() => isLoading = false)
    })
</script>

<style>
    .sidebar__container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
    }

    .sidebar__header {
        padding: 24px;
    }

    /*
        Using justify-content: flex-end with overflow: auto might cause problems:
        https://bugs.chromium.org/p/chromium/issues/detail?id=411624
        Solution here is to use 2 containers:
            - .sidebar__body for scrolling
            - .sidebar__message-list for justifying the content.
        Alternative solution without additional container could also be using margin-top: auto
        on the first child (instead of justify-content: flex-end)
     */
    .sidebar__body {
        display: flex;
        flex-direction: column;
        height: calc(100% - 120px);
        padding: 0 8px;
        overflow: auto;
    }

    .sidebar__message-list {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        justify-content: flex-end;
    }

    .sidebar__footer {
        padding: 0 8px;
    }

    .sidebar__footer input {
        width: 100%;
    }
</style>

<div class="sidebar__container">
    <div class="sidebar__header">
        <span class="miro-h2">Breakout Chat</span>
        <br>
        <!-- TODO (dsizomin) Replace with a proper icon ("crosshair" icon might be a good option) -->
        <a href="#" role="button" on:click|preventDefault={handleZoomToWidget}>
            Zoom to widget
        </a>
    </div>
    <div class="sidebar__body">
        <div class="sidebar__message-list">
            {#each messageGroups as messageGroup}
                <Message {messageGroup}/>
            {/each}
        </div>
    </div>
    <div class="sidebar__footer">
        <form on:submit|preventDefault={handleMessageSend}>
            <input
                disabled={chatController === null || isLoading}
                type="text"
                class="miro-input miro-input--primary"
                bind:value={newMessageText}
                placeholder="Type your message here"
            />
        </form>
    </div>
</div>
