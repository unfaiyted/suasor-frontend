<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';

	interface IntegrationCardProps {
		name: string;
		status: string;
		type: 'mediaServer' | 'aiModel' | 'automationTool';
		extraInfo?: any; // This could be lastSync, usageCount, or pendingTasks
	}

	const { name, status, type, extraInfo = null }: IntegrationCardProps = $props();

	let isTesting = $state(false);
	let testResult = $state<'success' | 'error' | null>(null);
	let testMessage = $state('');
	let showDetails = $state(false);

	// Helper function to determine status color
	function getStatusColor(status: string) {
		const statusMap = {
			connected: 'text-green-500',
			disconnected: 'text-red-500',
			active: 'text-green-500',
			inactive: 'text-gray-500'
		};
		return statusMap[status as keyof typeof statusMap] || 'text-gray-500';
	}

	// Format the last sync date
	function formatLastSync(dateString: string | null) {
		if (!dateString) return 'Never';
		const date = new Date(dateString);
		return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
	}

	// Test the integration connection
	async function testConnection() {
		isTesting = true;
		testResult = null;
		testMessage = '';

		try {
			// Simulate API call with timeout
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// For demo purposes, we'll randomly succeed or fail
			const success = Math.random() > 0.3;

			if (success) {
				testResult = 'success';
				testMessage = `Successfully connected to ${name}!`;
			} else {
				testResult = 'error';
				testMessage = `Failed to connect to ${name}. Please check your configuration.`;

				// Add specific error messages for different types of errors
				if (type === 'mediaServer') {
					testMessage += ' Connection refused.';
				} else if (type === 'aiModel') {
					testMessage += ' API key may be invalid.';
				} else {
					testMessage += ' Service may be down.';
				}
			}
		} catch (error) {
			testResult = 'error';
			testMessage = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
		} finally {
			isTesting = false;

			// Auto-hide success message after 3 seconds
			if (testResult === 'success') {
				setTimeout(() => {
					if (testResult === 'success') {
						testResult = null;
						testMessage = '';
					}
				}, 3000);
			}
		}
	}

	// Function to toggle details
	function toggleDetails() {
		showDetails = !showDetails;
	}

	// Function to handle test button click
	function handleTestClick(e: Event) {
		e.stopPropagation();
		testConnection();
	}

	import { goto } from '$app/navigation';

	// Function to handle configure button click - redirect to settings with appropriate tab
	function handleConfigureClick(e: Event) {
		e.stopPropagation();

		// Determine which settings subtab to navigate to based on integration type
		let subtabPath = 'media';

		if (type === 'mediaServer') {
			subtabPath = 'media';
		} else if (type === 'automationTool') {
			subtabPath = 'automation';
		} else if (type === 'aiModel') {
			subtabPath = 'ai';
		}

		// Navigate to the correct settings page with specific subtab
		goto(`/settings/integrations/${subtabPath}`);
	}

	// Function to trigger sync for media servers
	async function triggerSync(e: Event) {
		e.stopPropagation();

		try {
			// This would be an actual API call in production
			// Example: await fetch('/api/integration/sync', { method: 'POST', body: JSON.stringify({ name }) });
			console.log(`Triggering sync for ${name}`);

			// Show a temporary success message (in production, you'd want to update the lastSync time)
			testResult = 'success';
			testMessage = `Sync started for ${name}`;

			// Hide message after 3 seconds
			setTimeout(() => {
				if (testResult === 'success') {
					testResult = null;
					testMessage = '';
				}
			}, 3000);
		} catch (error) {
			testResult = 'error';
			testMessage = `Failed to start sync: ${error instanceof Error ? error.message : 'Unknown error'}`;
		}
	}
</script>

<div
	class="border-surface-200-800 mb-2 overflow-hidden rounded-lg border transition-all hover:shadow-md {showDetails
		? 'pb-2'
		: ''}"
