<script lang="ts">
	import { onMount } from 'svelte';
	import { mediaCollection } from '../../stores/mediaCollection';

	let props = $props<{
		movie: any;
		isInCollection: boolean;
		clientOptions: string[];
	}>();

	let selectedClient = $state<string>('');
	let showRequestDropdown = $state<boolean>(false);
	let isInSelection = $state<boolean>(false);

	function toggleRequestDropdown() {
		showRequestDropdown = !showRequestDropdown;
	}

	function selectClient(client: string) {
		selectedClient = client;
		showRequestDropdown = false;
		requestMovie(client);
	}

	function requestMovie(client: string) {
		// Implementation for requesting movie from client
		console.log(`Requesting ${props.movie.title} from ${client}`);
		// API call would go here
	}

	function startMovieChat() {
		// Start a chat about this movie
		console.log(`Starting chat about ${props.movie.title}`);
		window.location.href = `/chat?context=movie&id=${props.movie.id}`;
	}

	function toggleSelection() {
		if (isInSelection) {
			mediaCollection.removeItem(props.movie.id);
		} else {
			if (props.movie) {
				mediaCollection.addItem({
					id: props.movie.id,
					title: props.movie.title,
					poster_path: props.movie.poster?.replace('https://image.tmdb.org/t/p/original', '') || '',
					release_date: props.movie.releaseDate || props.movie.year?.toString() || '',
					type: 'movie'
				});
			}
		}
		isInSelection = !isInSelection;
	}

	onMount(() => {
		if (props.clientOptions.length > 0) {
			selectedClient = props.clientOptions[0];
		}

		// Check if movie is already in selection
		isInSelection = mediaCollection.isInCollection(props.movie.id);

		// Subscribe to store changes
		const unsubscribe = mediaCollection.subscribe(() => {
			isInSelection = mediaCollection.isInCollection(props.movie.id);
		});

		return unsubscribe;
	});
</script>

<div class="bg-surface-200-800/60 mx-auto my-8 w-72 rounded-xl p-6 backdrop-blur-sm md:mx-0">
	<div class="flex flex-wrap gap-3">
		{#if props.isInCollection}
			<!-- <a  -->
			<!--   href={`/watch/${props.movie.id}`}  -->
			<!--   class="btn variant-filled-primary flex items-center gap-2" -->
			<!-- > -->
			<!--   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> -->
			<!--     <circle cx="12" cy="12" r="10"/> -->
			<!--     <polygon points="10 8 16 12 10 16 10 8"/> -->
			<!--   </svg> -->
			<!--   Watch Now -->
			<!-- </a> -->
		{:else}
			<div class="relative">
				<button
					onclick={toggleRequestDropdown}
					class="btn variant-filled-tertiary flex items-center gap-2"
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
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
						<polyline points="7 10 12 15 17 10" />
						<line x1="12" y1="15" x2="12" y2="3" />
					</svg>
					Request Movie
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
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</button>

				{#if showRequestDropdown}
					<div class="bg-surface-200-800 absolute z-20 mt-2 w-64 rounded-lg py-2 shadow-lg">
						{#each props.clientOptions as client}
							<button
								onclick={() => selectClient(client)}
								class="hover:bg-surface-300-700 w-full px-4 py-2 text-left text-white"
							>
								{client}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<button onclick={startMovieChat} class="btn variant-soft-secondary flex items-center gap-2">
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
				<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
			</svg>
			Chat About This Movie
		</button>

		<button
			class={`btn ${isInSelection ? 'variant-soft-primary' : 'variant-soft-surface'} flex items-center gap-2`}
			onclick={toggleSelection}
		>
			{#if isInSelection}
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
					<path d="M9 11l3 3L22 4" />
					<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
				</svg>
				Added to Selection
			{:else}
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
					<path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
					<path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
					<path d="M18 12c-1.1 0-2 .9-2 2s.9 2 2 2h4v-4z" />
				</svg>
				Add to Selection
			{/if}
		</button>
	</div>
</div>

