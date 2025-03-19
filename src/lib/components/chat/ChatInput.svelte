<!-- components/ChatInput.svelte -->
<script lang="ts">
	import { Send } from '@lucide/svelte';
	import { createEventDispatcher } from 'svelte';

	export let currentMessage = '';
	export let hasSelectedMovies = false;

	const dispatch = createEventDispatcher();

	function sendMessage() {
		dispatch('sendMessage');
	}

	function onPromptKeydown(event) {
		if (['Enter'].includes(event.code) && !event.shiftKey) {
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
		></textarea>
		<button
			class="input-group-cell p-3 {currentMessage || hasSelectedMovies
				? 'preset-filled-primary-500'
				: 'preset-tonal'}"
			on:click={sendMessage}
		>
			<Send size={18} />
		</button>
	</div>
</section>
