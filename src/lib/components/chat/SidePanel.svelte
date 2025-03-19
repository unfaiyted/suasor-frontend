<script lang="ts">
	import { fly } from 'svelte/transition';
	import { MessageSquare, Clock } from '@lucide/svelte';
	import type { Chat } from './types';

	export let chats: Chat[] = [];
	export let currentChatId: string = '';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function selectChat(chatId: string) {
		dispatch('selectChat', chatId);
	}
</script>

<div
	class="side-panel border-surface-200-700 h-full w-[250px] p-4"
	in:fly={{ x: -20, duration: 300, delay: 300 }}
>
	<h3 class="mb-4 text-lg font-bold">Your Conversations</h3>

	<div class="chat-list space-y-2">
		{#each chats as chat}
			<button
				class="card hover:ring-primary-500 w-full p-3 transition-all hover:ring-1
                       {chat.id === currentChatId
					? 'bg-primary-500/20 ring-primary-500 ring-1'
					: 'bg-surface-100-800-token'}"
				on:click={() => selectChat(chat.id)}
			>
				<div class="flex items-start gap-2">
					<MessageSquare
						size={16}
						class="mt-1 flex-shrink-0 {chat.id === currentChatId ? 'text-primary-500' : ''}"
					/>
					<div class="flex-1 overflow-hidden">
						<p class="truncate font-medium">{chat.title}</p>
						<div class="flex items-center gap-1 text-xs opacity-70">
							<Clock size={10} />
							<span>{chat.timestamp}</span>
						</div>
						<p class="mt-1 truncate text-xs opacity-80">
							{chat.recommendations.length} recommendations
						</p>
					</div>
				</div>
			</button>
		{/each}

		{#if chats.length === 0}
			<div class="card p-4 text-center opacity-70">
				<p>No previous chats</p>
			</div>
		{/if}
	</div>
</div>
