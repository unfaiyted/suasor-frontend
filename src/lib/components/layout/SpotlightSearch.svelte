<script lang="ts">
	import { fade, scale, fly } from 'svelte/transition';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { X, Search, Clock, Star, Film, Tv, Music, Heart, Download } from '@lucide/svelte';
	import Portal from '../portal/Portal.svelte';
	import type { Movie } from '$lib/components/chat/types';
	import type { MediaType } from '$lib/api/types';

	// Props for the component
	interface SpotlightSearchProps {
		show: boolean;
	}

	let { show = $bindable(false) } = $props();

	// State management with Svelte 5 syntax
	let searchQuery = $state('');
	let searchResults = $state<SearchResult[]>([]);
	let selectedIndex = $state(0);
	let isLoading = $state(false);
	let categories = $state(['All', 'Movies', 'TV Shows', 'Music']);
	let selectedCategory = $state('All');
	let recentSearches = $state<string[]>([]);

	// Define search result types
	interface SearchResult {
		id: string;
		title: string;
		type: MediaType | 'recent';
		year?: number;
		poster?: string;
		subtitle?: string;
		inLibrary?: boolean;
		category?: string;
		rating?: number;
	}

	// Create event dispatcher
	const dispatch = createEventDispatcher();

	// Mock data for demo
	const mockMovies: SearchResult[] = [
		{
			id: 'm1',
			title: 'Inception',
			type: 'movie',
			year: 2010,
			poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
			subtitle: 'Christopher Nolan',
			inLibrary: true,
			rating: 8.8
		},
		{
			id: 'm2',
			title: 'Interstellar',
			type: 'movie',
			year: 2014,
			poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
			subtitle: 'Christopher Nolan',
			inLibrary: false,
			rating: 8.6
		},
		{
			id: 'm3',
			title: 'The Dark Knight',
			type: 'movie',
			year: 2008,
			poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
			subtitle: 'Christopher Nolan',
			inLibrary: true,
			rating: 9.0
		}
	];

	const mockTvShows: SearchResult[] = [
		{
			id: 't1',
			title: 'Stranger Things',
			type: 'series',
			year: 2016,
			poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
			subtitle: 'Netflix Original',
			inLibrary: true,
			rating: 8.7
		},
		{
			id: 't2',
			title: 'The Boys',
			type: 'series',
			year: 2019,
			poster: 'https://image.tmdb.org/t/p/w500/stTEycfG9928HYGEISBFaG1ngjM.jpg',
			subtitle: 'Amazon Prime',
			inLibrary: false,
			rating: 8.4
		}
	];

	const mockMusic: SearchResult[] = [
		{
			id: 'a1',
			title: 'Dark Side of the Moon',
			type: 'album',
			year: 1973,
			poster: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png',
			subtitle: 'Pink Floyd',
			inLibrary: true,
			rating: 9.5
		},
		{
			id: 'a2',
			title: 'Thriller',
			type: 'album',
			year: 1982,
			poster: 'https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png',
			subtitle: 'Michael Jackson',
			inLibrary: false,
			rating: 9.2
		}
	];

	// Load recent searches from localStorage
	function loadRecentSearches() {
		try {
			const saved = localStorage.getItem('recentSearches');
			if (saved) {
				recentSearches = JSON.parse(saved);
			}
		} catch (error) {
			console.error('Error loading recent searches:', error);
		}
	}

	// Save recent searches to localStorage
	function saveRecentSearch(query: string) {
		if (!query.trim()) return;
		
		// Add to start of array, remove duplicates
		recentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
		
		try {
			localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
		} catch (error) {
			console.error('Error saving recent searches:', error);
		}
	}

	// Function to perform search
	function performSearch() {
		isLoading = true;
		
		// Clear previous results
		searchResults = [];
		
		// Simulate API call delay
		setTimeout(() => {
			if (!searchQuery.trim()) {
				// Show recent searches when query is empty
				searchResults = recentSearches.map(query => ({
					id: `recent-${query}`,
					title: query,
					type: 'recent',
					subtitle: 'Recent search'
				}));
				isLoading = false;
				return;
			}
			
			// Filter mock data based on query and category
			const query = searchQuery.toLowerCase();
			let results: SearchResult[] = [];
			
			if (selectedCategory === 'All' || selectedCategory === 'Movies') {
				results = [...results, ...mockMovies.filter(movie => 
					movie.title.toLowerCase().includes(query)
				)];
			}
			
			if (selectedCategory === 'All' || selectedCategory === 'TV Shows') {
				results = [...results, ...mockTvShows.filter(show => 
					show.title.toLowerCase().includes(query)
				)];
			}
			
			if (selectedCategory === 'All' || selectedCategory === 'Music') {
				results = [...results, ...mockMusic.filter(album => 
					album.title.toLowerCase().includes(query)
				)];
			}
			
			searchResults = results;
			isLoading = false;
			
			// Reset selection index
			selectedIndex = results.length > 0 ? 0 : -1;
		}, 300);
	}

	// Navigate to the selected result
	function navigateToResult(result: SearchResult) {
		switch (result.type) {
			case 'movie':
				goto(`/movies?id=${result.id}`);
				break;
			case 'series':
				goto(`/tv?id=${result.id}`);
				break;
			case 'album':
				goto(`/music?id=${result.id}`);
				break;
			case 'recent':
				searchQuery = result.title;
				performSearch();
				return; // Don't close the search
			default:
				goto('/');
		}
		
		saveRecentSearch(searchQuery);
		closeSearch();
	}

	// Close the search
	function closeSearch() {
		show = false;
		searchQuery = '';
		searchResults = [];
		dispatch('close');
	}

	// Handle keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (!show) return;
		
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				if (searchResults.length > 0) {
					selectedIndex = (selectedIndex + 1) % searchResults.length;
				}
				break;
			case 'ArrowUp':
				event.preventDefault();
				if (searchResults.length > 0) {
					selectedIndex = (selectedIndex - 1 + searchResults.length) % searchResults.length;
				}
				break;
			case 'Enter':
				if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
					navigateToResult(searchResults[selectedIndex]);
				}
				break;
			case 'Escape':
				closeSearch();
				break;
			case 'Tab':
				// If category tabs are focused, move between them
				if (event.target instanceof HTMLElement && event.target.classList.contains('category-tab')) {
					event.preventDefault();
					const currentIndex = categories.indexOf(selectedCategory);
					const nextIndex = event.shiftKey 
						? (currentIndex - 1 + categories.length) % categories.length
						: (currentIndex + 1) % categories.length;
					selectedCategory = categories[nextIndex];
					performSearch();
				}
				break;
		}
	}

	// Setup global keyboard shortcut for search
	function setupGlobalShortcut() {
		function globalKeyHandler(event: KeyboardEvent) {
			// Command+K or Ctrl+K
			if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
				event.preventDefault();
				show = true;
				setTimeout(() => {
					document.getElementById('spotlight-search-input')?.focus();
				}, 10);
			}
		}
		
		document.addEventListener('keydown', globalKeyHandler);
		
		return () => {
			document.removeEventListener('keydown', globalKeyHandler);
		};
	}

	// Get icon for result type
	function getTypeIcon(type: MediaType | 'recent') {
		switch (type) {
			case 'movie':
				return Film;
			case 'series':
				return Tv;
			case 'album':
			case 'track':
			case 'artist':
				return Music;
			case 'recent':
				return Clock;
			default:
				return Search;
		}
	}

	// Function removed as we're now using class directives directly

	// Load recent searches and set up global shortcut
	onMount(() => {
		loadRecentSearches();
		const cleanup = setupGlobalShortcut();
		
		// Auto-focus search input when modal opens
		$effect(() => {
			if (show) {
				setTimeout(() => {
					document.getElementById('spotlight-search-input')?.focus();
					performSearch(); // Show recent searches initially
				}, 10);
			}
		});
		
		return cleanup;
	});

	// Handle clickoutside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target.classList.contains('spotlight-backdrop')) {
			closeSearch();
		}
	}

	// Watch for search query changes
	$effect(() => {
		if (searchQuery !== undefined) {
			performSearch();
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if show}
	<Portal>
		<div
			class="spotlight-backdrop fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-20"
			transition:fade={{ duration: 150 }}
			onclick={handleClickOutside}
			role="dialog"
			aria-modal="true"
			aria-labelledby="spotlight-search-title"
		>
			<div
				class="bg-surface-100-900 w-full max-w-3xl overflow-hidden rounded-xl shadow-2xl"
				transition:scale={{ duration: 200, start: 0.95 }}
				onclick={() => {}}
			>
				<!-- Search header -->
				<div class="border-surface-200-800 flex items-center gap-3 border-b p-3">
					<div class="flex-grow flex items-center gap-3">
						<Search size={18} class="text-surface-900-50 flex-shrink-0" />
						<input
							id="spotlight-search-input"
							type="text"
							class="flex-grow bg-transparent outline-none w-full"
							placeholder="Search for movies, TV shows, music..."
							bind:value={searchQuery}
							autocomplete="off"
						/>
					</div>
					
					<div class="flex-shrink-0 flex items-center gap-1">
						<kbd class="bg-surface-300-700 px-2 py-1 rounded text-xs">ESC</kbd>
						<span class="text-xs text-surface-900-50">to close</span>
					</div>
					
					<button
						class="text-surface-900-50 hover:text-surface-900-50-hover rounded p-1"
						onclick={closeSearch}
						aria-label="Close search"
					>
						<X size={18} />
					</button>
				</div>
				
				<!-- Category tabs -->
				<div class="border-surface-200-800 flex gap-1 border-b p-2">
					{#each categories as category}
						<button
							class={"category-tab rounded px-3 py-1 text-sm transition-colors " + 
								(selectedCategory === category 
									? "bg-primary-500/20 text-primary-500" 
									: "text-surface-900-50 hover:bg-surface-200-700/50")}
							onclick={() => {
								selectedCategory = category;
								performSearch();
							}}
						>
							{category}
						</button>
					{/each}
				</div>

				<!-- Results area -->
				<div class="max-h-[60vh] overflow-y-auto">
					{#if isLoading}
						<div class="flex justify-center p-6">
							<div class="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
						</div>
					{:else if searchResults.length === 0}
						<div class="p-6 text-center text-surface-900-50">
							{searchQuery.trim() ? 'No results found' : 'Start typing to search'}
						</div>
					{:else}
						<div class="p-2">
							{#if !searchQuery.trim() && recentSearches.length > 0}
								<div class="text-surface-900-50 mb-2 px-2 pt-2 text-xs font-medium uppercase">
									Recent Searches
								</div>
							{/if}
							
							{#each searchResults as result, index}
								<div
									class={"hover:bg-surface-200-700/50 flex items-center gap-3 rounded p-2 transition-colors " + 
										(index === selectedIndex ? "bg-surface-200-700/50" : "")}
									onclick={() => navigateToResult(result)}
									role="button"
									tabindex="0"
								>
									{#if result.type === 'recent'}
										<div class="text-surface-900-50 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded">
											<Clock size={18} />
										</div>
									{:else if result.poster}
										<img
											src={result.poster}
											alt={result.title}
											class="h-10 w-10 rounded object-cover"
										/>
									{:else}
										<div class="bg-surface-200-700 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded">
											<svelte:component this={getTypeIcon(result.type)} size={18} />
										</div>
									{/if}
									
									<div class="flex-grow min-w-0">
										<div class="flex items-center gap-2">
											<span class="font-medium truncate">{result.title}</span>
											{#if result.year && result.type !== 'recent'}
												<span class="text-surface-900-50 text-sm">({result.year})</span>
											{/if}
											{#if result.inLibrary}
												<span class="text-green-500 text-xs">In Library</span>
											{/if}
										</div>
										{#if result.subtitle}
											<div class="text-surface-900-50 text-sm truncate">{result.subtitle}</div>
										{/if}
									</div>
									
									<div class="flex-shrink-0 flex items-center gap-2">
										{#if result.rating && result.type !== 'recent'}
											<div class="flex items-center gap-1 text-amber-500">
												<Star size={14} />
												<span class="text-xs">{result.rating}</span>
											</div>
										{/if}
										
										{#if result.type !== 'recent'}
											<div class="text-surface-900-50 rounded-full bg-surface-200-700 px-2 py-0.5 text-xs">
												{result.type === 'movie' ? 'Movie' : 
												 result.type === 'series' ? 'TV' : 
												 result.type === 'album' ? 'Album' : 
												 result.type}
											</div>
										{/if}
									</div>
									
									<div class="flex-shrink-0 flex gap-1">
										{#if result.type !== 'recent'}
											<button 
												class="hover:bg-surface-300-700/50 text-primary-500 rounded p-1"
												onclick={(e) => {
													e.stopPropagation();
													// Handle adding to watchlist
													console.log('Add to watchlist', result.id);
												}}
												aria-label="Add to watchlist"
											>
												<Heart size={16} />
											</button>
											
											<button 
												class="hover:bg-surface-300-700/50 text-primary-500 rounded p-1"
												onclick={(e) => {
													e.stopPropagation();
													// Handle download
													console.log('Download', result.id);
												}}
												aria-label="Download"
											>
												<Download size={16} />
											</button>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
				
				<!-- Keyboard shortcuts help -->
				<div class="border-surface-200-800 border-t p-3 text-xs text-surface-900-50">
					<div class="flex items-center justify-between">
						<div>
							<span>Press </span>
							<kbd class="bg-surface-300-700 px-1 rounded">↑</kbd>
							<kbd class="bg-surface-300-700 px-1 rounded">↓</kbd>
							<span> to navigate, </span>
							<kbd class="bg-surface-300-700 px-1 rounded">Enter</kbd>
							<span> to select</span>
						</div>
						<div>
							<span>Shortcut: </span>
							<kbd class="bg-surface-300-700 px-1 rounded">Ctrl</kbd>
							<span>+</span>
							<kbd class="bg-surface-300-700 px-1 rounded">K</kbd>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Portal>
{/if}