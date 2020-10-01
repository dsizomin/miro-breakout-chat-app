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

    let isLoading: boolean = false

    let newMessageText: string = ''

    let chatController: ChatController = null

    let messageGroups: Array<MessageGroup> = [];

    const groupNewMessage = (messageGroups: Array<MessageGroup>, message: MessageResponse): Array<MessageGroup> => {
        const {authorId, authorName, text, timestamp} = message

        const isAuthorCurrentUser = authorId === user.id;

        const newMessageGroupItem: MessageGroupItem = {
            text: text,
            timestamp: new Date(timestamp)
        };

        const latestMessageGroup: ?MessageGroup = messageGroups.length ? messageGroups[messageGroups.length - 1] : null;

        if (latestMessageGroup && latestMessageGroup.authorId === authorId) {
            // It is important that we're replacing the item in array, and mutating, as mutation won't trigger update
            return [...messageGroups.slice(0, -2), {
                authorId,
                authorName,
                isAuthorCurrentUser,
                items: [...latestMessageGroup.items, newMessageGroupItem]
            }];
        } else {
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

    onMount(() => {
        chatController = chatFactory({roomId, user, messageHandler: handleNewMessage})

        isLoading = true
        chatController
            .fetchMessages(roomId)
            .then(messages => {
                messageGroups = messages.reduce(groupNewMessage, [])
            })
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
