<script lang="ts">
    import {onMount, afterUpdate} from 'svelte'
    import Message from './Message.svelte'

    import type {
        MessageHandler,
        EmitHandler,
        Message as MessageInterface,
        ChatController,
        ChatSettings,
        MessageGroup,
        MessageGroupItem
    } from '../../interfaces/chat'

    export let chatFactory: (settings: ChatSettings) => ChatController
    export let roomId: string
    export let name: string

    let newMessageText: string = ''

    let chatController: ChatController = null

    let messages: Array<MessageInterface> = []

    /*
      Reactive value holding grouped messages.

      TODO (dsizomin) This value will be recalculated every time a new message appears.
      Consider storing messages grouped right away instead of storing them in "raw" form.
     */
    let messageGroups: Array<MessageGroup>
    $: messageGroups = messages.reduce((result: Array<MessageGroup>, currentMessage: MessageInterface) => {

        const {author, text, timestamp} = currentMessage;
        const newMessageGroupItem: MessageGroupItem = {timestamp, text};

		const latestMessage: ?MessageInterface = result.length ? result[result.length - 1] : null;

		if (latestMessage && latestMessage.author === author) {
			latestMessage.items.push(newMessageGroupItem);
			return result;
		} else {
			return [...result, {
				author,
				isAuthorCurrentUser: author === name,
				items: [newMessageGroupItem]
			}]
		}

	}, []);

    const handleNewMessage: MessageHandler = (text, author) => {
        messages = [...messages, {text, author, timestamp: new Date()}]
    }

    const handleMessageSend = () => {
        if (!newMessageText) return

        chatController.sendMessage(newMessageText)

        newMessageText = ''

        return false
    }

    onMount(() => {
        chatController = chatFactory({roomId, name, messageHandler: handleNewMessage})
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
        height: 64px;
    }

    .sidebar__body {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        height: calc(100% - 120px);
        padding: 0 24px;
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
        {#each messageGroups as messageGroup}
            <Message {messageGroup}/>
        {/each}
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
