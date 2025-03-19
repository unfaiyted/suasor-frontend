<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Avatar } from '@skeletonlabs/skeleton-svelte';
	import type { Message, Movie } from './types';
	import MovieThumbnail from './MovieThumbnail.svelte';

	export let message: Message;
	export let selectedMovies: Movie[] = [];

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function toggleMovieSelection(movie: Movie) {
		dispatch('toggleSelection', movie);
	}

	function isMovieSelected(id: string) {
		return selectedMovies.some((m) => m.id === id);
	}
</script>

<div
	class="grid gap-2"
	class:grid-cols-[auto_1fr]={message.sender === 'ai'}
	class:grid-cols-[1fr_auto]={message.sender === 'user'}
	in:fade={{ duration: 200 }}
>
	{#if message.sender === 'ai'}
		<Avatar
			src={`https://i.pravatar.cc/?img=${message.avatar}`}
			name={message.name}
			classes="w-16"
		/>
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
			<p>{message.content.text}</p>
		{/if}

		{#if message.content.type === 'movieList' && message.content.movies}
			{#if message.content.text}
				<p>{message.content.text}</p>
			{/if}
			<div class="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
				{#each message.content.movies as movie}
					<MovieThumbnail
						{movie}
						selected={isMovieSelected(movie.id)}
						on:toggleSelection={() => toggleMovieSelection(movie)}
					/>
				{/each}
			</div>
		{/if}
	</div>

	{#if message.sender === 'user'}
		<Avatar
			src={`https://i.pravatar.cc/?img=${message.avatar}`}
			name={message.name}
			classes="w-16"
		/>
	{/if}
</div>
