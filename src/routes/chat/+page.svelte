<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	
	// Import types and components
	import type { Movie, Message } from '$lib/components/chat/types';
	import ChatMessage from '$lib/components/chat/ChatMessage.svelte';
	import ChatInput from '$lib/components/chat/ChatInput.svelte';
	import SelectedMoviesBar from '$lib/components/chat/SelectedMoviesBar.svelte';
	import SidePanel from '$lib/components/chat/SidePanel.svelte';
	
	// Import store
	import chatStore, { chatLoading, chatError, selectedMovies } from '$lib/stores/chat';

	// Local state
	let elemChat: HTMLElement;
	let currentMessage = '';
	let showActionsMenu = false;
	let showSidePanel = true;

	// Sample movies data (used only for initial examples)
	const sampleMovies: Movie[] = [
		{
			id: 'air1',
			title: 'Everything Everywhere All at Once',
			year: 2022,
			type: 'movie',
			poster: 'https://image.tmdb.org/t/p/original/u68AjlvlutfEIcpmbYpKcdi09ut.jpg',
			genres: ['Action', 'Adventure', 'Science Fiction'],
			rating: 8.0,
			overview: 'An aging Chinese immigrant is swept up in an insane adventure...'
		},
		{
			id: 't1',
			title: 'Oppenheimer',
			year: 2023,
			type: 'movie',
			poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
			genres: ['Drama', 'History'],
			rating: 8.2,
			overview: 'The story of American scientist J. Robert Oppenheimer...'
		},
		{
			id: 't2',
			title: 'Poor Things',
			year: 2023,
			type: 'movie',
			poster: 'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg',
			genres: ['Science Fiction', 'Comedy', 'Romance'],
			rating: 8.0,
			overview: 'Brought back to life by an unorthodox scientist...'
		}
	];

	onMount(async () => {
		// Set up click handler for action menu
		document.addEventListener('click', handleClickOutside);
		
		// Load AI clients
		await chatStore.loadAiClients();
		
		// Initialize first chat
		chatStore.startNewChat();
		
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

	// Reactive statements to handle updates
	$: if ($chatStore.messages) {
		// Scroll to bottom when messages change
		setTimeout(() => scrollChatBottom(), 0);
	}
</script>

<div class="mx-4 mt-8 flex h-full">
	<!-- Side Panel -->
	{#if showSidePanel}
		<SidePanel
			chats={$chatStore.chats}
			currentChatId={$chatStore.currentChatId}
			on:selectChat={(e) => chatStore.selectChat(e.detail)}
		/>
	{/if}

	<!-- Main Chat Area -->
	<section class="card bg-surface-100-900 rounded-container flex-1 overflow-hidden p-4">
		<div class="mb-2 flex justify-between">
			<button class="btn btn-sm" on:click={() => (showSidePanel = !showSidePanel)}>
				{showSidePanel ? 'Hide' : 'Show'} History
			</button>

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

		<div class="chat grid h-full w-full grid-rows-[1fr_auto_auto] pb-6">
			<!-- Conversation -->
			<section
				bind:this={elemChat}
				class="max-h-[600px] space-y-4 overflow-y-auto p-4 md:min-h-[500px]"
			>
				{#each $chatStore.messages as message (message.id)}
					<ChatMessage
						{message}
						selectedMovies={$selectedMovies}
						on:toggleSelection={(e) => chatStore.toggleMovieSelection(e.detail)}
					/>
				{/each}
				
				{#if $chatLoading && $chatStore.messages.length === 0}
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
					on:toggleSelection={(e) => chatStore.toggleMovieSelection(e.detail)}
					on:createList={createListFromSelection}
					on:handleAction={(e) => handleAction(e.detail)}
					on:toggleMenu={() => (showActionsMenu = !showActionsMenu)}
				/>
			{/if}

			<!-- Input area -->
			<ChatInput
				bind:currentMessage
				hasSelectedMovies={$selectedMovies.length > 0}
				on:sendMessage={() => scrollChatBottom()}
			/>
		</div>
	</section>
</div>

<style>
	:global(.full-page) {
		min-height: calc(100dvh - 120px);
	}
</style>