<script lang="ts">
	import TrailerModal from './TrailerModal.svelte';

	let props = $props<{ movie: any }>();

	const tabs = [
		{ id: 'overview', label: 'Overview', icon: 'film' },
		{ id: 'cast', label: 'Cast & Crew', icon: 'users' },
		{ id: 'reviews', label: 'Reviews', icon: 'thumbs-up' }
	];

	let activeTab = $state<string>('overview');
	let isTrailerModalOpen = $state<boolean>(false);

	function setActiveTab(tabId: string) {
		activeTab = tabId;
	}

	function openTrailerModal() {
		isTrailerModalOpen = true;
	}

	function closeTrailerModal() {
		isTrailerModalOpen = false;
	}

	function getIcon(iconName: string) {
		switch (iconName) {
			case 'film':
				return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`;
			case 'users':
				return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
			case 'thumbs-up':
				return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>`;
			case 'list-checks':
				return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1"/><path d="M4 12l-2 1 2 1"/><path d="M4 18l-2-1 2-1"/></svg>`;
			default:
				return '';
		}
	}
</script>

<div class="">
	<div class="mb-6 flex space-x-1 overflow-x-auto border-b border-gray-700 pb-2">
		{#each tabs as tab}
			<button
				class={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? 'border-primary-500 text-primary-500 border-b-2' : 'text-gray-400 hover:text-white'}`}
				onclick={() => setActiveTab(tab.id)}
			>
				<span class="mr-2">{@html getIcon(tab.icon)}</span>
				{tab.label}
			</button>
		{/each}
	</div>

	<div class="min-h-[400px]">
		{#if activeTab === 'overview'}
			<!-- Awards -->
			{#if props.movie.awards}
				<div class="mb-6">
					<h3 class="mb-3 text-xl font-semibold">Awards</h3>
					<p class="text-gray-300">{props.movie.awards}</p>
				</div>
			{/if}

			<!-- Trailer -->
			{#if props.movie.trailerUrl}
				<div class="mb-6">
					<h3 class="mb-3 text-xl font-semibold">Trailer</h3>
					<div
						class="group relative aspect-video cursor-pointer overflow-hidden rounded-lg bg-black"
						onclick={openTrailerModal}
					>
						<!-- YouTube thumbnail (using the videoid from the URL) -->
						{#if props.movie.trailerUrl.includes('youtube.com/watch?v=')}
							{@const videoId = props.movie.trailerUrl.split('v=')[1].split('&')[0]}
							<img
								src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
								alt="Trailer thumbnail"
								class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 group-hover:opacity-80"
							/>
						{:else}
							<div class="bg-surface-200-800 flex h-full w-full items-center justify-center">
								<span class="text-lg">Play Trailer</span>
							</div>
						{/if}

						<!-- Play button overlay -->
						<div class="absolute inset-0 flex items-center justify-center">
							<div
								class="group-hover:bg-primary-500/70 transform rounded-full bg-black/50 p-4 transition-transform duration-300 group-hover:scale-110"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="32"
									height="32"
									viewBox="0 0 24 24"
									fill="white"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="text-white"
								>
									<polygon points="5 3 19 12 5 21 5 3"></polygon>
								</svg>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Overview -->
			<div class="mb-6">
				<h3 class="mb-3 text-xl font-semibold">Synopsis</h3>
				<p class="leading-relaxed text-gray-300">{props.movie.overview}</p>
			</div>

			<!-- Additional Details -->
			<div class="mb-6 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
				{#if props.movie.directors?.length}
					<div>
						<span class="font-medium text-gray-400">Director:</span>
						<span class="ml-2">{props.movie.directors.join(', ')}</span>
					</div>
				{/if}
				{#if props.movie.writers?.length}
					<div>
						<span class="font-medium text-gray-400">Writer:</span>
						<span class="ml-2">{props.movie.writers.join(', ')}</span>
					</div>
				{/if}
				{#if props.movie.releaseDate}
					<div>
						<span class="font-medium text-gray-400">Release Date:</span>
						<span class="ml-2">{props.movie.releaseDate}</span>
					</div>
				{/if}
				{#if props.movie.language}
					<div>
						<span class="font-medium text-gray-400">Language:</span>
						<span class="ml-2">{props.movie.language}</span>
					</div>
				{/if}
				{#if props.movie.productionCompanies}
					<div>
						<span class="font-medium text-gray-400">Production:</span>
						<span class="ml-2">{props.movie.productionCompanies.join(', ')}</span>
					</div>
				{/if}
				{#if props.movie.budget}
					<div>
						<span class="font-medium text-gray-400">Budget:</span>
						<span class="ml-2">{props.movie.budget}</span>
					</div>
				{/if}
				{#if props.movie.boxOffice}
					<div>
						<span class="font-medium text-gray-400">Box Office:</span>
						<span class="ml-2">{props.movie.boxOffice}</span>
					</div>
				{/if}
			</div>
		{:else if activeTab === 'cast'}
			<!-- Cast & Crew Tab -->
			<div class="mb-6">
				<h3 class="mb-4 text-xl font-semibold">Cast</h3>
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{#each props.movie.cast as person}
						<div
							class="group bg-surface-200-800/60 flex flex-col overflow-hidden rounded-lg transition-transform hover:scale-105"
						>
							<img src={person.photo} alt={person.name} class="aspect-[2/3] w-full object-cover" />
							<div class="p-3">
								<h4 class="font-medium text-white">{person.name}</h4>
								<p class="text-sm text-gray-400">{person.character}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Crew Information -->
			<div class="mb-6">
				<h3 class="mb-4 text-xl font-semibold">Crew</h3>
				<div class="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
					{#if props.movie.directors?.length}
						<div>
							<h4 class="font-medium">Directors</h4>
							<ul class="mt-1 space-y-1 text-gray-300">
								{#each props.movie.directors as director}
									<li>{director}</li>
								{/each}
							</ul>
						</div>
					{/if}

					{#if props.movie.writers?.length}
						<div>
							<h4 class="font-medium">Writers</h4>
							<ul class="mt-1 space-y-1 text-gray-300">
								{#each props.movie.writers as writer}
									<li>{writer}</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			</div>
		{:else if activeTab === 'reviews'}
			<!-- Reviews Tab -->
			<div class="mb-6">
				<div class="mb-4 flex items-center justify-between">
					<h3 class="text-xl font-semibold">User Reviews</h3>
					<button class="btn variant-soft-surface btn-sm">Write a Review</button>
				</div>

				<div class="space-y-4">
					{#each props.movie.reviews as review}
						<div class="bg-surface-200-800/60 rounded-lg p-4">
							<div class="mb-2 flex items-center justify-between">
								<span class="font-medium">{review.author}</span>
								<div class="flex items-center">
									{#each Array(5) as _, i}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill={i < review.rating ? 'currentColor' : 'none'}
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											class={i < review.rating ? 'text-yellow-500' : 'text-gray-600'}
										>
											<polygon
												points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
											/>
										</svg>
									{/each}
									<span class="ml-2 text-sm text-gray-400">{review.date}</span>
								</div>
							</div>
							<p class="text-gray-300">{review.text}</p>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Trailer Modal -->
{#if props.movie.trailerUrl}
	<TrailerModal
		trailerUrl={props.movie.trailerUrl}
		isOpen={isTrailerModalOpen}
		onClose={closeTrailerModal}
	/>
{/if}

