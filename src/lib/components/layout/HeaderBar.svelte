<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import { Menu, ArrowLeft, Paperclip, Calendar, CircleUser } from '@lucide/svelte';
</script>

<AppBar
	background="bg-surface-100-900/30"
	headlineClasses=" sm:hidden"
	centerClasses="hidden   sm:block"
>
	{#snippet lead()}
		<ArrowLeft size={24} />
	{/snippet}
	{#snippet trail()}
		<div class="hidden space-x-4 sm:flex">
			<Paperclip size={20} />
			<Calendar size={20} />
			<CircleUser size={20} />
		</div>
		<div class="block sm:hidden">
			<Menu size={20} />
		</div>
	{/snippet}
	{#snippet headline()}
		<h2 class="h2">Movie Recommendations</h2>
	{/snippet}
	<span>Movie Recommendations</span>
</AppBar>
