<script lang="ts">
	import type {MessageGroup, MessageGroupItem} from '../../interfaces/chat'
	export let messageGroup: MessageGroup
</script>

<div class="message__container">
	<div class="message__header">
		<strong>{decodeURIComponent(messageGroup.author)}</strong>
		<!--	TODO dsizomin Consider revisiting the layout to show timestamp per individual message	-->
		<span>{messageGroup.items[0].timestamp.toLocaleTimeString().slice(0, 5)}</span>
	</div>
	<div class="message__body">
		{#each messageGroup.items as item}
			<p class="message__text">{item.text}</p>
		{/each}
	</div>
</div>

<style>
	.message__container {
		/* display: flex;
        width: 100%; */
		margin: 6px 0;
	}

	.message__header {
		margin-top: 12px;
	}

	.message__text {
		margin: 6px 0px 0px 0px;
	}
</style>
