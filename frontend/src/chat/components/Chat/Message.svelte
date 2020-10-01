<script lang="ts">
	import type {MessageGroup, MessageGroupItem} from '../../interfaces/chat'
	export let messageGroup: MessageGroup
</script>

<div class="message__container" class:message__container--current={messageGroup.isAuthorCurrentUser}>

	{#if !messageGroup.isAuthorCurrentUser}
	<div class="message__avatar">
		<!-- TODO (dsizomin) Using hardcoded src like this might be dangerous, consider getting it from API. -->
		<img
			src={`https://miro.com/api/v1/users/${messageGroup.authorId}/picture?rnd=1&size=44`}
			alt={messageGroup.authorName}
		>
	</div>
	{/if}

	<div class="message__body">
		{#if !messageGroup.isAuthorCurrentUser}
			<strong class="message__author">{decodeURIComponent(messageGroup.authorName)}</strong>
		{/if}
		{#each messageGroup.items as item}
			<p class="message__text">{item.text}</p>
		{/each}
	</div>

	<div class="message__datetime">
		<!--
			TODO (dsizomin) Consider using the last message in a group for timestamp.
			As timestamp is shown at the bottom of the message group, perhaps it would make more sense.
		-->
		{messageGroup.items[0].timestamp.toLocaleTimeString().slice(0, 5)}
	</div>

</div>

<style>
	.message__container {
		display: flex;
        flex-flow: row nowrap;
		margin: 6px 0;
	}

	.message__avatar {
		border-radius: 22px;
		overflow: hidden;
		width: 44px;
		height: 44px;
		align-self: flex-end;
		margin-right: 4px;
	}

	.message__body {
		background: #EBEBEF;
		border-radius: 4px;
		flex-grow: 1;
		padding: 8px;
	}

	.message__author {
		margin-bottom: 6px;
	}

	.message__text {
		margin: 0;
	}

	.message__datetime {
		color: #827F9B;
		align-self: flex-end;
		visibility: collapse;
		margin: 0 6px;
	}

	.message__container:hover .message__datetime {
		visibility: visible;
	}

	.message__container--current {
		flex-direction: row-reverse;
		padding-left: 44px;
	}

	.message__container--current .message__body {
		background: #3F53D9;
		color: white;
		text-align: right;
	}
</style>
