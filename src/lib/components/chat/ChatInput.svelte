<!-- components/ChatInput.svelte -->
<script lang="ts">
	import { Send } from '@lucide/svelte';
	import { createEventDispatcher } from 'svelte';
	import chatStore, { chatLoading } from '$lib/stores/chat';

	export let currentMessage = '';
	export let hasSelectedMovies = false;

	const dispatch = createEventDispatcher();

	function sendMessage() {
		chatStore.sendMessage(currentMessage);
		currentMessage = '';
		dispatch('sendMessage');
	}

	function onPromptKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}
</script>

<section class="border-surface-200-800 border-t p-4">
	<div
		class="input-group divide-surface-200-800 rounded-container-token grid-cols-[1fr_auto] divide-x"
	>
		<textarea
			bind:value={currentMessage}
			class="textarea border-0 !bg-transparent !bg-none ring-0"
			name="prompt"
			placeholder="Ask about movies or select examples to get recommendations..."
			rows="1"
			on:keydown={onPromptKeydown}
			disabled={$chatLoading}
		></textarea>
		<button
			class="input-group-cell p-3 {(currentMessage || hasSelectedMovies) && !$chatLoading
				? 'preset-filled-primary-500'
				: 'preset-tonal'}"
			on:click={sendMessage}
			disabled={$chatLoading}
		>
			{#if $chatLoading}
				<span class="animate-spin">⌛</span>
			{:else}
				<Send size={18} />
			{/if}
		</button>
	</div>
</section>
