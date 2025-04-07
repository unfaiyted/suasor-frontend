<!-- components/ChatInput.svelte -->
<script lang="ts">
	import { Send, Settings } from '@lucide/svelte';
	import { createEventDispatcher } from 'svelte';
	import chatStore, { chatLoading } from '$lib/stores/chat';
	import type { ClientResponse } from '$lib/api/types';

	interface ChatInputProps {
		currentMessage: string;
		hasSelectedMovies: boolean;
		disabled: boolean;
		onSendMessage?: () => void;
	}
	let {
		currentMessage = $bindable(''),
		hasSelectedMovies = false,
		disabled = false,
		onSendMessage
	}: ChatInputProps = $props();

	function sendMessage() {
		// Send the message directly through the chat store
		chatStore.sendMessage(currentMessage, false);
		currentMessage = '';
	}

	function onPromptKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function selectAiClient(clientId: number) {
		chatStore.setCurrentAiClient(clientId);
	}
</script>

<div
	class="chat-input-container border-surface-200-800 sticky right-0 bottom-0 left-0 z-10 border-t bg-white p-4 shadow-lg dark:bg-gray-900"
>
	<div
		class="input-group divide-surface-200-800 rounded-container-token mx-auto grid-cols-[1fr_auto] divide-x"
	>
		<textarea
			bind:value={currentMessage}
			class="textarea border-0 !bg-transparent !bg-none ring-0"
			name="prompt"
			placeholder="Ask about movies or select examples to get recommendations..."
			rows="1"
			onkeydown={onPromptKeydown}
			disabled={$chatLoading || disabled}
		></textarea>
		<button
			class="input-group-cell p-3 {(currentMessage || hasSelectedMovies) &&
			!($chatLoading || disabled)
				? 'preset-filled-primary-500'
				: 'preset-tonal'}"
			onclick={sendMessage}
			disabled={$chatLoading || disabled}
		>
			{#if $chatLoading || disabled}
				<span class="animate-spin">⌛</span>
			{:else}
				<Send size={18} />
			{/if}
		</button>
	</div>
</div>
