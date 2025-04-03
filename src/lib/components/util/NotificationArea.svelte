<script lang="ts">
	import { fade } from 'svelte/transition';
	import IconTriangle from '$lib/components/icons/IconTriangle.svelte';

	export let error = '';
	export let success = '';
	export let onErrorDismiss: (() => void) | undefined = undefined;
	export let onSuccessDismiss: (() => void) | undefined = undefined;
</script>

{#if error}
	<div class="alert alert-error mb-4" transition:fade>
		<div
			class="card preset-outlined-error-500 grid grid-cols-1 items-center gap-4 p-4 lg:grid-cols-[auto_1fr_auto]"
		>
			<IconTriangle />
			<div>
				<p class="font-bold">Error</p>
				<p class="text-xs opacity-60">{error}</p>
			</div>
			{#if onErrorDismiss}
				<button class="btn-icon btn-sm" aria-label="Dismiss error" on:click={onErrorDismiss}>
					×
				</button>
			{/if}
		</div>
	</div>
{/if}

{#if success}
	<div class="alert alert-success mb-4" transition:fade>
		<div
			class="card preset-outlined-success-500 grid grid-cols-1 items-center gap-4 p-4 lg:grid-cols-[auto_1fr_auto]"
		>
			<div>
				<p class="font-bold">Success</p>
				<p class="text-xs opacity-60">{success}</p>
			</div>
			{#if onSuccessDismiss}
				<button
					class="btn-icon btn-sm"
					aria-label="Dismiss success message"
					on:click={onSuccessDismiss}
				>
					×
				</button>
			{/if}
		</div>
	</div>
{/if}
