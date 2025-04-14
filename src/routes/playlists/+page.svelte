<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import {
		playlistApi,
		playlists,
		selectedPlaylistItems,
		selectedPlaylist,
		isReorderingPlaylist
	} from '$lib/stores/playlistStore';
	import { movieCart, type CartMovie } from '$lib/stores/movieCart';
	import MovieGrid from '$lib/components/movie/MovieGrid.svelte';
	import MediaList from '$lib/components/media/MediaList.svelte';
	import PlaylistEditor from '$lib/components/media/PlaylistEditor.svelte';
	import LoadingSpinner from '$lib/components/util/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/util/ErrorAlert.svelte';

	// UI state
	let isLoading = $state<boolean>(true);
	let error = $state<string>('');
	let userPlaylists = $state<any[]>([]);
	let selectedPlaylistId = $state<string | null>(null);
	let showPlaylistEditor = $state<boolean>(false);
	let listView = $state<'grid' | 'list'>('list');
	let cartItems = $state<CartMovie[]>([]);
	let autoOpenCreateFromCart = $state<boolean>(false);

	// Add mock data for demo purposes
	const mockPlaylists = [
		{
			id: 'playlist-1',
			name: 'Sci-Fi Favorites',
			description: 'My favorite science fiction movies',
			itemCount: 5,
			items: [
				{
					id: 'media-1',
					mediaItemId: 'media-1',
					title: 'Interstellar',
					release_date: '2014-11-07',
					poster_path: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
					genres: ['Sci-Fi', 'Adventure', 'Drama'],
					rating: 8.6,
					order: 0
				},
				{
					id: 'media-2',
					mediaItemId: 'media-2',
					title: 'Blade Runner 2049',
					release_date: '2017-10-06',
					poster_path: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
					genres: ['Sci-Fi', 'Drama', 'Mystery'],
					rating: 8.0,
					order: 1
				},
				{
					id: 'media-3',
					mediaItemId: 'media-3',
					title: 'Arrival',
					release_date: '2016-11-11',
					poster_path: 'https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg',
					genres: ['Sci-Fi', 'Drama', 'Mystery'],
					rating: 7.9,
					order: 2
				},
				{
					id: 'media-4',
					mediaItemId: 'media-4',
					title: 'Dune',
					release_date: '2021-10-22',
					poster_path: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
					genres: ['Sci-Fi', 'Adventure'],
					rating: 8.0,
					order: 3
				},
				{
					id: 'media-5',
					mediaItemId: 'media-5',
					title: 'The Martian',
					release_date: '2015-10-02',
					poster_path: 'https://image.tmdb.org/t/p/w500/5BHuvQ6p9kfc091Z8RiFNhCwL4b.jpg',
					genres: ['Sci-Fi', 'Adventure', 'Drama'],
					rating: 7.7,
					order: 4
				}
			]
		},
		{
			id: 'playlist-2',
			name: 'Oscar Winners',
			description: 'Academy Award winning films',
			itemCount: 4,
			items: [
				{
					id: 'media-6',
					mediaItemId: 'media-6',
					title: 'Parasite',
					release_date: '2019-05-30',
					poster_path: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
					genres: ['Thriller', 'Comedy', 'Drama'],
					rating: 8.5,
					order: 0
				},
				{
					id: 'media-7',
					mediaItemId: 'media-7',
					title: 'Everything Everywhere All at Once',
					release_date: '2022-03-25',
					poster_path: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
					genres: ['Action', 'Adventure', 'Sci-Fi'],
					rating: 8.0,
					order: 1
				},
				{
					id: 'media-8',
					mediaItemId: 'media-8',
					title: 'The Shape of Water',
					release_date: '2017-12-01',
					poster_path: 'https://image.tmdb.org/t/p/w500/k4FwHlMhuRR5BISY2Gm2QZHlH5Q.jpg',
					genres: ['Drama', 'Fantasy', 'Romance'],
					rating: 7.3,
					order: 2
				},
				{
					id: 'media-9',
					mediaItemId: 'media-9',
					title: 'Nomadland',
					release_date: '2021-02-19',
					poster_path: 'https://image.tmdb.org/t/p/w500/66GUmWpTHgAjyp4jtmmlWvl1H6l.jpg',
					genres: ['Drama', 'Western'],
					rating: 7.4,
					order: 3
				}
			]
		},
		{
			id: 'playlist-3',
			name: 'Documentaries',
			description: 'Interesting documentaries to watch',
			itemCount: 3,
			items: [
				{
					id: 'media-10',
					mediaItemId: 'media-10',
					title: 'Summer of Soul',
					release_date: '2021-07-02',
					poster_path: 'https://image.tmdb.org/t/p/w500/8kNruSfhk5IoE4eZOc4UpvXJWpE.jpg',
					genres: ['Documentary', 'Music', 'History'],
					rating: 8.0,
					order: 0
				},
				{
					id: 'media-11',
					mediaItemId: 'media-11',
					title: 'Free Solo',
					release_date: '2018-09-28',
					poster_path: 'https://image.tmdb.org/t/p/w500/7alBxUomrgkS5HLJx3FQYFqXgCj.jpg',
					genres: ['Documentary', 'Adventure', 'Sport'],
					rating: 8.1,
					order: 1
				},
				{
					id: 'media-12',
					mediaItemId: 'media-12',
					title: 'My Octopus Teacher',
					release_date: '2020-09-07',
					poster_path: 'https://image.tmdb.org/t/p/w500/mWNadwBZIx8NyEuYcPBirYlWQpj.jpg',
					genres: ['Documentary', 'Nature'],
					rating: 8.0,
					order: 2
				}
			]
		}
	];

	// Utility functions
	const isInWatchlist = (id: string) => false; // Mock function, replace with actual implementation
	const isInCart = (id: string) => movieCart.isInCart(id);

	// Load user playlists
	onMount(async () => {
		try {
			// Subscribe to movie cart store
			const unsubscribe = movieCart.subscribe((store) => {
				cartItems = store.movies;
			});

			// In a real app, get playlists from the API
			// For demo purposes, use mock data
			userPlaylists = mockPlaylists;

			// For each playlist, set the playlist items in the store for demo
			mockPlaylists.forEach((playlist) => {
				playlistApi.update((state) => ({
					...state,
					playlists: {
						...state.playlists,
						[playlist.id]: playlist
					},
					playlistItems: {
						...state.playlistItems,
						[playlist.id]: playlist.items
					}
				}));
			});

			// Check URL parameters for actions from movie cart
			if (typeof window !== 'undefined') {
				const urlParams = new URLSearchParams(window.location.search);
				const action = urlParams.get('action');
				const ids = urlParams.get('ids');

				if (action === 'create' && ids) {
					// Auto-trigger the create playlist modal with cart items
					autoOpenCreateFromCart = true;

					// Set a small timeout to ensure the component is fully mounted
					setTimeout(() => {
						createPlaylistFromCart();
					}, 100);
				}
			}

			// If there are playlists, select the first one by default
			if (userPlaylists.length > 0) {
				handleSelectPlaylist(userPlaylists[0].id);
			}

			isLoading = false;
		} catch (err) {
			console.error(err);
			error = 'Failed to load playlists. Please try again.';
			isLoading = false;
		}
	});

	// Function to handle playlist selection
	async function handleSelectPlaylist(playlistId: string) {
		selectedPlaylistId = playlistId;
		playlistApi.setSelectedPlaylist(playlistId);

		// Load playlist items if needed
		await playlistApi.getPlaylistItems(playlistId);
	}

	// Function to create a new playlist
	function createNewPlaylist() {
		showPlaylistEditor = true;
	}

	// Function to get AI recommendations for the playlist
	function getRecommendations() {
		if (!selectedPlaylistId) return;
		console.log('Get AI recommendations for playlist', selectedPlaylistId);
	}

	// Function to edit playlist (rename, description, etc.)
	function editPlaylist() {
		if (!selectedPlaylistId) return;
		showPlaylistEditor = true;
	}

	// Function to delete playlist
	async function deletePlaylist() {
		if (!selectedPlaylistId) return;

		if (confirm('Are you sure you want to delete this playlist?')) {
			await playlistApi.deletePlaylist(selectedPlaylistId);
			selectedPlaylistId = null;

			// Refresh playlists
			const refreshedPlaylists = await playlistApi.getUserPlaylists();
			userPlaylists = refreshedPlaylists;

			// Select first playlist if available
			if (userPlaylists.length > 0) {
				handleSelectPlaylist(userPlaylists[0].id);
			}
		}
	}

	// Function to start reordering playlist items
	function startReordering() {
		if (!selectedPlaylistId) return;
		playlistApi.startReordering();
	}

	// Function to handle item selection
	function handleItemSelect(event) {
		const item = event.detail;
		console.log('Selected item:', item);
		if (item.id && typeof window !== 'undefined') {
			window.location.href = `/movies/${item.id}`;
		}
	}

	// Function to handle item removal
	async function handleItemRemove(event) {
		const { item, index } = event.detail;
		if (!selectedPlaylistId || !item) return;

		if (confirm(`Remove "${item.title}" from this playlist?`)) {
			const playlistItem = $selectedPlaylistItems[index];
			if (playlistItem) {
				await playlistApi.removeItemFromPlaylist(selectedPlaylistId, playlistItem.id);
				await playlistApi.getPlaylistItems(selectedPlaylistId);
			}
		}
	}

	// Function to handle reordering
	async function handleReorder(event) {
		const { fromIndex, toIndex } = event.detail;
		if (!selectedPlaylistId) return;

		const playlistItem = $selectedPlaylistItems[fromIndex];
		if (playlistItem) {
			await playlistApi.movePlaylistItem(selectedPlaylistId, playlistItem.id, toIndex);
			await playlistApi.getPlaylistItems(selectedPlaylistId);
		}
	}

	// Function to handle playlist creation
	async function handlePlaylistCreate(event) {
		const playlistData = event.detail;
		console.log('Created playlist:', playlistData);

		// In a real implementation, use the playlist data to create a playlist
		const newPlaylist = await playlistApi.createPlaylist(
			playlistData.name,
			playlistData.description
		);

		if (newPlaylist) {
			for (const itemId of playlistData.items) {
				await playlistApi.addItemToPlaylist(newPlaylist.id, itemId);
			}

			// Clear movie cart if the playlist was created from it
			if (autoOpenCreateFromCart) {
				movieCart.clearCart();
				autoOpenCreateFromCart = false;
			}

			// Refresh playlists and select the new one
			const refreshedPlaylists = await playlistApi.getUserPlaylists();
			userPlaylists = refreshedPlaylists;
			handleSelectPlaylist(newPlaylist.id);
		}
	}

	// Function to handle playlist update
	async function handlePlaylistUpdate(event) {
		const playlistData = event.detail;
		console.log('Updated playlist:', playlistData);

		if (selectedPlaylistId) {
			// Update playlist details
			await playlistApi.updatePlaylist(selectedPlaylistId, {
				name: playlistData.name,
				description: playlistData.description
			});

			// Refresh playlist data
			await playlistApi.getPlaylist(selectedPlaylistId);
		}
	}

	// Function to convert an array of playlist items to an array of movies
	function playlistItemsToMovies(items) {
		return items.map((item) => ({
			...item.mediaItem,
			id: item.mediaItemId
			// Add any other necessary transformations here
		}));
	}

	// Function to toggle between list and grid view
	function toggleView() {
		listView = listView === 'list' ? 'grid' : 'list';
	}

	// Function to create a playlist from cart items
	function createPlaylistFromCart() {
		if (cartItems.length === 0 && !autoOpenCreateFromCart) return;

		// Open the playlist editor with cart items pre-populated
		showPlaylistEditor = true;
	}

	// Function to display cart items section
	function hasCartItems() {
		return cartItems.length > 0;
	}
