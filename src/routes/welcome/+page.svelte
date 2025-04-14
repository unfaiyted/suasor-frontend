<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { backOut, cubicOut } from 'svelte/easing';
	import { isAuthenticated } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { Play, Tag, User, Radio, Zap, MessagesSquare, BookOpen, Film, Tv } from '@lucide/svelte';

	// State
	let isVisible = $state(false);
	let activeSection = $state(0);
	let movieRecommendations = $state([
		{
			id: 'movie1',
			title: 'Inception',
			year: 2010,
			poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
			rating: 8.8,
			genres: ['Sci-Fi', 'Action']
		},
		{
			id: 'movie2',
			title: 'Interstellar',
			year: 2014,
			poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
			rating: 8.6,
			genres: ['Sci-Fi', 'Drama']
		},
		{
			id: 'movie3',
			title: 'The Shawshank Redemption',
			year: 1994,
			poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
			rating: 9.3,
			genres: ['Drama']
		},
		{
			id: 'movie4',
			title: 'Pulp Fiction',
			year: 1994,
			poster: 'https://image.tmdb.org/t/p/w500/fIE3lAGcZDV1G6XM5KmuWnNsPp1.jpg',
			rating: 8.9,
			genres: ['Crime', 'Drama']
		},
		{
			id: 'movie5',
			title: 'The Dark Knight',
			year: 2008,
			poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
			rating: 9.0,
			genres: ['Action', 'Crime']
		}
	]);

	// Integrations with corresponding logos
	const integrations = [
		{ name: 'Plex', logo: '/plex.svg', type: 'media' },
		{ name: 'Jellyfin', logo: '/jellyfin.svg', type: 'media' },
		{ name: 'Emby', logo: '/emby.svg', type: 'media' },
		{ name: 'Radarr', logo: '/radarr.svg', type: 'automation' },
		{ name: 'Sonarr', logo: '/sonarr.svg', type: 'automation' },
		{ name: 'Lidarr', logo: '/lidarr.svg', type: 'automation' },
		{ name: 'Claude', logo: '/claude.svg', type: 'ai' },
		{ name: 'OpenAI', logo: '/openai.svg', type: 'ai' },
		{ name: 'Ollama', logo: '/ollama.svg', type: 'ai' }
	];

	// Features with icons and descriptions
	const features = [
		{
			title: 'AI-Powered Recommendations',
			description:
				'Get personalized movie, TV, and music recommendations powered by AI that learns your taste.',
			icon: Zap,
			color: 'bg-indigo-500'
		},
		{
			title: 'Connect Media Servers',
			description: 'Integrate with Plex, Jellyfin, Emby and more to sync your media collection.',
			icon: Film,
			color: 'bg-orange-500'
		},
		{
			title: 'Chat About Media',
			description:
				'Discuss movies, TV shows, and music with an AI assistant trained to understand your preferences.',
			icon: MessagesSquare,
			color: 'bg-green-500'
		},
		{
			title: 'Media Collections',
			description:
				'Create and manage collections, watchlists, and playlists across all your media types.',
			icon: Tag,
			color: 'bg-blue-500'
		},
		{
			title: 'Discover New Content',
			description:
				'Explore new releases, hidden gems, and trending content tailored to your interests.',
			icon: BookOpen,
			color: 'bg-purple-500'
		},
		{
			title: 'Automate Your Library',
			description:
				'Connect with automation tools like Radarr, Sonarr, and Lidarr to expand your collection.',
			icon: Radio,
			color: 'bg-red-500'
		}
	];

	// Auto-rotate active section
	let rotationInterval: ReturnType<typeof setInterval>;

	onMount(async () => {
		// Set visibility after a short delay for entrance animations
		await tick();
		isVisible = true;

		// Start section rotation
		rotationInterval = setInterval(() => {
			activeSection = (activeSection + 1) % features.length;
		}, 5000);

		return () => {
			clearInterval(rotationInterval);
		};
	});

	function navigateToRegister() {
		goto('/register');
	}

	function navigateToLogin() {
		goto('/login');
	}

	function setActiveSection(index: number) {
		activeSection = index;
		// Reset the interval timer when manually changing sections
		clearInterval(rotationInterval);
		rotationInterval = setInterval(() => {
			activeSection = (activeSection + 1) % features.length;
		}, 5000);
	}
</script>

<svelte:head>
	<title>Welcome to Suasor - Your Personal Media Assistant</title>
	<meta
		name="description"
		content="Suasor is an AI-powered media assistant that helps you discover, organize, and enjoy your movies, TV shows, and music."
	/>
