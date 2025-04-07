<script lang="ts">
	import { Film, Tv, Music, Video, FileVideo, Filter, Blocks } from '@lucide/svelte';
	import GenreSelector from './GenreSelector.svelte';

	interface ContentSettingsTabProps {
		showAdultContent: boolean;
		includeUnratedContent: boolean;
		contentTypes: string[];
		preferredGenres: Record<string, string[]>;
		maxRecommendations: Record<string, number>;
		toggleMediaType: (type: string) => void;
		handleGenreChange: (mediaType: string, genresList: string[]) => void;
		isMediaTypePreferred: (type: string) => boolean;
	}

	// Props - individual values instead of objects to mutate
	let {
		showAdultContent = $bindable(false),
		includeUnratedContent = $bindable(false),
		contentTypes = $bindable([]),
		preferredGenres = $bindable({ movies: [], series: [], music: [] }),
		maxRecommendations = $bindable({
			movieRecommendations: 20,
			seriesRecommendations: 20,
			musicRecommendations: 20,
			animeRecommendations: 20,
			documentaryRecommendations: 20
		}),
		toggleMediaType,
		handleGenreChange,
		isMediaTypePreferred
	}: ContentSettingsTabProps = $props();

	// Media type options
	const mediaTypes = [
		{
			id: 'movies',
			label: 'Movies',
			icon: Film,
			color: 'red'
		},
		{
			id: 'tvShows',
			label: 'TV Shows',
			icon: Tv,
			color: 'blue'
		},
		{
			id: 'music',
			label: 'Music',
			icon: Music,
			color: 'green'
		},
		{
			id: 'anime',
			label: 'Anime',
			icon: Video,
			color: 'purple'
		},
		{
			id: 'documentaries',
			label: 'Documentaries',
			icon: FileVideo,
			color: 'orange'
		}
	];
</script>

