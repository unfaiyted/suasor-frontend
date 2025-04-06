<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	// Import types and components
	import type { Movie, Message } from '$lib/components/chat/types';
	import ChatMessage from '$lib/components/chat/ChatMessage.svelte';
	import ChatInput from '$lib/components/chat/ChatInput.svelte';
	import SelectedMoviesBar from '$lib/components/chat/SelectedMoviesBar.svelte';
	import SidePanel from '$lib/components/chat/SidePanel.svelte';
	import DownloadRequestModal from '$lib/components/chat/DownloadRequestModal.svelte';
	import ListCreationModal from '$lib/components/chat/ListCreationModal.svelte';

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
	let elemChat = $state<HTMLElement>();
	let currentMessage = $state('');
	let showActionsMenu = $state(false);
	let showSidePanel = $state(false);
	let showTypingIndicator = $state(false);
	let showDownloadModal = $state(false);
	let showListCreationModal = $state(false);

	// State variables for chat functionality
	let isInitializing = $state(true);
	
	// Add effect to scroll when chat container is available
	$effect(() => {
		if (elemChat && !isInitializing) {
			setTimeout(() => {
				scrollToLatestMessage();
				console.log('Scrolled to bottom after chat container bind');
			}, 300);
		}
	});

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
			
			// Scroll to bottom after initialization is complete
			// Use a small timeout to ensure DOM is fully updated
			setTimeout(() => {
				scrollToLatestMessage();
				console.log('Initial scroll to bottom of chat');
			}, 300);
		}

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	// Utility functions
	function scrollToLatestMessage() {
		// Scroll both the chat container and the page to the bottom
		if (elemChat) {
			// Scroll the chat container to the bottom
			elemChat.scrollTop = elemChat.scrollHeight;
			
			// Also scroll the window/page to the bottom
			window.scrollTo({
				top: document.body.scrollHeight,
				behavior: 'smooth'
			});
			
			console.log('Scrolling both container and page to bottom');
		}
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const isClickInside = target.closest('.lucide-icon') || target.closest('.action-menu-btn');
		if (showActionsMenu && !isClickInside) {
			console.log('Click outside actions menu');
			showActionsMenu = false;
		}
	}

	// Action handling functions
	function createListFromSelection() {
		showListCreationModal = true;
		showActionsMenu = false;
	}

	function handleAction(action: string) {
		// Handle different actions based on selection
		switch (action) {
			case 'recommend':
				// Send empty message but with movie recommendation flag turned on
				// This will use the selected movies for recommendations
				chatStore.sendMessage('', true);
				break;
			case 'watchlist':
				alert(`Adding ${$selectedMovies.length} movies to watchlist`);
				break;
			case 'download':
				showDownloadModal = true;
				break;
			case 'share':
				alert(`Sharing ${$selectedMovies.length} movies`);
				break;
		}
		console.log('Action:', action);
		showActionsMenu = false;
	}

	// Reactive statements to handle updates
	$effect(() => {
		// When messages change, scroll to bottom
		if ($chatStore.messages && $chatStore.messages.length > 0) {
			// Wait a short tick to ensure DOM is updated
			setTimeout(() => scrollToLatestMessage(), 100);
		}
	});
	
	// Watch the selectedMoviesBar appearance
	$effect(() => {
		// Only scroll when movies are first added (from 0)
		if ($selectedMovies && $selectedMovies.length === 1) {
			// Wait a short tick to ensure DOM is updated
			setTimeout(() => scrollToLatestMessage(), 100);
		}
	});
</script>

<div class="mx-4 mt-4 flex h-[calc(100vh-40px)] relative">
	<!-- Side Panel -->
	{#if showSidePanel}
		<SidePanel
			chats={$chatStore.chats}
			currentChatId={$chatStore.currentChatId || ''}
			on:selectChat={(e) => chatStore.selectChat(e.detail)}
		/>
	{/if}

	<!-- Main Chat Area -->
	<section class="card bg-surface-100-900 rounded-container flex-1 overflow-hidden flex flex-col">
		<div class="mb-2 flex justify-between p-4">
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
			<div class="alert alert-error mx-4 mb-4 p-2" transition:fade>
				<span>{$chatError.message}</span>
				<button class="btn btn-sm" on:click={() => chatStore.clearError()}>Dismiss</button>
			</div>
		{/if}

		<!-- Main chat container with flex-grow to push input to bottom -->
		<div class="flex-grow flex flex-col overflow-hidden">
			<!-- Scrollable message area -->
			<div bind:this={elemChat} class="chat-container flex-grow overflow-y-auto p-4 space-y-2">
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
							toggleSelection={(movie) => chatStore.toggleMovieSelection(movie)}
						/>
					{/each}
				{/if}

				<!-- Loading indicator -->
				{#if $chatLoading && !isInitializing && $chatStore.messages.length === 0}
					<div class="flex justify-center p-4">
						<span class="loading loading-spinner loading-lg"></span>
					</div>
				{/if}
			</div>
            
            <!-- Selected movies bar (if any) -->
            {#if $selectedMovies.length > 0}
                <SelectedMoviesBar
                    selectedMovies={$selectedMovies}
                    {showActionsMenu}
                    toggleSelection={(movie) => chatStore.toggleMovieSelection(movie)}
                    createList={createListFromSelection}
                    handleAction={(e) => handleAction(e)}
                    toggleMenu={() => {
                        console.log(showActionsMenu);
                        showActionsMenu = !showActionsMenu;
                    }}
                />
            {/if}
            
			<!-- Input area always at the bottom of the flex container -->
			<ChatInput
				bind:currentMessage
				hasSelectedMovies={$selectedMovies.length > 0}
				disabled={showTypingIndicator || $chatLoading}
			/>
		</div>
	</section>
</div>

<!-- Modals -->
<DownloadRequestModal 
	show={showDownloadModal} 
	selectedMovies={$selectedMovies} 
	on:close={() => showDownloadModal = false} 
	on:downloadRequested={() => chatStore.clearSelectedMovies()}
/>

<ListCreationModal 
	show={showListCreationModal} 
	selectedMovies={$selectedMovies} 
	on:close={() => showListCreationModal = false} 
	on:listCreated={() => chatStore.clearSelectedMovies()}
/>

<style>
	:global(.full-page) {
		min-height: calc(100dvh - 120px);
	}
</style>