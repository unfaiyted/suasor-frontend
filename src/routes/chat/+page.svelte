<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	// Import types and components
	import type { Movie, Message } from '$lib/components/chat/types';
	import ChatMessage from '$lib/components/chat/ChatMessage.svelte';
	import ChatInput from '$lib/components/chat/ChatInput.svelte';
	import SelectedMoviesBar from '$lib/components/chat/SelectedMoviesBar.svelte';
	import SidePanel from '$lib/components/chat/SidePanel.svelte';
	import TypingMessage from '$lib/components/chat/TypingMessage.svelte';

	// Import store
	import chatStore, {
		chatLoading,
		chatError,
		selectedMovies,
		aiClients,
		currentAiClient,
		mediaClients
	} from '$lib/stores/chat';

	// Local state
	let elemChat: HTMLElement;
	let currentMessage = '';
	let showActionsMenu = false;
	let showSidePanel = false;
	let showTypingIndicator = false;

	// State variables for chat functionality
	let isInitializing = true;

	onMount(async () => {
		// Set up click handler for action menu
		document.addEventListener('click', handleClickOutside);

		isInitializing = true;

		try {
			// Load AI clients first
			await chatStore.loadAiClients();

			// Initialize first chat using the conversation API
			await chatStore.startNewChat();
		} catch (error) {
			console.error('Error initializing chat:', error);
		} finally {
			isInitializing = false;
		}

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	// Utility functions
	function scrollChatBottom(behavior = 'smooth') {
		if (elemChat) {
			elemChat.scrollTo({ top: elemChat.scrollHeight, behavior: behavior as ScrollBehavior });
		}
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (showActionsMenu && !target.closest('.actions-menu')) {
			showActionsMenu = false;
		}
	}

	// Action handling functions
	function createListFromSelection() {
		const listName = prompt('Enter a name for your list:');
		if (listName) {
			chatStore.createListFromSelection(listName);
			showActionsMenu = false;
		}
	}

	function handleAction(action: string) {
		// Handle different actions based on selection
		switch (action) {
			case 'watchlist':
				alert(`Adding ${$selectedMovies.length} movies to watchlist`);
				break;
			case 'download':
				alert(`Requesting downloads for ${$selectedMovies.length} movies`);
				break;
			case 'share':
				alert(`Sharing ${$selectedMovies.length} movies`);
				break;
		}
		showActionsMenu = false;
	}

	// Send a message and show the typing indicator while waiting
	async function handleSendMessage() {
		if (!currentMessage.trim() && $selectedMovies.length === 0) return;

		console.log('Sending message:', currentMessage);

		// Create a blank AI response with typing indicator immediately
		chatStore.addEmptyAIResponse();
		showTypingIndicator = true;
		scrollChatBottom(); // Scroll immediately to show typing indicator

		try {
			// Add a minimum delay for the typing indicator (at least 500ms)
			console.log('Processing message...');
			const messageProcessingPromise = chatStore.sendMessage(currentMessage);
			const minTypingTimePromise = new Promise((resolve) => setTimeout(resolve, 500));

			// Wait for both the API response and minimum typing time
			await Promise.all([messageProcessingPromise, minTypingTimePromise]);
			console.log('Message processed, response received');
			currentMessage = '';
		} finally {
			// Hide typing indicator after response is received
			console.log('Hiding typing indicator');
			showTypingIndicator = false;
			scrollChatBottom();
		}
	}

	// Reactive statements to handle updates
	$: if ($chatStore.messages) {
		// Scroll to bottom when messages change
		setTimeout(() => scrollChatBottom(), 0);
	}
</script>

<div class="mx-4 mt-4 flex h-full">
	<!-- Side Panel -->
	{#if showSidePanel}
		<SidePanel
			chats={$chatStore.chats}
			currentChatId={$chatStore.currentChatId || ''}
			on:selectChat={(e) => chatStore.selectChat(e.detail)}
		/>
	{/if}

	<!-- Main Chat Area -->
	<section class="card bg-surface-100-900 rounded-container mb-5 flex-1 overflow-hidden p-4 pb-6">
		<div class="mb-2 flex justify-between">
			<div class="flex items-center gap-2">
				<button class="btn btn-sm" on:click={() => (showSidePanel = !showSidePanel)}>
					{showSidePanel ? 'Hide' : 'Show'} History
				</button>

				{#if $chatStore.aiClients.length > 0}
					<select
						class="select select-xs bg-surface-200-700-token"
						value={$chatStore.currentAiClientId}
						on:change={(e) => chatStore.setCurrentAiClient(Number(e.currentTarget.value))}
						disabled={$chatLoading}
					>
						{#each $chatStore.aiClients as client}
							<option value={client.id}>{client.name}</option>
						{/each}
					</select>
				{/if}

				{#if $mediaClients && $mediaClients.length > 0}
					<span class="badge badge-secondary">Media: {$mediaClients.length} connected</span>
				{/if}
			</div>

			<button class="btn btn-sm preset-filled" on:click={() => chatStore.startNewChat()}>
				New Chat
			</button>
		</div>

		<!-- Show error notification if any -->
		{#if $chatError}
			<div class="alert alert-error mb-4 p-2" transition:fade>
				<span>{$chatError.message}</span>
				<button class="btn btn-sm" on:click={() => chatStore.clearError()}>Dismiss</button>
			</div>
		{/if}

		<div class="chat mb-6 grid h-full h-full min-h-[100%] w-full grid-rows-[1fr_auto_auto] pb-10">
			<!-- Conversation -->
			<section
				bind:this={elemChat}
				class="max-h-[100%] space-y-4 overflow-y-auto p-4 md:min-h-[100%]"
			>
				{#if isInitializing}
					<div class="flex flex-col items-center justify-center p-4 text-center">
						<span class="loading loading-spinner loading-lg mb-2"></span>
						<p>Initializing chat session...</p>
					</div>
				{:else if $chatStore.messages.length === 0}
					<div class="flex h-full flex-col items-center justify-center p-4 text-center">
						<p class="mb-4 text-lg">Welcome to the Movie Recommendation Chat</p>
						<p class="text-sm opacity-70">Ask about movies, genres, or directors you enjoy</p>
					</div>
				{:else}
					{#each $chatStore.messages as message (message.id)}
						<ChatMessage
							{message}
							selectedMovies={$selectedMovies}
							showTyping={showTypingIndicator &&
								message.id === $chatStore.messages.length - 1 &&
								message.sender === 'ai' &&
								message.content.type === 'text' &&
								!message.content.text}
							toggleSelection={(e) => chatStore.toggleMovieSelection(e)}
						/>
					{/each}
				{/if}

				<!-- We now show typing indicator directly in the chat message -->
				<!-- Removed separate TypingMessage since we show the typing inside the empty AI message -->

				{#if $chatLoading && !isInitializing && $chatStore.messages.length === 0}
					<div class="flex justify-center p-4">
						<span class="loading loading-spinner loading-lg"></span>
					</div>
				{/if}
			</section>

			<!-- Selected movies bar -->
			{#if $selectedMovies.length > 0}
				<SelectedMoviesBar
					selectedMovies={$selectedMovies}
					{showActionsMenu}
					toggleSelection={(e) => chatStore.toggleMovieSelection(e)}
					createList={createListFromSelection}
					handleAction={(e) => handleAction(e)}
					toggleMenu={() => (showActionsMenu = !showActionsMenu)}
				/>
			{/if}

			<!-- Input area -->
			<ChatInput
				bind:currentMessage
				hasSelectedMovies={$selectedMovies.length > 0}
				on:sendMessage={handleSendMessage}
				disabled={showTypingIndicator || $chatLoading}
			/>
		</div>
	</section>
</div>

<style>
	:global(.full-page) {
		min-height: calc(100dvh - 120px);
	}
</style>
