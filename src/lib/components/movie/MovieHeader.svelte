<script lang="ts">
	let props = $props<{ movie: any }>();

	// Format runtime from minutes to hours and minutes
	function formatRuntime(minutes) {
		if (!minutes) return 'Unknown';
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
	}
</script>

<div class="relative z-10 -mx-4 -mt-16 -mb-24">
	<div class="absolute inset-0 h-[72vh] min-h-[625px] w-full">
		<img src={props.movie.backdrop} alt={props.movie.title} class="h-full w-full object-cover" />
		<div class="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
		<div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
	</div>

	<!-- <div class="flex flex-col items-center pr-4 pl-2 md:flex-shrink-0 md:items-start"> -->
	<div class="relative z-10 mx-auto ml-6 w-full px-4 pt-60 pb-16">
		<div class="flex flex-col gap-4 md:flex-row">
			<!-- Poster Column -->
			<div class="flex flex-col items-center md:items-start">
				<!-- Poster centered in a slightly larger container -->
				<div class="flex w-72 justify-center md:mx-0">
					<div class="w-64 overflow-hidden rounded-lg shadow-2xl">
						<img src={props.movie.poster} alt={props.movie.title} class="w-full" />
					</div>
				</div>

				<!-- Watch Providers - Floating Box (wider than poster) -->
				<div
					class="bg-surface-200-800/60 relative z-20 mx-auto w-72 -translate-y-10 transform rounded-xl p-6 shadow-lg backdrop-blur-sm"
				>
					<h3
						class="text-primary-400 mb-3 text-center text-sm font-semibold tracking-wider uppercase"
					>
						Watch Now
					</h3>
					<div class="flex flex-col gap-2">
						{#if props.movie.availableOn?.length}
							{#each props.movie.availableOn as provider}
								<div
									class="bg-surface-100-900/80 hover:bg-surface-300-700 flex items-center justify-between rounded-lg px-4 py-2 text-sm transition-colors"
								>
									<div class="flex items-center gap-2">
										<img src={`/${provider.toLowerCase()}.svg`} alt={provider} class="h-5 w-5" />
										<span>{provider}</span>
									</div>
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
										<circle cx="12" cy="12" r="10" />
										<polygon points="10 8 16 12 10 16 10 8" />
									</svg>
								</div>
							{/each}
						{:else}
							<div
								class="bg-surface-100-900/80 flex items-center justify-center rounded-lg px-4 py-3 text-sm text-gray-400"
							>
								Not available in your collection
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Movie Info Column -->
			<div class="flex-grow">
				<div class="text-primary-500 mb-3 flex items-center gap-2 text-sm font-medium">
					<span>{props.movie.year}</span>
					<span>•</span>
					<span class="flex items-center gap-1">
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
							<circle cx="12" cy="12" r="10" />
							<polyline points="12 6 12 12 16 14" />
						</svg>
						{formatRuntime(props.movie.runtime)}
					</span>
				</div>

				<h1 class="mb-2 text-4xl font-bold text-white">{props.movie.title}</h1>
				{#if props.movie.tagline}
					<p class="mb-4 text-lg text-gray-400 italic">{props.movie.tagline}</p>
				{/if}

				<div class="mb-6 flex flex-wrap gap-2">
					{#each props.movie.genres as genre}
						<span class="bg-surface-200-800/80 rounded-full px-3 py-1 text-xs font-medium">
							{genre}
						</span>
					{/each}
				</div>

				<div class="mb-6 flex items-center gap-6">
					{#if props.movie.recommendationScore !== undefined}
						<div class="flex flex-col items-center">
							<div class="relative h-16 w-16">
								<svg viewBox="0 0 36 36" class="h-16 w-16 rotate-[-90deg]">
									<circle cx="18" cy="18" r="16" fill="none" stroke="#333" stroke-width="2"
									></circle>
									<circle
										cx="18"
										cy="18"
										r="16"
										fill="none"
										stroke="#BB86FC"
										stroke-width="2"
										stroke-dasharray={`${(2 * Math.PI * 16 * props.movie.recommendationScore) / 100} ${2 * Math.PI * 16 * (1 - props.movie.recommendationScore / 100)}`}
									></circle>
								</svg>
								<div class="absolute inset-0 flex items-center justify-center text-lg font-bold">
									{props.movie.recommendationScore}%
								</div>
							</div>
							<span class="mt-1 text-xs font-medium">Match Score</span>
						</div>
					{/if}

					{#if props.movie.externalRatings}
						{#each props.movie.externalRatings as rating}
							<div class="flex flex-col items-center">
								<div class="flex items-center gap-1">
									<img src={rating.logo} alt={rating.source} class="h-5 w-5 object-contain" />
									<span class="text-lg font-medium">
										{rating.score}<span class="text-xs opacity-70">/{rating.outOf}</span>
									</span>
								</div>
								<span class="mt-1 text-xs font-medium">{rating.source}</span>
							</div>
						{/each}
					{/if}
				</div>

				<!-- Overview -->
				<p class="mb-6 max-w-4xl text-lg leading-relaxed text-gray-200">
					{props.movie.overview}
				</p>
			</div>
		</div>
	</div>
</div>