<div class="space-y-6">
	<header class="mb-4 flex items-center gap-3">
		<div class="bg-primary-500 flex h-10 w-10 items-center justify-center rounded-full">
			<Blocks size={20} class="text-white" />
		</div>
		<h3 class="text-lg font-medium">Content Preferences</h3>
	</header>

	<!-- Media Types -->
	<div class="form-control">
		<label class="label" for="media-types">
			<span class="label-text font-medium">Media Types</span>
		</label>
		<p class="text-surface-900-50 mb-3 text-sm">Select the types of media you're interested in</p>

		<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
			{#each mediaTypes as mediaType}
				<button
					type="button"
					class="flex items-center gap-3 rounded-lg border p-4 transition-colors"
					class:bg-primary-500={isMediaTypePreferred(mediaType.id)}
					class:bg-opacity-10={isMediaTypePreferred(mediaType.id)}
					class:border-primary-500={isMediaTypePreferred(mediaType.id)}
					class:border-surface-300-600={!isMediaTypePreferred(mediaType.id)}
					onclick={() => {
						toggleMediaType(mediaType.id);
					}}
				>
					{#if mediaType.color === 'red'}
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-500">
							<mediaType.icon size={20} class="text-white" />
						</div>
					{:else if mediaType.color === 'blue'}
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
							<mediaType.icon size={20} class="text-white" />
						</div>
					{:else if mediaType.color === 'green'}
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
							<mediaType.icon size={20} class="text-white" />
						</div>
					{:else if mediaType.color === 'purple'}
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500">
							<mediaType.icon size={20} class="text-white" />
						</div>
					{:else if mediaType.color === 'orange'}
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500">
							<mediaType.icon size={20} class="text-white" />
						</div>
					{/if}
					<span class="font-medium">{mediaType.label}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Content Filters -->
	<div class="form-control">
		<label class="label" for="content-filters">
			<span class="label-text font-medium">Content Filters</span>
		</label>

		<div class="mb-3 flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500">
				<Filter size={18} class="text-white" />
			</div>
			<div class="flex flex-1 items-center justify-between">
				<div>
					<span class="font-medium">Include Adult Content</span>
					<p class="text-surface-900-50 text-sm">Show content with mature or adult ratings</p>
				</div>
				<label class="relative inline-flex cursor-pointer items-center">
					<input type="checkbox" bind:checked={showAdultContent} class="peer sr-only" />
					<div
						class="peer peer-checked:bg-primary-500 h-6 w-11 rounded-full bg-gray-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-md after:transition-all peer-checked:after:translate-x-full dark:bg-gray-600"
					></div>
				</label>
			</div>
		</div>

		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500">
				<Filter size={18} class="text-white" />
			</div>
			<div class="flex flex-1 items-center justify-between">
				<div>
					<span class="font-medium">Include Unrated Content</span>
					<p class="text-surface-900-50 text-sm">Show content without official ratings</p>
				</div>
				<label class="relative inline-flex cursor-pointer items-center">
					<input type="checkbox" bind:checked={includeUnratedContent} class="peer sr-only" />
					<div
						class="peer peer-checked:bg-primary-500 h-6 w-11 rounded-full bg-gray-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-md after:transition-all peer-checked:after:translate-x-full dark:bg-gray-600"
					></div>
				</label>
			</div>
		</div>
	</div>

	<!-- Max Recommendations -->
	<div class="form-control">
		<label class="label" for="max-recommendations">
			<span class="label-text font-medium">Maximum Recommendations</span>
		</label>
		<p class="text-surface-900-50 mb-3 text-sm">
			Adjust how many recommendations you want for each media type
		</p>

		<div class="space-y-4">
			{#if contentTypes.length === 0}
				<p class="text-sm text-amber-500">
					Please select at least one media type to configure recommendation counts.
				</p>
			{:else}
				{#each mediaTypes.filter((type) => isMediaTypePreferred(type.id)) as mediaType}
					{#if mediaType.id === 'movies'}
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-500">
								<Film size={18} class="text-white" />
							</div>
							<div class="flex-1">
								<div class="flex justify-between">
									<span class="font-medium">{mediaType.label}</span>
									<span class="text-sm font-medium">
										{maxRecommendations.movieRecommendations}
									</span>
								</div>
								<input
									type="range"
									min="5"
									max="50"
									step="5"
									bind:value={maxRecommendations.movieRecommendations}
									class="range range-primary mt-1 w-full"
								/>
								<div class="text-surface-900-50 flex w-full justify-between px-1 text-xs">
									<span>5</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>50</span>
								</div>
							</div>
						</div>
					{:else if mediaType.id === 'tvShows'}
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
								<Tv size={18} class="text-white" />
							</div>
							<div class="flex-1">
								<div class="flex justify-between">
									<span class="font-medium">{mediaType.label}</span>
									<span class="text-sm font-medium">
										{maxRecommendations.seriesRecommendations}
									</span>
								</div>
								<input
									type="range"
									min="5"
									max="50"
									step="5"
									bind:value={maxRecommendations.seriesRecommendations}
									class="range range-primary mt-1 w-full"
								/>
								<div class="text-surface-900-50 flex w-full justify-between px-1 text-xs">
									<span>5</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>50</span>
								</div>
							</div>
						</div>
					{:else if mediaType.id === 'music'}
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
								<Music size={18} class="text-white" />
							</div>
							<div class="flex-1">
								<div class="flex justify-between">
									<span class="font-medium">{mediaType.label}</span>
									<span class="text-sm font-medium">
										{maxRecommendations.musicRecommendations}
									</span>
								</div>
								<input
									type="range"
									min="5"
									max="50"
									step="5"
									bind:value={maxRecommendations.musicRecommendations}
									class="range range-primary mt-1 w-full"
								/>
								<div class="text-surface-900-50 flex w-full justify-between px-1 text-xs">
									<span>5</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>50</span>
								</div>
							</div>
						</div>
					{:else if mediaType.id === 'anime'}
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500">
								<Video size={18} class="text-white" />
							</div>
							<div class="flex-1">
								<div class="flex justify-between">
									<span class="font-medium">{mediaType.label}</span>
									<span class="text-sm font-medium">
										{maxRecommendations.animeRecommendations}
									</span>
								</div>
								<input
									type="range"
									min="5"
									max="50"
									step="5"
									bind:value={maxRecommendations.animeRecommendations}
									class="range range-primary mt-1 w-full"
								/>
								<div class="text-surface-900-50 flex w-full justify-between px-1 text-xs">
									<span>5</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>50</span>
								</div>
							</div>
						</div>
					{:else if mediaType.id === 'documentaries'}
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500">
								<FileVideo size={18} class="text-white" />
							</div>
							<div class="flex-1">
								<div class="flex justify-between">
									<span class="font-medium">{mediaType.label}</span>
									<span class="text-sm font-medium">
										{maxRecommendations.documentaryRecommendations}
									</span>
								</div>
								<input
									type="range"
									min="5"
									max="50"
									step="5"
									bind:value={maxRecommendations.documentaryRecommendations}
									class="range range-primary mt-1 w-full"
								/>
								<div class="text-surface-900-50 flex w-full justify-between px-1 text-xs">
									<span>5</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>|</span>
									<span>50</span>
								</div>
							</div>
						</div>
					{/if}
				{/each}
			{/if}
		</div>
	</div>

	<!-- Genre Preferences -->
	<div class="form-control">
		<label class="label" for="genre-preferences">
			<span class="label-text font-medium">Genre Preferences</span>
		</label>
		<p class="text-surface-900-50 mb-3 text-sm">
			Select genres you're most interested in for each media type
		</p>

		{#if contentTypes.length > 0}
			<GenreSelector
				preferredMediaTypes={contentTypes}
				genres={preferredGenres}
				onChange={handleGenreChange}
			/>
		{:else}
			<div class="bg-surface-200-800/30 rounded-lg p-4 text-center">
				<p class="text-surface-900-50">
					Please select at least one media type above to customize genre preferences.
				</p>
			</div>
		{/if}
	</div>
</div>
