<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Message, Movie } from './types';
	import TypingIndicator from './TypingIndicator.svelte';
	import StreamingText from './StreamingText.svelte';
	import { onMount } from 'svelte';
	import chatStore, { mediaClients, pendingRecommendations } from '$lib/stores/chat';
	import { clientsApi } from '$lib/stores/api';
	import { get } from 'svelte/store';
	import type { MediaItemMovie, ClientResponse } from '$lib/api/types';
	import { GET } from '$lib/api/client';
	import EnhancedMovieCard from './EnhancedMovieCard.svelte';

	type ChatMessageProps = {
		message: Message;
		selectedMovies: Movie[];
		showTyping: boolean;
		toggleSelection?: (movie: Movie) => void;
	};

	let { message, selectedMovies, showTyping, toggleSelection }: ChatMessageProps = $props();

	// Track library status of movies
	let libraryStatus = $state({});
	let mediaClient = $state<ClientResponse | null>(null);

	// Track the pending movie recommendations to show inline
	let inlinePendingMovies = $state<Movie[]>([]);
	let textAnimationComplete = $state(false);

	// Flag to prevent multiple metadata fetch operations
	let isProcessingMetadata = $state(false);

	// Keep track of whether this message should show recommendations
	let messageRecommendationId = $state<number | null>(null);

	// For text animation
	let textContent = $state<string | undefined>('');
	textContent = message.content.type === 'text' ? message.content.text : '';

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

	// Helper to check if this is the latest AI message
	function isLatestAiMessage(): boolean {
		const messages = chatStore.getState().messages;
		// Find the latest AI message
		for (let i = messages.length - 1; i >= 0; i--) {
			if (messages[i].sender === 'ai') {
				// If this is the latest AI message
				return messages[i].id === message.id;
			}
		}
		return false;
	}

	// Track which movie sets we've already processed
	const processedMovieSets = new Set();

	// Fetch movie metadata from media client using stores
	async function fetchMovieMetadata() {
		// Prevent multiple concurrent executions
		if (isProcessingMetadata) {
			console.log(
				`Already processing metadata for message ID ${message.id}, skipping duplicate call`
			);
			return;
		}

		if (message.content.type !== 'movieList' && message.content.type !== 'text') {
			return;
		}

		// Get the list of movies to check - either from the message content or pending recommendations
		const moviesToCheck =
			message.content.type === 'movieList' ? message.content.movies : inlinePendingMovies || [];

		if (!moviesToCheck?.length) {
			return;
		}

		// Create a unique identifier for this set of movies
		const movieIds = moviesToCheck
			.map((m) => m.id)
			.sort()
			.join(',');

		// Skip if we've already processed this exact set of movies
		if (processedMovieSets.has(movieIds)) {
			console.log(
				`Already processed this exact set of movies for message ID ${message.id}, skipping`
			);
			return;
		}

		// Mark this set as processed
		processedMovieSets.add(movieIds);

		// Set processing flag
		isProcessingMetadata = true;
		console.log(
			`Starting metadata processing for message ID ${message.id} with ${moviesToCheck.length} movies`
		);

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
				console.log(
					`Checking library status for ${moviesToCheck.length} movies using client ${mediaClient.name}`
				);

				// Keep track of which movies were updated
				let updatedMovies = false;

				// For each movie, check if it exists in the library
				for (const movie of moviesToCheck) {
					try {
						if (!movie.title) continue;

						// Use the API client instead of fetch
						const searchResponse = await GET(
							`/client/${mediaClient.clientType}/${mediaClient.id}/movie/search?q=${encodeURIComponent(movie.title)}`
						);

						// If we found a match, mark it as in library
						if (searchResponse.data?.data?.length > 0) {
							const mediaItem = searchResponse.data.data[0] as MediaItemMovie;
							libraryStatus[movie.id] = true;
							updatedMovies = true;
							console.log(`Found ${movie.title} in library, updating metadata`);

							// Update the movie with additional metadata from the media client
							if (mediaItem && mediaItem.data) {
								movie.inLibrary = true;
								movie.mediaClientId = mediaClient.id;
								movie.mediaItemId = mediaItem.id;

								console.log(`Updating metadata for ${movie.title}`, mediaItem);
								// Update properties that might affect rendering
								movie.poster =
									mediaItem?.data.Details?.artwork?.poster ||
									movie.poster ||
									movie.Details?.artwork?.poster;
								movie.backdrop =
									mediaItem?.data.Details?.artwork?.background ||
									movie.backdrop ||
									movie.Details?.artwork?.background;
								movie.overview =
									mediaItem?.data?.Details?.description ||
									movie.overview ||
									movie.Details?.description;
								movie.genres =
									mediaItem?.data?.Details?.genres || movie.genres || movie.details?.genres;
								movie.year =
									mediaItem?.data?.Details?.releaseYear || movie.year || movie.details?.releaseYear;
								movie.rating =
									movie.rating ||
									movie.details?.userRating ||
									(movie.details?.ratings?.imdb ? movie.details.ratings.imdb : 0);
								movie.cast = mediaItem.data?.cast || [];
								console.log(`Updated metadata for ${movie.title} with poster ${movie.poster}`);
							}
						}
					} catch (err) {
						console.error(`Error checking library status for ${movie.title}:`, err);
					}
				}

				// If we're working with inline pending movies and made updates, force reactivity
				if (
					updatedMovies &&
					message.content.type === 'text' &&
					moviesToCheck === inlinePendingMovies
				) {
					console.log(`Forcing reactivity update for inline movies`);
					// Use destructuring to create a new array, forcing Svelte to detect the change
					inlinePendingMovies = [...inlinePendingMovies];
				}
			}
		} catch (err) {
			console.error('Error fetching media clients:', err);
		} finally {
			// Reset processing flag
			isProcessingMetadata = false;
			console.log(`Completed metadata processing for message ID ${message.id}`);
		}
	}

	// Watch for text animation completion
	$effect(() => {
		console.log(
			`Message ID ${message.id}: Animation state changed: textAnimationComplete =`,
			textAnimationComplete
		);

		// Only process recommendations if animation is complete and we have a recommendation ID
		if (textAnimationComplete && message.sender === 'ai' && messageRecommendationId !== null) {
			console.log(
				`Message ID ${message.id}: Text animation complete, checking for recommendations with ID ${messageRecommendationId}`
			);

			// If we have recommendations, show them after animation
			const pendingRecs = get(pendingRecommendations);
			console.log(`Message ID ${message.id}: pendingRecommendations:`, pendingRecs);

			// Only process recommendations meant for this specific message
			if (
				pendingRecs &&
				pendingRecs.messageId === messageRecommendationId &&
				pendingRecs.movies &&
				pendingRecs.movies.length > 0
			) {
				console.log(
					`Message ID ${message.id}: Found pending recommendations (${pendingRecs.movies.length}) with matching ID ${messageRecommendationId}`
				);

				// Set the movies directly
				inlinePendingMovies = pendingRecs.movies;

				// Fetch metadata once for these movies, with a small delay to let state settle
				setTimeout(() => {
					fetchMovieMetadata();
				}, 50);

				// Clear the store since we're showing recommendations inline
				setTimeout(() => {
					chatStore.update((state) => ({ ...state, pendingRecommendations: null }));
				}, 500);
			} else {
				console.log(`Message ID ${message.id}: No matching or new recommendations found`);
			}
		}
	});

	// Fetch metadata when the component mounts
	onMount(() => {
		if (message.content.type === 'movieList' && message.content.movies?.length) {
			// For direct movie lists, fetch metadata once on mount
			fetchMovieMetadata();
		}

		// If this is an AI message with text content, check for pending recommendations
		if (message.content.type === 'text' && message.content.text && message.sender === 'ai') {
			const pendingRecs = get(pendingRecommendations);

			// Check if there are pending recommendations specifically for this message
			if (pendingRecs && pendingRecs.messageId === message.id) {
				console.log(`Message ID ${message.id}: Found matching recommendation ID on mount`);

				// Store the recommendation ID associated with this message
				messageRecommendationId = message.id;

				// If text animation is already complete, load the recommendations immediately
				if (textAnimationComplete && pendingRecs.movies && pendingRecs.movies.length > 0) {
					console.log(
						`Message ID ${message.id}: Loading recommendations immediately (animation already complete)`
					);
					inlinePendingMovies = pendingRecs.movies;

					// Fetch metadata for these recommendations
					setTimeout(() => {
						fetchMovieMetadata();
					}, 50);
				}
			} else {
				console.log(
					`Message ID ${message.id}: No matching recommendations (ID mismatch or none exist)`
				);
				messageRecommendationId = null;
				inlinePendingMovies = [];
			}
		} else {
			// Not an AI text message, so no recommendations
			messageRecommendationId = null;
			inlinePendingMovies = [];
		}
	});

	// We're removing the reactive effect that was causing re-renders
	// Instead we'll rely on explicit metadata fetching at specific points
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

		<!-- Text message content -->
		{#if message.content.type === 'text'}
			{#if showTyping && message.sender === 'ai' && !message.content.text}
				<!-- Show typing indicator when no text is available yet -->
				<div class="mt-2">
					<TypingIndicator showIndicator={true} />
				</div>
			{:else if message.content.text}
				<!-- Use the dedicated streaming text component for AI messages -->
				{#if message.sender === 'ai'}
					<div class="streaming-container">
	<StreamingText text={message.content.text} bind:isComplete={textAnimationComplete} />
	{#if showTyping}
		<span class="typing-at-end ml-1 inline-flex">
			<TypingIndicator showIndicator={true} />
		</span>
	{/if}
</div>

					<!-- Show the inline movie recommendations after text animation is complete -->
					{#if textAnimationComplete && messageRecommendationId !== null && inlinePendingMovies.length > 0}
						<div class="movie-recommendations mt-4" in:fade={{ duration: 300 }}>
							<h4 class="mb-2 text-sm font-medium">Movie Recommendations:</h4>
							<div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
								{#each inlinePendingMovies as movie, i}
									<div in:fade={{ duration: 300, delay: i * 150 }}>
										<EnhancedMovieCard
											{movie}
											isSelected={isMovieSelected(movie.id)}
											toggleSelection={toggleMovieSelection}
											isInLibrary={isInLibrary(movie.id)}
										/>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				{:else}
					<!-- For user messages, no streaming needed -->
					<div class="formatted-text prose prose-sm dark:prose-invert max-w-none">
						<StreamingText text={message.content.text} speed={5} isComplete={true} />
					</div>
				{/if}
			{/if}
		{/if}

		<!-- Movie list content (direct movie recommendations) -->
		{#if message.content.type === 'movieList' && message.content.movies}
			{#if message.content.text}
				<div class="formatted-text prose prose-sm dark:prose-invert max-w-none">
					<StreamingText text={message.content.text} speed={5} isComplete={true} />
				</div>
			{/if}
			<div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{#each message.content.movies as movie, i (movie.id)}
					<div in:fade={{ duration: 300, delay: i * 50 }}>
						<EnhancedMovieCard
							{movie}
							isSelected={isMovieSelected(movie.id)}
							toggleSelection={toggleMovieSelection}
							isInLibrary={isInLibrary(movie.id)}
						/>
					</div>
				{/each}
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

	.streaming-container {
		position: relative;
	}

	.typing-at-end {
		display: inline-flex;
		vertical-align: text-bottom;
		margin-left: 0;
	}
</style>

