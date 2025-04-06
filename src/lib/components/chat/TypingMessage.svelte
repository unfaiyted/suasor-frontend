<script lang="ts">
	import { fade } from 'svelte/transition';
	import TypingIndicator from './TypingIndicator.svelte';
</script>

<div class="grid grid-cols-[auto_1fr] gap-2" in:fade={{ duration: 200 }}>
	<div
		class="avatar bg-surface-300-600-token flex h-16 w-16 items-center justify-center overflow-hidden rounded-full"
	>
		<img src={`https://i.pravatar.cc/?img=14`} alt="AI" class="h-full w-full object-cover" />
	</div>

	<div class="card preset-tonal space-y-2 rounded-tl-none p-4">
		<header class="flex items-center justify-between">
			<p class="font-bold">MovieAI</p>
			<small class="opacity-50"
				>{new Date().toLocaleString('en-US', {
					hour: 'numeric',
					minute: 'numeric',
					hour12: true
				})}</small
			>
		</header>

		<div class="flex min-h-8 items-center">
			<TypingIndicator showIndicator={true} />
		</div>
	</div>
</div>
