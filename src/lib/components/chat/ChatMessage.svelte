<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Message, Movie } from './types';
	import MovieThumbnail from './MovieThumbnail.svelte';
	import AnimatedMovieThumbnail from './AnimatedMovieThumbnail.svelte';
	import TypingIndicator from './TypingIndicator.svelte';
	import { marked } from 'marked';
	import { onMount } from 'svelte';
	import { mediaClients } from '$lib/stores/chat';
	import { clientsApi } from '$lib/stores/api';
	import { get } from 'svelte/store';
	import type { MediaItemMovie } from '$lib/api/types';
	import { GET } from '$lib/api/client';

	type ChatMessageProps = {
		message: Message;
		selectedMovies: Movie[];
		showTyping: boolean;
		toggleSelection?: (movie: Movie) => void;
	};

	let { message, selectedMovies, showTyping, toggleSelection }: ChatMessageProps = $props();

	// Track library status of movies
	let libraryStatus: Record<string, boolean> = $state({});
	let mediaClient: any = $state(null);

	function toggleMovieSelection(movie: Movie) {
		toggleSelection?.(movie);
	}

	function isMovieSelected(id: string) {
		return selectedMovies.some((m) => m.id === id);
	}

	// Check if a movie is in the user's library
	function isInLibrary(movieId: string): boolean {
		return !!libraryStatus[movieId];
	}

	// Fetch movie metadata from media client using stores
	async function fetchMovieMetadata() {
		if (message.content.type !== 'movieList' || !message.content.movies?.length) {
			return;
		}

		try {
			// First try to get media clients from the store
			const availableMediaClients = get(mediaClients);

			// If none in store, load them using the clients API
			if (!availableMediaClients || availableMediaClients.length === 0) {
				await clientsApi.loadClients();
				const allClients = clientsApi.getState().clients;
				// Filter for media clients
				const mediaClientTypes = ['plex', 'emby', 'jellyfin', 'subsonic'];
				const mediaClientsFiltered = allClients.filter(
					(client) =>
						client.clientType && mediaClientTypes.includes(client.clientType.toLowerCase())
				);

				if (mediaClientsFiltered.length > 0) {
					mediaClient = mediaClientsFiltered[0];
				}
			} else {
				// Use the first available media client from the store
				mediaClient = availableMediaClients[0];
			}

			if (mediaClient) {
				// For each movie, check if it exists in the library
				for (const movie of message.content.movies) {
					try {
						// Use the API client instead of fetch
						const searchResponse = await GET(
							`/client/${mediaClient.clientType}/${mediaClient.id}/movie/search?q=${movie.title}`
						);

						// If we found a match, mark it as in library
						if (searchResponse.data?.data?.length > 0) {
							const mediaItem = searchResponse.data.data[0] as MediaItemMovie;
							libraryStatus[movie.id] = true;

							// Update the movie with additional metadata from the media client
							if (mediaItem && mediaItem.data) {
								Object.assign(movie, {
									inLibrary: true,
									mediaClientId: mediaClient.id,
									mediaItemId: mediaItem.id,
									poster:
										mediaItem?.data.details?.artwork?.poster ||
										movie.poster ||
										movie.details?.artwork?.poster,
									backdrop:
										mediaItem?.data.details?.artwork?.background ||
										movie.backdrop ||
										movie.details?.artwork?.background,
									overview:
										mediaItem?.data?.details?.description ||
										movie.overview ||
										movie.details?.description,
									genres: mediaItem?.data?.details?.genres || movie.genres || movie.details?.genres,
									year:
										mediaItem?.data?.details?.releaseYear ||
										movie.year ||
										movie.details?.releaseYear,
									rating:
										// mediaItem?.data?.details?.rating ||
										movie.rating ||
										movie.details?.userRating ||
										(movie.details?.ratings?.imdb ? movie.details.ratings.imdb : 0),
									// director: mediaItem.data.details?.director || '',
									cast: mediaItem.data?.cast || []
									// runtime: mediaItem.data.runtime || 0
								});
							}
						}
					} catch (err) {
						console.error(`Error checking library status for ${movie.title}:`, err);
					}
				}
			}
		} catch (err) {
			console.error('Error fetching media clients:', err);
		}
	}

	// Fetch metadata when the component mounts
	onMount(() => {
		if (message.content.type === 'movieList' && message.content.movies?.length) {
			fetchMovieMetadata();
		}
	});

	// Function to format text with proper line breaks and markdown
	function formatText(text: string) {
		// Process with markdown
		try {
			// Process with markdown if it contains markdown syntax
			if (
				text.includes('#') ||
				text.includes('*') ||
				text.includes('```') ||
				text.includes('|') ||
				(text.includes('[') && text.includes(']'))
			) {
				return marked(text);
			}
		} catch (error) {
			console.error('Error parsing markdown:', error);
		}

		// If no markdown or parsing failed, just handle line breaks
		return text
			.split('\n')
			.map((line) => `<p>${line || ' '}</p>`)
			.join('');
	}