</svelte:head>

<div
	class="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-black via-gray-900 to-gray-800"
>
	<!-- Dynamic background elements -->
	<div class="absolute inset-0 overflow-hidden opacity-20">
		<div class="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-purple-700 blur-[150px]"></div>
		<div class="absolute top-2/3 right-1/4 h-96 w-96 rounded-full bg-blue-700 blur-[150px]"></div>
		<div
			class="absolute bottom-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-red-700 blur-[120px]"
		></div>
	</div>

	<!-- Content wrapper -->
	<div class="relative z-10 mx-auto px-4 py-12 sm:px-6 lg:px-8">
		<!-- Hero section -->
		<div class="text-center">
			{#if isVisible}
				<div in:fade={{ delay: 200, duration: 800 }}>
					<img src="/logo.svg" alt="Suasor Logo" class="mx-auto h-20 w-20" />
				</div>
				<h1
					class="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl md:text-6xl"
					in:fade={{ delay: 400, duration: 800 }}
				>
					Suasor
				</h1>
				<p
					class="mx-auto mt-4 max-w-2xl text-xl text-gray-300"
					in:fade={{ delay: 600, duration: 800 }}
				>
					Your AI-powered media assistant for personalized recommendations and library management
				</p>
				<div
					class="mx-auto mt-8 flex flex-wrap justify-center gap-4"
					in:fade={{ delay: 800, duration: 800 }}
				>
					<button
						onclick={navigateToRegister}
						class="btn btn-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
					>
						Sign Up Free
					</button>
					<button onclick={navigateToLogin} class="btn btn-lg btn-outline"> Log In </button>
				</div>
			{/if}
		</div>

		<!-- Integration logos -->
		{#if isVisible}
			<div class="mt-16" in:fade={{ delay: 1000, duration: 800 }}>
				<p class="text-center text-sm font-medium tracking-wider text-gray-400 uppercase">
					Integrates with your favorite services
				</p>
				<div class="mx-auto mt-6 grid max-w-4xl grid-cols-3 gap-8 sm:grid-cols-6 lg:grid-cols-9">
					{#each integrations as integration, i}
						<div
							class="flex items-center justify-center"
							in:scale={{
								delay: 1000 + i * 100,
								duration: 400,
								start: 0.8,
								easing: backOut
							}}
						>
							<img
								src={integration.logo}
								alt={integration.name}
								class="h-12 w-auto object-contain opacity-70 transition-opacity hover:opacity-100"
							/>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Feature showcase section with animation -->
		{#if isVisible}
			<div class="mt-24" in:fade={{ delay: 1500, duration: 800 }}>
				<div class="text-center">
					<h2 class="text-3xl font-extrabold sm:text-4xl">Discover the power of Suasor</h2>
					<p class="mx-auto mt-3 max-w-2xl text-xl text-gray-400">
						Enhance your media experience with these powerful features
					</p>
				</div>

				<!-- Feature selector -->
				<div class="mt-6 flex flex-wrap justify-center gap-2">
					{#each features as feature, i}
						<button
							class="rounded-full px-4 py-2 text-sm transition"
							class:bg-surface-200-800={activeSection === i}
							class:text-white={activeSection === i}
							class:bg-surface-100-900={activeSection !== i}
							class:text-gray-400={activeSection !== i}
							onclick={() => setActiveSection(i)}
						>
							{feature.title}
						</button>
					{/each}
				</div>

				<!-- Feature detail section -->
				<div class="mx-auto mt-12 flex max-w-6xl flex-col gap-8 lg:flex-row">
					<!-- Feature description -->
					<div class="flex-1 space-y-6 md:self-center">
						{#each features as feature, i}
							{#if activeSection === i}
								<div class="space-y-4" in:fly={{ x: -50, duration: 500, easing: cubicOut }}>
									<div
										class={`flex h-16 w-16 items-center justify-center rounded-2xl ${feature.color} text-white shadow-lg`}
									>
										<svelte:component this={feature.icon} size={32} />
									</div>
									<h3 class="text-2xl font-bold text-white">{feature.title}</h3>
									<p class="text-lg text-gray-300">
										{feature.description}
									</p>
								</div>
							{/if}
						{/each}
					</div>

					<!-- Visualization section based on active feature -->
					<div class="bg-surface-100-900/50 flex-1 overflow-hidden rounded-xl p-6 backdrop-blur-sm">
						{#if activeSection === 0}
							<!-- AI Recommendations visualization -->
							<div class="space-y-4">
								<h4 class="text-lg font-medium">Personalized Recommendations</h4>
								<div
									class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5"
									in:fly={{ y: 30, duration: 500, easing: cubicOut }}
								>
									{#each movieRecommendations as movie, i}
										<div
											class="card relative overflow-hidden transition-all hover:ring-2 hover:ring-purple-500"
											in:scale={{
												delay: i * 100,
												duration: 400,
												start: 0.8,
												easing: backOut
											}}
										>
											<div class="relative">
												<img
													src={movie.poster}
													alt={movie.title}
													class="h-auto w-full object-cover"
												/>
												<div
													class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"
												></div>
												<div class="absolute bottom-0 left-0 p-2 text-white">
													<h4 class="text-sm font-bold">{movie.title}</h4>
													<div class="flex items-center gap-1 text-xs">
														<span>{movie.year}</span>
														<span class="flex items-center gap-1">
															<svg
																class="h-3 w-3 text-yellow-400"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
																></path>
															</svg>
															{movie.rating}
														</span>
													</div>
												</div>

												<div
													class="absolute top-2 right-2 rounded-full bg-purple-500 px-2 py-1 text-xs font-medium"
												>
													{Math.floor(85 + Math.random() * 10)}% Match
												</div>
											</div>
											<div class="p-2">
												<div class="flex flex-wrap gap-1">
													{#each movie.genres as genre}
														<span class="bg-surface-200-800 rounded-full p-1 px-1.5 py-0 text-xs"
															>{genre}</span
														>
													{/each}
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{:else if activeSection === 1}
							<!-- Media Server visualization -->
							<div class="space-y-6" in:fly={{ y: 30, duration: 500, easing: cubicOut }}>
								<h4 class="text-lg font-medium">Connect Your Media Servers</h4>
								<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
									{#each integrations.filter((i) => i.type === 'media') as integration, i}
										<div
											class="bg-surface-200-800/50 flex flex-col items-center gap-4 rounded-xl p-6 transition-transform hover:scale-105"
											in:scale={{
												delay: i * 100,
												duration: 400,
												start: 0.9,
												easing: backOut
											}}
										>
											<img src={integration.logo} alt={integration.name} class="h-16 w-16" />
											<h5 class="text-lg font-medium">{integration.name}</h5>
											<p class="text-center text-sm text-gray-400">
												Connect your {integration.name} library for synchronized recommendations
											</p>
										</div>
									{/each}
								</div>
							</div>
						{:else if activeSection === 2}
							<!-- Chat visualization -->
							<div
								class="flex flex-col space-y-4"
								in:fly={{ y: 30, duration: 500, easing: cubicOut }}
							>
								<h4 class="text-lg font-medium">Chat About Your Media</h4>
								<div class="bg-surface-100-900 flex-1 rounded-lg p-4">
									<div class="space-y-4">
										<div class="flex gap-2">
											<div class="h-8 w-8 flex-shrink-0 rounded-full bg-blue-600 p-1">
												<User size={24} />
											</div>
											<div class="bg-surface-200-800 rounded-lg rounded-tl-none p-3">
												<p>
													I'm looking for a movie like Interstellar but with less emphasis on space
													travel.
												</p>
											</div>
										</div>

										<div class="flex gap-2">
											<div class="h-8 w-8 flex-shrink-0 rounded-full bg-purple-600 p-1">
												<svg
													viewBox="0 0 32 32"
													class="h-6 w-6 fill-current"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M15 2a13 13 0 0 0-4.2 25.3c.2.1.3 0 .3-.1v-2.1c-1.2.3-1.8.1-2-.3-.3-.5-.4-1-.8-1.5-.1-.1-.5-.3-.8-.5.2-.1.5 0 .8.1.4.2.7.6 1 1 .6.8 1.3 1 1.7.7.1-.7.4-1.1.7-1.3-2.8-.4-4.6-1.9-4.6-4.2 0-1 .4-2 1-2.7 0-.2 0-.5-.2-1.5 0-.4 0-.8.2-1.4.8.1 1.8.6 2.8 1.3a10.3 10.3 0 0 1 2.7-.4c1 0 1.8.1 2.7.4 1-1 2-1.3 2.7-1.4l.2.8v.7l-.1.6c.6.7 1 1.5 1 2.6 0 2.3-1.9 3.8-4.6 4.2.4.3.7.9.7 1.7v3.3c0 .2.1.3.3.2A13 13 0 0 0 15 2z"
													></path>
												</svg>
											</div>
											<div class="bg-surface-200-800 rounded-lg rounded-tl-none p-3">
												<p>
													Based on your preferences, I'd recommend 'Arrival' (2016). It's a
													thoughtful sci-fi film like Interstellar but focuses more on communication
													and human connection than space travel. It has the same sense of wonder
													and emotional depth.
												</p>
											</div>
										</div>

										<div class="flex gap-2">
											<div class="h-8 w-8 flex-shrink-0 rounded-full bg-blue-600 p-1">
												<User size={24} />
											</div>
											<div class="bg-surface-200-800 rounded-lg rounded-tl-none p-3">
												<p>Sounds perfect! Is it available on any of my streaming services?</p>
											</div>
										</div>

										<div class="flex gap-2">
											<div class="h-8 w-8 flex-shrink-0 rounded-full bg-purple-600 p-1">
												<svg
													viewBox="0 0 32 32"
													class="h-6 w-6 fill-current"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M15 2a13 13 0 0 0-4.2 25.3c.2.1.3 0 .3-.1v-2.1c-1.2.3-1.8.1-2-.3-.3-.5-.4-1-.8-1.5-.1-.1-.5-.3-.8-.5.2-.1.5 0 .8.1.4.2.7.6 1 1 .6.8 1.3 1 1.7.7.1-.7.4-1.1.7-1.3-2.8-.4-4.6-1.9-4.6-4.2 0-1 .4-2 1-2.7 0-.2 0-.5-.2-1.5 0-.4 0-.8.2-1.4.8.1 1.8.6 2.8 1.3a10.3 10.3 0 0 1 2.7-.4c1 0 1.8.1 2.7.4 1-1 2-1.3 2.7-1.4l.2.8v.7l-.1.6c.6.7 1 1.5 1 2.6 0 2.3-1.9 3.8-4.6 4.2.4.3.7.9.7 1.7v3.3c0 .2.1.3.3.2A13 13 0 0 0 15 2z"
													></path>
												</svg>
											</div>
											<div class="bg-surface-200-800 rounded-lg rounded-tl-none p-3">
												<p>
													I see that 'Arrival' is available on your Plex server. Would you like me
													to queue it up for you?
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						{:else if activeSection === 3}
							<!-- Collections visualization -->
							<div class="space-y-4" in:fly={{ y: 30, duration: 500, easing: cubicOut }}>
								<h4 class="text-lg font-medium">Organize Your Media Collections</h4>
								<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
									{#each [{ name: 'Sci-Fi Essentials', count: 24, color: 'bg-blue-600' }, { name: 'Award Winners', count: 37, color: 'bg-purple-600' }, { name: 'Indie Gems', count: 18, color: 'bg-green-600' }, { name: 'Weekend Watchlist', count: 12, color: 'bg-orange-600' }] as collection, i}
										<div
											class="group flex cursor-pointer items-center gap-4 rounded-lg border border-gray-800 p-4 transition-colors hover:border-gray-700"
											in:scale={{
												delay: i * 100,
												duration: 400,
												start: 0.9,
												easing: backOut
											}}
										>
											<div
												class={`flex h-12 w-12 items-center justify-center rounded-lg ${collection.color}`}
											>
												<Tag size={24} />
											</div>
											<div>
												<h5 class="group-hover:text-primary-500 text-lg font-medium">
													{collection.name}
												</h5>
												<p class="text-sm text-gray-400">{collection.count} items</p>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{:else if activeSection === 4}
							<!-- Discover visualization -->
							<div class="space-y-4" in:fly={{ y: 30, duration: 500, easing: cubicOut }}>
								<h4 class="text-lg font-medium">Discover New Content</h4>
								<div class="bg-surface-200-800 relative overflow-hidden rounded-lg p-6">
									<div
										class="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-purple-900/30 blur-3xl"
									></div>
									<div class="relative z-10">
										<h5 class="text-xl font-bold">Weekly Discovery</h5>
										<p class="mb-4 text-gray-400">Based on your watch history and preferences</p>

										<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
											{#each [{ title: 'New Releases', icon: Film, color: 'bg-blue-600', count: 8 }, { title: 'Hidden Gems', icon: Zap, color: 'bg-purple-600', count: 5 }, { title: 'Trending Now', icon: Radio, color: 'bg-green-600', count: 12 }] as category, i}
												<div
													class="bg-surface-300-700/50 flex flex-col items-center gap-2 rounded-lg p-4 text-center"
													in:scale={{
														delay: i * 100,
														duration: 400,
														start: 0.9,
														easing: backOut
													}}
												>
													<div
														class={`flex h-10 w-10 items-center justify-center rounded-full ${category.color}`}
													>
														<svelte:component this={category.icon} size={20} />
													</div>
													<h6 class="font-medium">{category.title}</h6>
													<p class="text-sm text-gray-400">{category.count} items</p>
												</div>
											{/each}
										</div>
									</div>
								</div>
							</div>
						{:else if activeSection === 5}
							<!-- Automation visualization -->
							<div class="space-y-4" in:fly={{ y: 30, duration: 500, easing: cubicOut }}>
								<h4 class="text-lg font-medium">Automate Your Media Library</h4>
								<div class="flex flex-col gap-4">
									<div
										class="bg-surface-200-800/50 relative overflow-hidden rounded-lg p-6"
										in:scale={{
											duration: 400,
											start: 0.9,
											easing: backOut
										}}
									>
										<div class="flex items-start justify-between gap-4">
											<div>
												<div class="flex items-center gap-2">
													<img src="/radarr.svg" alt="Radarr" class="h-8 w-8" />
													<h5 class="text-lg font-medium">Radarr Integration</h5>
												</div>
												<p class="mt-2 text-gray-400">
													Automatically download new movie recommendations and keep your library
													updated with the latest releases.
												</p>
											</div>

											<div
												class="inline-flex items-center rounded-full bg-green-900/30 px-3 py-1 text-sm text-green-400"
											>
												<span class="mr-2 h-2 w-2 rounded-full bg-green-400"></span> Connected
											</div>
										</div>

										<div class="bg-surface-300-700/50 mt-4 rounded-lg p-3">
											<div class="flex items-center justify-between text-sm">
												<span>Last sync: Today, 2:45 PM</span>
												<span>12 new movies added this week</span>
											</div>
										</div>
									</div>

									<div
										class="bg-surface-200-800/50 relative overflow-hidden rounded-lg p-6"
										in:scale={{
											delay: 100,
											duration: 400,
											start: 0.9,
											easing: backOut
										}}
									>
										<div class="flex items-start justify-between gap-4">
											<div>
												<div class="flex items-center gap-2">
													<img src="/sonarr.svg" alt="Sonarr" class="h-8 w-8" />
													<h5 class="text-lg font-medium">Sonarr Integration</h5>
												</div>
												<p class="mt-2 text-gray-400">
													Keep track of TV shows and automatically download new episodes as they
													become available.
												</p>
											</div>

											<div
												class="inline-flex items-center rounded-full bg-green-900/30 px-3 py-1 text-sm text-green-400"
											>
												<span class="mr-2 h-2 w-2 rounded-full bg-green-400"></span> Connected
											</div>
										</div>

										<div class="bg-surface-300-700/50 mt-4 rounded-lg p-3">
											<div class="flex items-center justify-between text-sm">
												<span>Last sync: Today, 3:12 PM</span>
												<span>5 shows updated with new episodes</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<!-- CTA section -->
		{#if isVisible}
			<div
				class="mt-24 rounded-2xl bg-gradient-to-r from-indigo-900 to-purple-900 px-6 py-12"
				in:fade={{ delay: 2000, duration: 1000 }}
			>
				<div class="mx-auto max-w-4xl text-center">
					<h2 class="text-3xl font-bold text-white sm:text-4xl">
						Ready to transform your media experience?
					</h2>
					<p class="mx-auto mt-4 max-w-2xl text-xl text-indigo-200">
						Join Suasor today and discover the future of personalized AI-powered recommendations.
					</p>
					<div class="mt-8 flex flex-wrap justify-center gap-4">
						<button onclick={navigateToRegister} class="btn btn-lg btn-primary">
							Create Free Account
						</button>
						<button
							onclick={navigateToLogin}
							class="btn btn-lg bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
						>
							Sign In
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Footer -->
		{#if isVisible}
			<footer class="mt-16 py-8 text-center" in:fade={{ delay: 2500, duration: 800 }}>
				<div
					class="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-4 text-sm text-gray-500"
				>
					<span>© {new Date().getFullYear()} Suasor</span>
					<span>•</span>
					<a href="#" class="hover:text-gray-300">Privacy Policy</a>
					<span>•</span>
					<a href="#" class="hover:text-gray-300">Terms of Service</a>
					<span>•</span>
					<a href="#" class="hover:text-gray-300">Contact</a>
				</div>
			</footer>
		{/if}
	</div>
</div>
