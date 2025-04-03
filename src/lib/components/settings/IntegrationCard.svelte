<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { clientsApi } from '$lib/stores/api';
	import { TypesClientType, TypesMediaClientType } from '$lib/api/suasor.v1.d';
	
	export let title: string;
	export let integration: any;
	export let urlPlaceholder: string;
	export let keyType = 'apiKey';
	export let keyLabel = 'API Key';
	export let clientType: TypesClientType | TypesMediaClientType;
	
	const dispatch = createEventDispatcher();
	
	let errors = {
		url: '',
		[keyType]: ''
	};
	
	function validateIntegration() {
		errors = {
			url: '',
			[keyType]: ''
		};
		
		let isValid = true;
		
		// Basic validation
		if (!integration.url) {
			errors.url = 'URL is required';
			isValid = false;
		} else {
			try {
				// Check if it's a valid URL
				new URL(integration.url);
			} catch (e) {
				errors.url = 'Please enter a valid URL';
				isValid = false;
			}
		}
		
		// API key validation (if type requires it)
		if (keyType !== 'none' && !integration[keyType]) {
			errors[keyType] = `${keyLabel} is required`;
			isValid = false;
		}
		
		return isValid;
	}
	
	async function saveClient() {
		if (!integration.enabled) return;
		
		if (!validateIntegration()) {
			// Invalid form - don't save
			dispatch('error', { message: 'Please fix validation errors before saving' });
			return;
		}
		
		try {
			// Save client to the API and store based on client type
			// Different client types have different required fields
			const clientTypeStr = clientType.toString().toLowerCase();
			
			const result = await clientsApi.createClient(
				title,
				clientType,
				integration.url,
				keyType === 'apiKey' ? integration.apiKey : undefined,
				keyType === 'username' ? integration.username : undefined,
				keyType === 'password' ? integration.password : undefined,
				keyType === 'token' ? integration.token : undefined
			);
			
			if (result) {
				dispatch('saved', { client: result });
			} else {
				dispatch('error', { message: 'Failed to save client configuration' });
			}
		} catch (err) {
			dispatch('error', { message: err.message || 'An error occurred while saving the client' });
		}
	}
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
					on:blur={() => validateIntegration()}
				/>
				{#if errors.url}
					<span class="text-xs text-error-500">{errors.url}</span>
				{/if}
			</label>

			{#if keyType !== 'none'}
				<label class="label">
					<span class="label-text">{keyLabel}</span>
					<input
						type="password"
						class="input !bg-surface-200-800"
						placeholder="••••••••"
						bind:value={integration[keyType]}
						on:blur={() => validateIntegration()}
					/>
					{#if errors[keyType]}
						<span class="text-xs text-error-500">{errors[keyType]}</span>
					{/if}
				</label>
			{/if}
			
			<button 
				class="btn btn-sm btn-primary mt-2"
				on:click={saveClient}
				disabled={!integration.enabled}
			>
				Save {title} Integration
			</button>
		{/if}
	</div>
</div>