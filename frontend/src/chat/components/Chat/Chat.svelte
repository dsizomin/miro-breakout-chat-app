<script lang="ts">
    import {onMount, afterUpdate} from 'svelte'
    import Message from './Message.svelte'

    import type {
        MessageHandler,
        EmitHandler,
        ChatController,
        ChatSettings,
        MessageGroup,
        MessageGroupItem
    } from '../../interfaces/chat'

    export let chatFactory: (settings: ChatSettings) => ChatController
    export let roomId: string
    export let userId: string
    export let userName: string

    let newMessageText: string = ''

    let chatController: ChatController = null

    let messageGroups: Array<MessageGroup> = [];

    const handleNewMessage: MessageHandler = (text, authorId, authorName) => {

        const isAuthorCurrentUser = authorId === userId;

        const newMessageGroupItem: MessageGroupItem = {text, timestamp: new Date()};

        const latestMessageGroup: ?MessageGroup = messageGroups.length ? messageGroups[messageGroups.length - 1] : null;

        if (latestMessageGroup && latestMessageGroup.authorId === authorId) {
            // It is important that we're replacing the item in array, and mutating, as mutation won't trigger update
            messageGroups = [...messageGroups.slice(0, -2), {
                authorId,
                authorName,
                isAuthorCurrentUser,
                items: [...latestMessageGroup.items, newMessageGroupItem]
            }];
        } else {
            messageGroups = [...messageGroups, {
                authorId,
                authorName,
                isAuthorCurrentUser,
                items: [newMessageGroupItem]
            }];
        }
    }

    const handleMessageSend = () => {
        if (!newMessageText) return

        chatController.sendMessage(newMessageText)

        newMessageText = ''

        return false
    }

    onMount(() => {
        chatController = chatFactory({roomId, userId, userName, messageHandler: handleNewMessage})
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
                    disabled={chatController === null}
                    type="text"
                    class="miro-input miro-input--primary"
                    bind:value={newMessageText}
                    placeholder="Type your message here"/>
        </form>
    </div>
</div>
