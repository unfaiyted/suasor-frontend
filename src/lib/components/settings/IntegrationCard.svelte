<script lang="ts">
	export let title;
	export let integration;
	export let urlPlaceholder;
	export let keyType = 'apiKey';
	export let keyLabel = 'API Key';
</script>

<div class="card preset-outlined-surface-500 p-4">
	<h4 class="mb-2 text-lg font-bold">{title}</h4>
	<div class="space-y-3">
		<label class="flex items-center gap-2">
			<input type="checkbox" bind:checked={integration.enabled} class="checkbox" />
			<span>Enable {title} Integration</span>
		</label>

		{#if integration.enabled}
			<label class="label">
				<span class="label-text">Server URL</span>
				<input
					type="url"
					class="input !bg-surface-200-800"
					placeholder={urlPlaceholder}
					bind:value={integration.url}
				/>
			</label>

			<label class="label">
				<span class="label-text">{keyLabel}</span>
				<input
					type="password"
					class="input !bg-surface-200-800"
					placeholder="••••••••"
					bind:value={integration[keyType]}
				/>
			</label>
		{/if}
	</div>
</div>