>
	<div
		class="hover:bg-surface-200-800 flex cursor-pointer items-center justify-between p-3 transition-colors"
		onclick={toggleDetails}
	>
		<div class="flex items-center gap-2">
			<img src={`/${name.toLowerCase()}.svg`} alt={name} class="h-6 w-6" />
			<!-- onerror={() => (this.style.display = 'none')} -->
			<span class="font-medium">{name}</span>
		</div>

		<div class="flex items-center gap-2">
			<span class={`${getStatusColor(status)} text-sm font-medium`}>
				{status}
			</span>

			{#if type === 'automationTool' && extraInfo > 0}
				<span class="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
					{extraInfo}
				</span>
			{/if}

			<button
				class="ml-2 flex items-center justify-center"
				onclick={(e) => {
					e.stopPropagation();
					toggleDetails();
				}}
			>
				<ChevronDown
					size={18}
					class="transform transition-transform {showDetails ? 'rotate-180' : ''}"
				/>
			</button>
		</div>
	</div>

	{#if testResult}
		<div
			class="mx-3 my-1 rounded-md p-2 text-sm {testResult === 'success'
				? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
				: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}"
		>
			{testMessage}
		</div>
	{/if}

	{#if showDetails}
		<div class="bg-surface-300-800 mx-3 mt-2 space-y-2 rounded-md p-3 text-sm">
			<!-- Details specific to each integration type -->
			{#if type === 'mediaServer'}
				<div class="flex items-center justify-between">
					<span class="text-surface-700-300">Last Synced:</span>
					<div class="flex items-center gap-2">
						<span>{formatLastSync(extraInfo)}</span>
						<button
							class="text-tertiary-600 hover:text-tertiary-800 hover:bg-tertiary-100 dark:hover:bg-tertiary-900/30 rounded-full p-1 text-xs focus:outline-none"
							onclick={triggerSync}
							title="Sync now"
						>
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
								class="lucide lucide-refresh-cw"
								><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path
									d="M21 3v5h-5"
								/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path
									d="M3 21v-5h5"
								/></svg
							>
						</button>
					</div>
				</div>
				<div class="flex justify-between">
					<span class="text-surface-700-300">Connection URL:</span>
					<span class="text-xs">(http://example.com)</span>
				</div>
			{:else if type === 'aiModel'}
				<div class="flex justify-between">
					<span class="text-surface-700-300">Usage Count:</span>
					<span>{extraInfo}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-surface-700-300">API Status:</span>
					<span class={status === 'active' ? 'text-green-500' : 'text-red-500'}>
						{status === 'active' ? 'Available' : 'Unavailable'}
					</span>
				</div>
			{:else if type === 'automationTool'}
				<div class="flex justify-between">
					<span class="text-surface-700-300">Pending Tasks:</span>
					<span>{extraInfo}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-surface-700-300">API Status:</span>
					<span class={status === 'connected' ? 'text-green-500' : 'text-red-500'}>
						{status === 'connected' ? 'Available' : 'Unavailable'}
					</span>
				</div>
			{/if}

			<div class="flex gap-2 pt-2">
				<button
					class="bg-tertiary-600 hover:bg-tertiary-700 focus:ring-tertiary-300 flex-1 rounded-md py-1 text-xs text-white focus:ring-2 focus:outline-none"
					onclick={handleConfigureClick}
				>
					Configure
				</button>

				<button
					class="text-tertiary-600 hover:bg-tertiary-100 dark:hover:bg-tertiary-900/30 focus:ring-tertiary-300 flex-1 rounded-md border border-transparent py-1 text-xs transition-colors focus:ring-2 focus:outline-none dark:border-transparent"
					onclick={handleTestClick}
					disabled={isTesting}
				>
					{#if isTesting}
						<span
							class="border-tertiary-600 inline-block h-3 w-3 animate-spin rounded-full border-2 border-t-transparent"
						></span>
					{:else}
						Test
					{/if}
				</button>
			</div>
		</div>
	{/if}
</div>
