<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { Plus, Play, Info, Star, Check, Send, List, MoreVertical } from '@lucide/svelte';
	import { Avatar } from '@skeletonlabs/skeleton-svelte';

	// Types for movies and messages
	interface Movie {
		id: string;
		title: string;
		year: number;
		type: 'movie' | 'series';
		poster: string;
		genres: string[];
		rating: number;
		overview: string;
	}

	interface MessageContent {
		type: 'text' | 'movieList';
		text?: string;
		movies?: Movie[];
	}

	interface Message {
		id: number;
		sender: 'user' | 'ai';
		avatar: number;
		name: string;
		timestamp: string;
		content: MessageContent;
	}

	// State
	let elemChat: HTMLElement;
	let currentMessage = '';
	let selectedMovies: Movie[] = [];
	let messages: Message[] = [];
	let showActionsMenu = false;

	// Sample movies data
	let sampleMovies = [
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
		// Add this for closing the dropdown when clicking outside
		document.addEventListener('click', handleClickOutside);

		// Add welcome message
		addMessageFromAI({
			type: 'text',
			text: "Hi! I'm your movie recommendation assistant. What kind of movies do you enjoy watching?"
		});

		// Show some example movie
		addMessageFromAI({
			type: 'movieList',
			text: 'Here are some popular titles you might like:',
			movies: sampleMovies
		});

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	function getCurrentTimestamp(): string {
		return new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
	}

	function scrollChatBottom(behavior = 'smooth') {
		elemChat.scrollTo({ top: elemChat.scrollHeight, behavior });
	}

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

	function toggleMovieSelection(movie) {
		const index = selectedMovies.findIndex((m) => m.id === movie.id);
		if (index === -1) {
			selectedMovies = [...selectedMovies, movie];
		} else {
			selectedMovies = selectedMovies.filter((m) => m.id !== movie.id);
		}
	}

	function isMovieSelected(id) {
		return selectedMovies.some((m) => m.id === id);
	}

	function onPromptKeydown(event) {
		if (['Enter'].includes(event.code) && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
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

	// Close the menu when clicking outside
	function handleClickOutside(event) {
		if (showActionsMenu && !event.target.closest('.actions-menu')) {
			showActionsMenu = false;
		}
	}
</script>

<section
	class="card bg-surface-100-900 rounded-container full-page mt-8 mr-4 ml-4 overflow-hidden p-4"
>
	<div class="chat grid h-full w-full grid-rows-[1fr_auto_auto]">
		<!-- Conversation -->
		<section
			bind:this={elemChat}
			class="max-h-[600px] space-y-4 overflow-y-auto p-4 md:min-h-[500px]"
		>
			{#each messages as message (message.id)}
				<div
					class="grid gap-2"
					class:grid-cols-[auto_1fr]={message.sender === 'ai'}
					class:grid-cols-[1fr_auto]={message.sender === 'user'}
					in:fade={{ duration: 200 }}
				>
					{#if message.sender === 'ai'}
						<Avatar
							src={`https://i.pravatar.cc/?img=${message.avatar}`}
							name={message.name}
							classes="w-16"
						/>
					{/if}

					<div
						class="card space-y-2 p-4"
						class:preset-tonal={message.sender === 'ai'}
						class:preset-tonal-primary={message.sender === 'user'}
						class:rounded-tl-none={message.sender === 'ai'}
						class:rounded-tr-none={message.sender === 'user'}
					>
						<header class="flex items-center justify-between">
							<p class="font-bold">{message.name}</p>
							<small class="opacity-50">{message.timestamp}</small>
						</header>

						{#if message.content.type === 'text' && message.content.text}
							<p>{message.content.text}</p>
						{/if}

						{#if message.content.type === 'movieList' && message.content.movies}
							{#if message.content.text}
								<p>{message.content.text}</p>
							{/if}
							<div class="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
								{#each message.content.movies as movie}
									<div
										class="card hover:ring-primary-500 w-full max-w-[150px] overflow-hidden transition-all hover:ring-2"
									>
										<div class="relative">
											<img
												src={movie.poster}
												alt={movie.title}
												class="h-[120px] w-full object-cover"
											/>
											<div
												class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"
											></div>
											<div class="absolute bottom-0 left-0 p-2 text-white">
												<h4 class="text-sm font-bold">{movie.title}</h4>
												<div class="flex items-center gap-1 text-xs">
													<span>{movie.year}</span>
													<span class="flex items-center gap-1">
														<Star size={10} class="text-yellow-400" />
														{movie.rating}
													</span>
												</div>
											</div>

											<button
												class="hover:bg-primary-500 absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full {isMovieSelected(
													movie.id
												)
													? 'bg-primary-500'
													: 'bg-black/70'} z-10 text-white"
												on:click={() => toggleMovieSelection(movie)}
											>
												{#if isMovieSelected(movie.id)}
													<Check size={14} />
												{:else}
													<Plus size={14} />
												{/if}
											</button>
										</div>
										<div class="p-2">
											<div class="flex flex-wrap gap-1">
												{#each movie.genres.slice(0, 2) as genre}
													<span class="bg-surface-200-800 rounded-full p-1 px-1.5 py-0 text-xs"
														>{genre}</span
													>
												{/each}
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					{#if message.sender === 'user'}
						<Avatar
							src={`https://i.pravatar.cc/?img=${message.avatar}`}
							name={message.name}
							classes="w-16"
						/>
					{/if}
				</div>
			{/each}
		</section>

		<!-- Selected movies -->
		{#if selectedMovies.length > 0}
			<div class="border-surface-200-800 flex items-center justify-between border-t p-2">
				<div class="flex gap-2 overflow-x-auto">
					{#each selectedMovies as movie}
						<div class="relative w-16 flex-shrink-0">
							<img src={movie.poster} alt={movie.title} class="h-24 w-16 rounded object-cover" />
							<button
								class="bg-primary-500 absolute flex h-5 w-5 items-center justify-center rounded-full text-white"
								style={'top: 3px; left: 8px'}
								on:click={() => toggleMovieSelection(movie)}
							>
								<Check size={12} />
							</button>
							<div class="absolute right-0 bottom-0 left-0 bg-black/80 p-1">
								<p class="truncate text-xs text-white">{movie.title}</p>
							</div>
						</div>
					{/each}
				</div>

				<div class="flex gap-2">
					<nav class="btn-group preset-outlined-surface-200-800 flex-col p-1">
						<button
							type="button"
							class="btn preset-filled flex items-center gap-1 p-2"
							on:click={createListFromSelection}
						>
							<List size={16} />
						</button>

						<div class="relative">
							<button
								type="button"
								class="btn hover:preset-tonal p-2"
								on:click={() => (showActionsMenu = !showActionsMenu)}
							>
								<MoreVertical size={16} />
							</button>

							{#if showActionsMenu}
								<div
									class="bg-surface-100-800 actions-menu absolute right-0 bottom-full z-20 mb-1 w-48 rounded shadow-lg"
									transition:fade
								>
									<ul class="py-1">
										<li>
											<button
												class="hover:bg-primary-500/20 w-full px-4 py-2 text-left"
												on:click={() => handleAction('watchlist')}
											>
												Add to Watchlist
											</button>
										</li>
										<li>
											<button
												class="hover:bg-primary-500/20 w-full px-4 py-2 text-left"
												on:click={() => handleAction('download')}
											>
												Request Downloads
											</button>
										</li>
										<li>
											<button
												class="hover:bg-primary-500/20 w-full px-4 py-2 text-left"
												on:click={() => handleAction('share')}
											>
												Share Selection
											</button>
										</li>
									</ul>
								</div>
							{/if}
						</div>
					</nav>
				</div>
			</div>
		{/if}

		<!-- Input area -->
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
					class="input-group-cell p-3 {currentMessage || selectedMovies.length > 0
						? 'preset-filled-primary-500'
						: 'preset-tonal'}"
					on:click={sendMessage}
				>
					<Send size={18} />
				</button>
			</div>
		</section>
	</div>
</section>

<style>
	:global(.full-page) {
		min-height: calc(100dvh - 120px);
	}
</style>
