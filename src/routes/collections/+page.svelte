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
	import MediaList from '$lib/components/media/MediaList.svelte';
	import PlaylistEditor from '$lib/components/media/PlaylistEditor.svelte';
	import LoadingSpinner from '$lib/components/util/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/util/ErrorAlert.svelte';

	// UI state
	let isLoading = $state<boolean>(true);
	let error = $state<string>('');
	let userCollections = $state<any[]>([]);
	let selectedCollectionId = $state<string | null>(null);
	let showCollectionEditor = $state<boolean>(false);
	let listView = $state<'grid' | 'list'>('grid'); // Default to grid for collections
	let cartItems = $state<CartMovie[]>([]);
	let autoOpenCreateFromCart = $state<boolean>(false);

	// Add mock data for demo purposes
	const mockCollections = [
		{
			id: 'collection-1',
			name: 'Marvel Cinematic Universe',
			description: 'Films from the Marvel Cinematic Universe',
			itemCount: 5,
			items: [
				{
					id: 'media-1',
					mediaItemId: 'media-1',
					title: 'Avengers: Endgame',
					release_date: '2019-04-26',
					poster_path: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
					genres: ['Action', 'Adventure', 'Sci-Fi'],
					rating: 8.4,
					order: 0
				},
				{
					id: 'media-2',
					mediaItemId: 'media-2',
					title: 'Guardians of the Galaxy',
					release_date: '2014-08-01',
					poster_path: 'https://image.tmdb.org/t/p/w500/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg',
					genres: ['Action', 'Adventure', 'Comedy'],
					rating: 8.0,
					order: 1
				},
				{
					id: 'media-3',
					mediaItemId: 'media-3',
					title: 'Black Panther',
					release_date: '2018-02-16',
					poster_path: 'https://image.tmdb.org/t/p/w500/uxzzxijgPIY7slzFvMotPv8wjKA.jpg',
					genres: ['Action', 'Adventure', 'Sci-Fi'],
					rating: 7.3,
					order: 2
				},
				{
					id: 'media-4',
					mediaItemId: 'media-4',
					title: 'Thor: Ragnarok',
					release_date: '2017-11-03',
					poster_path: 'https://image.tmdb.org/t/p/w500/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg',
					genres: ['Action', 'Adventure', 'Comedy'],
					rating: 7.9,
					order: 3
				},
				{
					id: 'media-5',
					mediaItemId: 'media-5',
					title: 'Captain America: The Winter Soldier',
					release_date: '2014-04-04',
					poster_path: 'https://image.tmdb.org/t/p/w500/tVFRpFw3xTedgPGqxW0AOI8Qhh0.jpg',
					genres: ['Action', 'Adventure', 'Thriller'],
					rating: 7.7,
					order: 4
				}
			]
		},
		{
			id: 'collection-2',
			name: 'Studio Ghibli',
			description: 'Animated films from Studio Ghibli',
			itemCount: 4,
			items: [
				{
					id: 'media-6',
					mediaItemId: 'media-6',
					title: 'Spirited Away',
					release_date: '2001-07-20',
					poster_path: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
					genres: ['Animation', 'Family', 'Fantasy'],
					rating: 8.6,
					order: 0
				},
				{
					id: 'media-7',
					mediaItemId: 'media-7',
					title: 'Princess Mononoke',
					release_date: '1997-07-12',
					poster_path: 'https://image.tmdb.org/t/p/w500/pdtzEreKvKAlqa2YEBaGwiA45V.jpg',
					genres: ['Animation', 'Adventure', 'Fantasy'],
					rating: 8.4,
					order: 1
				},
				{
					id: 'media-8',
					mediaItemId: 'media-8',
					title: 'My Neighbor Totoro',
					release_date: '1988-04-16',
					poster_path: 'https://image.tmdb.org/t/p/w500/rtGDOeG9LzoerkDGZF9dnVeLppL.jpg',
					genres: ['Animation', 'Family', 'Fantasy'],
					rating: 8.1,
					order: 2
				},
				{
					id: 'media-9',
					mediaItemId: 'media-9',
					title: "Howl's Moving Castle",
					release_date: '2004-09-10',
					poster_path: 'https://image.tmdb.org/t/p/w500/6pZgH10jhpToPcf0uvyTCPFhWpQ.jpg',
					genres: ['Animation', 'Adventure', 'Fantasy'],
					rating: 8.4,
					order: 3
				}
			]
		},
		{
			id: 'collection-3',
			name: 'Christopher Nolan Films',
			description: 'Films directed by Christopher Nolan',
			itemCount: 4,
			items: [
				{
					id: 'media-10',
					mediaItemId: 'media-10',
					title: 'Inception',
					release_date: '2010-07-16',
					poster_path: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
					genres: ['Action', 'Sci-Fi', 'Thriller'],
					rating: 8.3,
					order: 0
				},
				{
					id: 'media-11',
					mediaItemId: 'media-11',
					title: 'Interstellar',
					release_date: '2014-11-07',
					poster_path: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
					genres: ['Adventure', 'Drama', 'Sci-Fi'],
					rating: 8.6,
					order: 1
				},
				{
					id: 'media-12',
					mediaItemId: 'media-12',
					title: 'The Dark Knight',
					release_date: '2008-07-18',
					poster_path: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
					genres: ['Action', 'Crime', 'Drama'],
					rating: 9.0,
					order: 2
				},
				{
					id: 'media-13',
					mediaItemId: 'media-13',
					title: 'Dunkirk',
					release_date: '2017-07-21',
					poster_path: 'https://image.tmdb.org/t/p/w500/ebSnODDg9lbsMIaWg2uAbjn7TO5.jpg',
					genres: ['Action', 'Drama', 'History'],
					rating: 7.8,
					order: 3
				}
			]
		}
	];

	// Utility functions
	const isInWatchlist = (id: string) => false; // Mock function, replace with actual implementation
	const isInCart = (id: string) => movieCart.isInCart(id);

	// Load user collections
	onMount(async () => {
		try {
			// Subscribe to movie cart store
			const unsubscribe = movieCart.subscribe((store) => {
				cartItems = store.movies;
			});

			// In a real app, get collections from the API
			// For demo purposes, use mock data
			userCollections = mockCollections;

			// For each collection, set the collection items in the store for demo
			mockCollections.forEach((collection) => {
				playlistApi.update((state) => ({
					...state,
					playlists: {
						...state.playlists,
						[collection.id]: collection
					},
					playlistItems: {
						...state.playlistItems,
						[collection.id]: collection.items
					}
				}));
			});

			// Check URL parameters for actions from movie cart
			if (typeof window !== 'undefined') {
				const urlParams = new URLSearchParams(window.location.search);
				const action = urlParams.get('action');
				const ids = urlParams.get('ids');

				if (action === 'create' && ids) {
					// Auto-trigger the create collection modal with cart items
					autoOpenCreateFromCart = true;

					// Set a small timeout to ensure the component is fully mounted
					setTimeout(() => {
						createCollectionFromCart();
					}, 100);
				}
			}

			// If there are collections, select the first one by default
			if (userCollections.length > 0) {
				handleSelectCollection(userCollections[0].id);
			}

			isLoading = false;
		} catch (err) {
			console.error(err);
			error = 'Failed to load collections. Please try again.';
			isLoading = false;
		}
	});

	// Function to handle collection selection
	async function handleSelectCollection(collectionId: string) {
		selectedCollectionId = collectionId;
		playlistApi.setSelectedPlaylist(collectionId);

		// Load collection items if needed
		await playlistApi.getPlaylistItems(collectionId);
	}

	// Function to create a new collection
	function createNewCollection() {
		showCollectionEditor = true;
	}

	// Function to get AI insights for the collection
	function getAIInsights() {
		if (!selectedCollectionId) return;
		console.log('Get AI insights for collection', selectedCollectionId);
	}

	// Function to edit collection (rename, description, etc.)
	function editCollection() {
		if (!selectedCollectionId) return;
		showCollectionEditor = true;
	}

	// Function to delete collection
	async function deleteCollection() {
		if (!selectedCollectionId) return;

		if (confirm('Are you sure you want to delete this collection?')) {
			await playlistApi.deletePlaylist(selectedCollectionId);
			selectedCollectionId = null;

			// Refresh collections
			const refreshedCollections = await playlistApi.getUserPlaylists();
			userCollections = refreshedCollections;

			// Select first collection if available
			if (userCollections.length > 0) {
				handleSelectCollection(userCollections[0].id);
			}
		}
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
		if (!selectedCollectionId || !item) return;

		if (confirm(`Remove "${item.title}" from this collection?`)) {
			const collectionItem = $selectedPlaylistItems[index];
			if (collectionItem) {
				await playlistApi.removeItemFromPlaylist(selectedCollectionId, collectionItem.id);
				await playlistApi.getPlaylistItems(selectedCollectionId);
			}
		}
	}

	// Function to handle collection creation
	async function handleCollectionCreate(event) {
		const collectionData = event.detail;
		console.log('Created collection:', collectionData);

		// In a real implementation, use the collection data to create a collection
		const newCollection = await playlistApi.createPlaylist(
			collectionData.name,
			collectionData.description
		);

		if (newCollection) {
			for (const itemId of collectionData.items) {
				await playlistApi.addItemToPlaylist(newCollection.id, itemId);
			}

			// Clear movie cart if the collection was created from it
			if (autoOpenCreateFromCart) {
				movieCart.clearCart();
				autoOpenCreateFromCart = false;
			}

			// Refresh collections and select the new one
			const refreshedCollections = await playlistApi.getUserPlaylists();
			userCollections = refreshedCollections;
			handleSelectCollection(newCollection.id);
		}
	}

	// Function to handle collection update
	async function handleCollectionUpdate(event) {
		const collectionData = event.detail;
		console.log('Updated collection:', collectionData);

		if (selectedCollectionId) {
			// Update collection details
			await playlistApi.updatePlaylist(selectedCollectionId, {
				name: collectionData.name,
				description: collectionData.description
			});

			// Refresh collection data
			await playlistApi.getPlaylist(selectedCollectionId);
		}
	}

	// Function to convert an array of collection items to an array of movies
	function collectionItemsToMovies(items) {
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

	// Function to create a collection from cart items
	function createCollectionFromCart() {
		if (cartItems.length === 0 && !autoOpenCreateFromCart) return;

		// Open the collection editor with cart items pre-populated
		showCollectionEditor = true;
	}

	// Function to display cart items section
	function hasCartItems() {
		return cartItems.length > 0;
	}
</script>

<svelte:head>
	<title>My Collections | Suasor</title>
	<meta name="description" content="Browse and manage your media collections" />
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
			<!-- Sidebar with collection list -->
			<div class="flex-shrink-0 space-y-4 md:w-64">
				<!-- Movie cart integration -->
				{#if hasCartItems()}
					<div
						class="bg-secondary-900 bg-opacity-20 border-secondary-800 border-opacity-30 rounded-lg border p-4"
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
									class="text-secondary-500"
								>
									<circle cx="9" cy="21" r="1" />
									<circle cx="20" cy="21" r="1" />
									<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
								</svg>
								<h3 class="font-medium">Movie Cart</h3>
							</div>
							<span class="bg-secondary-600 rounded-full px-2 py-1 text-xs text-white">
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
							onclick={createCollectionFromCart}
							class="bg-secondary-600 hover:bg-secondary-500 flex w-full items-center justify-center gap-1.5 rounded py-1.5 text-sm font-medium text-white"
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
							Create Collection from Cart
						</button>
					</div>
				{/if}

				<!-- Collections section -->
				<div class="bg-surface-200-800 rounded-lg p-4">
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-lg font-bold">Collections</h2>
						<button
							onclick={createNewCollection}
							class="bg-secondary-600 hover:bg-secondary-500 rounded-full p-1 text-white"
							title="Create New Collection"
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

					{#if userCollections.length === 0}
						<div class="text-surface-600-400 py-8 text-center">
							<p>No collections found</p>
							<button
								onclick={createNewCollection}
								class="text-secondary-500 hover:text-secondary-400 mt-2 text-sm"
							>
								Create your first collection
							</button>
						</div>
					{:else}
						<div class="max-h-96 space-y-2 overflow-y-auto pr-2">
							{#each userCollections as collection}
								<button
									class="flex w-full items-center gap-2 rounded-md p-2 text-left transition-colors {selectedCollectionId ===
									collection.id
										? 'bg-secondary-900 bg-opacity-30'
										: 'hover:bg-surface-300-700'}"
									onclick={() => handleSelectCollection(collection.id)}
								>
									<div
										class="bg-secondary-800 bg-opacity-30 text-secondary-500 flex h-8 w-8 items-center justify-center rounded"
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
									</div>
									<div class="min-w-0 flex-1">
										<div class="truncate font-medium">{collection.name}</div>
										<div class="text-surface-500-400 text-xs">
											{collection.itemCount || 0} items
										</div>
									</div>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Main content area -->
			<div class="flex-1">
				{#if !selectedCollectionId}
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
							<rect x="3" y="3" width="7" height="7"></rect>
							<rect x="14" y="3" width="7" height="7"></rect>
							<rect x="14" y="14" width="7" height="7"></rect>
							<rect x="3" y="14" width="7" height="7"></rect>
						</svg>
						<h3 class="mb-2 text-xl font-semibold">Select a Collection</h3>
						<p class="max-w-md">
							Choose a collection from the sidebar or create a new one to get started
						</p>
						<button
							onclick={createNewCollection}
							class="bg-secondary-500 hover:bg-secondary-600 mt-6 flex items-center gap-2 rounded px-4 py-2 text-white"
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
							Create New Collection
						</button>
					</div>
				{:else if $selectedPlaylist}
					<!-- Collection header -->
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
									onclick={editCollection}
									class="bg-surface-300-700 hover:bg-surface-400-600 rounded-md p-2 text-white"
									title="Edit Collection"
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
									onclick={getAIInsights}
									class="bg-secondary-700 hover:bg-secondary-600 rounded-md p-2 text-white"
									title="Get AI Insights"
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
										<path
											d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"
										></path>
									</svg>
								</button>

								<button
									onclick={deleteCollection}
									class="rounded-md bg-red-700 p-2 text-white hover:bg-red-600"
									title="Delete Collection"
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

					<!-- AI insights section -->
					<div
						class="bg-secondary-900 bg-opacity-20 border-secondary-800 border-opacity-30 mb-6 rounded-lg border p-4"
					>
						<div class="mb-2 flex items-center gap-2">
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
								class="text-secondary-500"
							>
								<path
									d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
								></path>
								<polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
								<line x1="12" y1="22.08" x2="12" y2="12"></line>
							</svg>
							<h3 class="font-semibold">AI Insights</h3>
						</div>

						<p class="text-surface-500-400 mb-3 text-sm">
							Get AI-powered insights about this collection including themes, patterns, and
							recommendations.
						</p>

						<button
							onclick={getAIInsights}
							class="bg-secondary-600 hover:bg-secondary-500 flex w-full items-center justify-center gap-1.5 rounded py-1.5 text-sm font-medium text-white"
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
								<path
									d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"
								></path>
							</svg>
							Analyze Collection with AI
						</button>
					</div>

					<!-- Collection content -->
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
							<h3 class="text-xl font-semibold">Empty Collection</h3>
							<p class="text-surface-500-400 mx-auto mt-2 max-w-md">
								This collection doesn't have any items yet. Add movies or use the movie cart to fill
								it.
							</p>
						</div>
					{:else}
						<!-- View toggle buttons -->
						<div class="mb-4 flex justify-end">
							<div
								class="border-surface-300-700 border-opacity-50 flex overflow-hidden rounded-md border"
							>
								<button
									class="flex items-center gap-1.5 px-3 py-1.5 {listView === 'list'
										? 'bg-secondary-600 text-white'
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
										? 'bg-secondary-600 text-white'
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
							items={collectionItemsToMovies($selectedPlaylistItems)}
							listType="collection"
							layout={listView}
							allowRemoveItems={true}
							showNumbers={false}
							on:select={handleItemSelect}
							on:remove={handleItemRemove}
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

<!-- Collection Editor Modal -->
<PlaylistEditor
	show={showCollectionEditor}
	selectedItems={autoOpenCreateFromCart
		? cartItems
		: selectedCollectionId
			? collectionItemsToMovies($selectedPlaylistItems)
			: []}
	playlist={$selectedPlaylist}
	mode={selectedCollectionId ? 'edit' : 'create'}
	type="collection"
	on:close={() => {
		showCollectionEditor = false;
		autoOpenCreateFromCart = false;
	}}
	on:create={handleCollectionCreate}
	on:update={handleCollectionUpdate}
/>