</script>

<div
	class="grid gap-2"
	class:grid-cols-[auto_1fr]={message.sender === 'ai'}
	class:grid-cols-[1fr_auto]={message.sender === 'user'}
	in:fade={{ duration: 200 }}
>
	{#if message.sender === 'ai'}
		<div
			class="avatar bg-surface-300-600-token flex h-16 w-16 items-center justify-center overflow-hidden rounded-full"
		>
			<img
				src={`https://i.pravatar.cc/?img=${message.avatar}`}
				alt={message.name}
				class="h-full w-full object-cover"
			/>
		</div>
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
			<div class="formatted-text prose prose-sm dark:prose-invert max-w-none">
				{@html formatText(message.content.text)}
			</div>
		{/if}

		{#if message.content.type === 'movieList' && message.content.movies}
			{#if message.content.text}
				<div class="formatted-text prose prose-sm dark:prose-invert max-w-none">
					{@html formatText(message.content.text)}
				</div>
			{/if}
			<div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
				{#each message.content.movies as movie, i}
					<AnimatedMovieThumbnail
						{movie}
						selected={isMovieSelected(movie.id)}
						index={i}
						inLibrary={!!libraryStatus[movie.id]}
						onToggleSelection={() => toggleMovieSelection(movie)}
					/>
				{/each}
			</div>
		{/if}

		<!-- Typing indicator shown when AI is thinking -->
		{#if showTyping && message.sender === 'ai'}
			<div class="mt-2">
				<TypingIndicator showIndicator={true} />
			</div>
		{/if}
	</div>

	{#if message.sender === 'user'}
		<div
			class="avatar bg-primary-300 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full"
		>
			<img
				src={`https://i.pravatar.cc/?img=${message.avatar}`}
				alt={message.name}
				class="h-full w-full object-cover"
			/>
		</div>
	{/if}
</div>

<style>
	.formatted-text :global(p) {
		margin-bottom: 0.5rem;
	}

	.formatted-text :global(p:last-child) {
		margin-bottom: 0;
	}

	.formatted-text :global(ul),
	.formatted-text :global(ol) {
		margin-left: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.formatted-text :global(code) {
		background-color: rgba(0, 0, 0, 0.1);
		padding: 0.1rem 0.2rem;
		border-radius: 3px;
		font-family: monospace;
	}

	.formatted-text :global(pre) {
		background-color: rgba(0, 0, 0, 0.1);
		padding: 0.5rem;
		border-radius: 5px;
		overflow-x: auto;
		margin-bottom: 0.5rem;
	}

	.formatted-text :global(blockquote) {
		border-left: 3px solid rgba(0, 0, 0, 0.2);
		padding-left: 0.5rem;
		margin-left: 0.5rem;
		font-style: italic;
	}
</style>
