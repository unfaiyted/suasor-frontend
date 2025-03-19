<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { Send, List, MoreVertical } from '@lucide/svelte';

	// Import types and components - use proper paths
	import type { Movie, Message, MessageContent, Chat } from '$lib/components/chat/types';
	import ChatMessage from '$lib/components/chat/ChatMessage.svelte';
	import ChatInput from '$lib/components/chat/ChatInput.svelte';
	import SelectedMoviesBar from '$lib/components/chat/SelectedMoviesBar.svelte';
	import SidePanel from '$lib/components/chat/SidePanel.svelte';

	// State
	let elemChat: HTMLElement;
	let currentMessage = '';
	let selectedMovies: Movie[] = [];
	let messages: Message[] = [];
	let showActionsMenu = false;
	let showSidePanel = true;

	// Chat history state
	let chats: Chat[] = [];
	let currentChatId = crypto.randomUUID();

	// Sample movies data (using the existing data)
	let sampleMovies: Movie[] = [
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

	onMount(() => {
		document.addEventListener('click', handleClickOutside);

		// Initialize first chat
		startNewChat();

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	// Utility functions
	function getCurrentTimestamp(): string {
		return new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
	}

	function scrollChatBottom(behavior = 'smooth') {
		if (elemChat) {
			elemChat.scrollTo({ top: elemChat.scrollHeight, behavior: behavior as ScrollBehavior });
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (showActionsMenu && !event.target.closest('.actions-menu')) {
			showActionsMenu = false;
		}
	}

	// Chat management functions
	function startNewChat() {
		// Save current chat if it has messages
		if (messages.length > 0) {
			saveCurrentChat();
		}

		// Create new chat
		currentChatId = crypto.randomUUID();
		messages = [];
		selectedMovies = [];

		// Add to chat list
		chats = [
			{
				id: currentChatId,
				title: `Chat ${chats.length + 1}`,
				timestamp: getCurrentTimestamp(),
				messages: [],
				recommendations: []
			},
			...chats
		];

		// Add welcome message
		addMessageFromAI({
			type: 'text',
			text: "Hi! I'm your movie recommendation assistant. What kind of movies do you enjoy watching?"
		});

		// Show example movies
		addMessageFromAI({
			type: 'movieList',
			text: 'Here are some popular titles you might like:',
			movies: sampleMovies
		});
	}

	function saveCurrentChat() {
		// Find the current chat and update it
		const currentChatIndex = chats.findIndex((chat) => chat.id === currentChatId);
		if (currentChatIndex !== -1) {
			// Extract recommended movies from AI messages
			const recommendations = messages
				.filter((m) => m.sender === 'ai' && m.content.type === 'movieList' && m.content.movies)
				.flatMap((m) => m.content.movies || []);

			// Update chat
			const updatedChat = {
				...chats[currentChatIndex],
				messages: [...messages],
				recommendations: recommendations,
				// Update title based on first user message if available
				title:
					messages
						.find((m) => m.sender === 'user' && m.content.type === 'text')
						?.content.text?.slice(0, 25) + '...' || chats[currentChatIndex].title
			};

			// Replace in array
			chats = chats.map((chat) => (chat.id === currentChatId ? updatedChat : chat));
		}
	}

	function selectChat(chatId: string) {
		// Save current chat
		if (messages.length > 0) {
			saveCurrentChat();
		}

		// Find selected chat
		const selectedChat = chats.find((chat) => chat.id === chatId);
		if (selectedChat) {
			currentChatId = chatId;
			messages = [...selectedChat.messages];
			selectedMovies = [];

			// Scroll to bottom after render
			setTimeout(() => scrollChatBottom(), 0);
		}
	}

	// Message handling functions
	function addMessageFromUser(content: MessageContent) {
		messages = [
			...messages,
			{
				id: messages.length,
				sender: 'user',
				avatar: 48,
				name: 'You',
				timestamp: `Today @ ${getCurrentTimestamp()}`,
				content
			}
		];
		setTimeout(() => scrollChatBottom(), 0);

		// Simulate AI response
		setTimeout(() => simulateAIResponse(), 1000);
	}

	function addMessageFromAI(content: MessageContent) {
		messages = [
			...messages,
			{
				id: messages.length,
				sender: 'ai',
				avatar: 14,
				name: 'MovieAI',
				timestamp: `Today @ ${getCurrentTimestamp()}`,
				content
			}
		];
		setTimeout(() => scrollChatBottom(), 0);
	}

	function simulateAIResponse() {
		if (selectedMovies.length > 0) {
			addMessageFromAI({
				type: 'text',
				text: `Based on ${selectedMovies.map((m) => m.title).join(', ')}, here are some recommendations:`
			});
			addMessageFromAI({
				type: 'movieList',
				movies: sampleMovies.filter((m) => !selectedMovies.some((s) => s.id === m.id))
			});
		} else {
			addMessageFromAI({
				type: 'text',
				text: "I'd recommend these movies based on your interests:"
			});
			addMessageFromAI({
				type: 'movieList',
				movies: sampleMovies.slice(0, 2)
			});
		}
	}

	// Message action functions
	function sendMessage() {
		if (currentMessage.trim()) {
			addMessageFromUser({
				type: 'text',
				text: currentMessage
			});
			currentMessage = '';
		} else if (selectedMovies.length > 0) {
			addMessageFromUser({
				type: 'movieList',
				text: "I'd like recommendations based on these movies:",
				movies: [...selectedMovies]
			});
			selectedMovies = [];
		}
	}

	function toggleMovieSelection(movie: Movie) {
		const index = selectedMovies.findIndex((m) => m.id === movie.id);
		if (index === -1) {
			selectedMovies = [...selectedMovies, movie];
		} else {
			selectedMovies = selectedMovies.filter((m) => m.id !== movie.id);
		}
	}

	function createListFromSelection() {
		// Implementation for creating a list in Plex/Emby
		alert(`Creating a list with ${selectedMovies.length} movies for Plex/Emby`);
		// You would typically call an API here
		showActionsMenu = false;
	}

	function handleAction(action: string) {
		// Handle different actions based on selection
		switch (action) {
			case 'watchlist':
				alert(`Adding ${selectedMovies.length} movies to watchlist`);
				break;
			case 'download':
				alert(`Requesting downloads for ${selectedMovies.length} movies`);
				break;
			case 'share':
				alert(`Sharing ${selectedMovies.length} movies`);
				break;
		}
		showActionsMenu = false;
	}
</script>

<div class="mx-4 mt-8 flex h-full">
	<!-- Side Panel -->
	{#if showSidePanel}
		<SidePanel
			{chats}
			{currentChatId}
			on:selectChat={(e: CustomEvent<string>) => selectChat(e.detail)}
		/>
	{/if}

	<!-- Main Chat Area -->
	<section class="card bg-surface-100-900 rounded-container flex-1 overflow-hidden p-4">
		<div class="mb-2 flex justify-between">
			<button class="btn btn-sm" on:click={() => (showSidePanel = !showSidePanel)}>
				{showSidePanel ? 'Hide' : 'Show'} History
			</button>

			<button class="btn btn-sm preset-filled" on:click={startNewChat}> New Chat </button>
		</div>

		<div class="chat grid h-full w-full grid-rows-[1fr_auto_auto] pb-6">
			<!-- Conversation -->
			<section
				bind:this={elemChat}
				class="max-h-[600px] space-y-4 overflow-y-auto p-4 md:min-h-[500px]"
			>
				{#each messages as message (message.id)}
					<ChatMessage
						{message}
						{selectedMovies}
						on:toggleSelection={(e: CustomEvent<Movie>) => toggleMovieSelection(e.detail)}
					/>
				{/each}
			</section>

			<!-- Selected movies bar -->
			{#if selectedMovies.length > 0}
				<SelectedMoviesBar
					{selectedMovies}
					{showActionsMenu}
					on:toggleSelection={(e: CustomEvent<Movie>) => toggleMovieSelection(e.detail)}
					on:createList={createListFromSelection}
					on:handleAction={(e: CustomEvent<string>) => handleAction(e.detail)}
					on:toggleMenu={() => (showActionsMenu = !showActionsMenu)}
				/>
			{/if}

			<!-- Input area -->
			<ChatInput
				bind:currentMessage
				hasSelectedMovies={selectedMovies.length > 0}
				on:sendMessage={sendMessage}
			/>
		</div>
	</section>
</div>

<style>
	:global(.full-page) {
		min-height: calc(100dvh - 120px);
	}
</style>