</script>

<svelte:head>
	<title>My Playlists | Suasor</title>
	<meta name="description" content="Browse and manage your media playlists" />
</svelte:head>

<div class="container mx-auto p-4">
	{#if isLoading}
		<div class="flex h-96 items-center justify-center">
			<LoadingSpinner />
		</div>
	{:else if error}
		<div class="my-8">
			<ErrorAlert message={error} />
		</div>
	{:else}
		<div class="flex flex-col gap-6 md:flex-row">
			<!-- Sidebar with playlist list -->
			<div class="flex-shrink-0 space-y-4 md:w-64">
				<!-- Movie cart integration -->
				{#if hasCartItems()}
					<div
						class="bg-primary-900 bg-opacity-20 border-primary-800 border-opacity-30 rounded-lg border p-4"
					>
						<div class="mb-3 flex items-center justify-between">
							<div class="flex items-center gap-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="text-primary-500"
								>
									<circle cx="9" cy="21" r="1" />
									<circle cx="20" cy="21" r="1" />
									<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
								</svg>
								<h3 class="font-medium">Movie Cart</h3>
							</div>
							<span class="bg-primary-600 rounded-full px-2 py-1 text-xs text-white">
								{cartItems.length} items
							</span>
						</div>

						<div class="mb-3 flex flex-wrap gap-2">
							{#each cartItems.slice(0, 5) as movie}
								<img
									src={movie.poster_path.startsWith('/')
										? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
										: movie.poster_path}
									alt={movie.title}
									class="h-14 w-10 rounded object-cover shadow-sm"
									title={movie.title}
								/>
							{/each}
							{#if cartItems.length > 5}
								<div
									class="bg-surface-300-700 flex h-14 w-10 items-center justify-center rounded text-xs font-medium"
								>
									+{cartItems.length - 5}
								</div>
							{/if}
						</div>

						<button
							onclick={createPlaylistFromCart}
							class="bg-primary-600 hover:bg-primary-500 flex w-full items-center justify-center gap-1.5 rounded py-1.5 text-sm font-medium text-white"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<line x1="12" y1="5" x2="12" y2="19"></line>
								<line x1="5" y1="12" x2="19" y2="12"></line>
							</svg>
							Create Playlist from Cart
						</button>
					</div>
				{/if}

				<!-- Playlists section -->
				<div class="bg-surface-200-800 rounded-lg p-4">
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-lg font-bold">Playlists</h2>
						<button
							onclick={createNewPlaylist}
							class="bg-primary-600 hover:bg-primary-500 rounded-full p-1 text-white"
							title="Create New Playlist"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<line x1="12" y1="5" x2="12" y2="19"></line>
								<line x1="5" y1="12" x2="19" y2="12"></line>
							</svg>
						</button>
					</div>

					{#if userPlaylists.length === 0}
						<div class="text-surface-600-400 py-8 text-center">
							<p>No playlists found</p>
							<button
								onclick={createNewPlaylist}
								class="text-primary-500 hover:text-primary-400 mt-2 text-sm"
							>
								Create your first playlist
							</button>
						</div>
					{:else}
						<div class="max-h-96 space-y-2 overflow-y-auto pr-2">
							{#each userPlaylists as playlist}
								<button
									class="flex w-full items-center gap-2 rounded-md p-2 text-left transition-colors {selectedPlaylistId ===
									playlist.id
										? 'bg-primary-900 bg-opacity-30'
										: 'hover:bg-surface-300-700'}"
									onclick={() => handleSelectPlaylist(playlist.id)}
								>
									<div
										class="bg-primary-800 bg-opacity-30 text-primary-500 flex h-8 w-8 items-center justify-center rounded"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<line x1="8" y1="6" x2="21" y2="6"></line>
											<line x1="8" y1="12" x2="21" y2="12"></line>
											<line x1="8" y1="18" x2="21" y2="18"></line>
											<line x1="3" y1="6" x2="3.01" y2="6"></line>
											<line x1="3" y1="12" x2="3.01" y2="12"></line>
											<line x1="3" y1="18" x2="3.01" y2="18"></line>
										</svg>
									</div>
									<div class="min-w-0 flex-1">
										<div class="truncate font-medium">{playlist.name}</div>
										<div class="text-surface-500-400 text-xs">{playlist.itemCount || 0} items</div>
									</div>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Main content area -->
			<div class="flex-1">
				{#if !selectedPlaylistId}
					<div
						class="text-surface-500-400 flex h-96 flex-col items-center justify-center text-center"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="mb-4 opacity-50"
						>
							<line x1="8" y1="6" x2="21" y2="6"></line>
							<line x1="8" y1="12" x2="21" y2="12"></line>
							<line x1="8" y1="18" x2="21" y2="18"></line>
							<line x1="3" y1="6" x2="3.01" y2="6"></line>
							<line x1="3" y1="12" x2="3.01" y2="12"></line>
							<line x1="3" y1="18" x2="3.01" y2="18"></line>
						</svg>
						<h3 class="mb-2 text-xl font-semibold">Select a Playlist</h3>
						<p class="max-w-md">
							Choose a playlist from the sidebar or create a new one to get started
						</p>
						<button
							onclick={createNewPlaylist}
							class="bg-primary-500 hover:bg-primary-600 mt-6 flex items-center gap-2 rounded px-4 py-2 text-white"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<line x1="12" y1="5" x2="12" y2="19"></line>
								<line x1="5" y1="12" x2="19" y2="12"></line>
							</svg>
							Create New Playlist
						</button>
					</div>
				{:else if $selectedPlaylist}
					<!-- Playlist header -->
					<div class="mb-6">
						<div class="flex items-start justify-between">
							<div>
								<h1 class="text-2xl font-bold">{$selectedPlaylist.name}</h1>
								<p class="text-surface-500-400 mt-1">
									{$selectedPlaylist.description || 'No description'} • {$selectedPlaylistItems.length}
									items
								</p>
							</div>

							<!-- Action buttons -->
							<div class="flex gap-2">
								<button
									onclick={editPlaylist}
									class="bg-surface-300-700 hover:bg-surface-400-600 rounded-md p-2 text-white"
									title="Edit Playlist"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
										<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
									</svg>
								</button>

								<button
									onclick={getRecommendations}
									class="bg-secondary-700 hover:bg-secondary-600 rounded-md p-2 text-white"
									title="Get AI Recommendations"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<polygon
											points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
										></polygon>
									</svg>
								</button>

								<button
									onclick={startReordering}
									class="bg-surface-300-700 hover:bg-surface-400-600 rounded-md p-2 text-white"
									title="Reorder Items"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<line x1="12" y1="3" x2="12" y2="21"></line>
										<polyline points="8 8 12 4 16 8"></polyline>
										<line x1="20" y1="16" x2="4" y2="16"></line>
									</svg>
								</button>

								<button
									onclick={deletePlaylist}
									class="rounded-md bg-red-700 p-2 text-white hover:bg-red-600"
									title="Delete Playlist"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<polyline points="3 6 5 6 21 6"></polyline>
										<path
											d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
										></path>
									</svg>
								</button>
							</div>
						</div>
					</div>

					<!-- Playlist content -->
					{#if $selectedPlaylistItems.length === 0}
						<div
							class="bg-surface-200-800 border-surface-300-700 rounded-xl border py-16 text-center"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="48"
								height="48"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="text-surface-500-400 mx-auto mb-4"
							>
								<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
								<line x1="12" y1="8" x2="12" y2="16"></line>
								<line x1="8" y1="12" x2="16" y2="12"></line>
							</svg>
							<h3 class="text-xl font-semibold">Empty Playlist</h3>
							<p class="text-surface-500-400 mx-auto mt-2 max-w-md">
								This playlist doesn't have any items yet. Add movies or get AI recommendations to
								fill it.
							</p>
							<button
								onclick={getRecommendations}
								class="bg-secondary-500 hover:bg-secondary-600 mx-auto mt-6 flex items-center gap-2 rounded px-4 py-2 text-white"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<polygon
										points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
									></polygon>
								</svg>
								Get Smart Recommendations
							</button>
						</div>
					{:else}
						<!-- View toggle buttons -->
						<div class="mb-4 flex justify-end">
							<div
								class="border-surface-300-700 border-opacity-50 flex overflow-hidden rounded-md border"
							>
								<button
									class="flex items-center gap-1.5 px-3 py-1.5 {listView === 'list'
										? 'bg-primary-600 text-white'
										: 'hover:bg-surface-300-700 text-surface-500-400'}"
									onclick={() => (listView = 'list')}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<line x1="8" y1="6" x2="21" y2="6"></line>
										<line x1="8" y1="12" x2="21" y2="12"></line>
										<line x1="8" y1="18" x2="21" y2="18"></line>
										<line x1="3" y1="6" x2="3.01" y2="6"></line>
										<line x1="3" y1="12" x2="3.01" y2="12"></line>
										<line x1="3" y1="18" x2="3.01" y2="18"></line>
									</svg>
									<span>List</span>
								</button>
								<button
									class="flex items-center gap-1.5 px-3 py-1.5 {listView === 'grid'
										? 'bg-primary-600 text-white'
										: 'hover:bg-surface-300-700 text-surface-500-400'}"
									onclick={() => (listView = 'grid')}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<rect x="3" y="3" width="7" height="7"></rect>
										<rect x="14" y="3" width="7" height="7"></rect>
										<rect x="14" y="14" width="7" height="7"></rect>
										<rect x="3" y="14" width="7" height="7"></rect>
									</svg>
									<span>Grid</span>
								</button>
							</div>
						</div>

						<!-- Media list component -->
						<MediaList
							items={playlistItemsToMovies($selectedPlaylistItems)}
							isReordering={$isReorderingPlaylist}
							listType="playlist"
							layout={listView}
							allowRemoveItems={true}
							showNumbers={true}
							on:select={handleItemSelect}
							on:remove={handleItemRemove}
							on:reorder={handleReorder}
						/>
					{/if}
				{:else}
					<div class="flex h-96 items-center justify-center">
						<LoadingSpinner />
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Playlist Editor Modal -->
<PlaylistEditor
	show={showPlaylistEditor}
	selectedItems={autoOpenCreateFromCart
		? cartItems
		: selectedPlaylistId
			? playlistItemsToMovies($selectedPlaylistItems)
			: []}
	playlist={$selectedPlaylist}
	mode={selectedPlaylistId ? 'edit' : 'create'}
	type="playlist"
	on:close={() => {
		showPlaylistEditor = false;
		autoOpenCreateFromCart = false;
	}}
	on:create={handlePlaylistCreate}
	on:update={handlePlaylistUpdate}
/>

