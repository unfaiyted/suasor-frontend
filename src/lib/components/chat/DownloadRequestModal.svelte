<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { X, Download, Check, AlertTriangle, Search } from '@lucide/svelte';
	import Portal from '../portal/Portal.svelte';
	import type { Movie } from './types';
	import { automationClients } from '$lib/stores/api';
	import { TypesClientType } from '$lib/api/suasor.v1.d';
	import { GET } from '$lib/api/client';

	interface DownloadRequestModalProps {
		show: boolean;
		selectedMovies: Movie[];
	}

	let { show = false, selectedMovies = [] }: DownloadRequestModalProps = $props();

	// State management with Svelte 5 syntax
	let selectedClientId = $state<number | null>(null);
	let qualityProfileId = $state<number | null>(null);
	let metadataProfileId = $state<number | null>(null);
	let searchAfterAdd = $state(true);
	let errorMessage = $state('');
	let successMessage = $state('');
	let isSubmitting = $state(false);
	let qualityProfiles = $state<{ id: number; name: string }[]>([]);
	let metadataProfiles = $state<{ id: number; name: string }[]>([]);
	let loadingProfiles = $state(false);

	// Create event dispatcher
	const dispatch = createEventDispatcher();

	// Reset form fields
	function resetForm() {
		selectedClientId = null;
		qualityProfileId = null;
		metadataProfileId = null;
		searchAfterAdd = true;
		errorMessage = '';
		successMessage = '';
		isSubmitting = false;
		qualityProfiles = [];
		metadataProfiles = [];
	}

	// Close the modal
	function closeModal() {
		resetForm();
		dispatch('close');
	}

	// Handle click outside modal to close
	function handleOutsideClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target.classList.contains('modal-backdrop')) {
			closeModal();
		}
	}

	// Filter automation clients to only show Radarr instances
	let availableClients = $derived(
		[...$automationClients].filter(
			(client) => client.isEnabled && client.clientType === TypesClientType.ClientTypeRadarr
		)
	);

	// Load profiles when client is selected
	async function handleClientChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		selectedClientId = parseInt(select.value);

		if (selectedClientId) {
			await loadProfiles(selectedClientId);
		} else {
			qualityProfiles = [];
			metadataProfiles = [];
		}
	}

	// Load quality and metadata profiles from the selected Radarr instance
	async function loadProfiles(clientId: number) {
		loadingProfiles = true;
		errorMessage = '';

		try {
			// Load quality profiles
			const qualityResponse = await GET(`/api/client/${clientId}/radarr/profiles/quality`);
			if (qualityResponse.data?.data) {
				qualityProfiles = qualityResponse.data.data;
				if (qualityProfiles.length > 0) {
					qualityProfileId = qualityProfiles[0].id;
				}
			}

			// Load metadata profiles
			const metadataResponse = await GET(`/api/client/${clientId}/radarr/profiles/metadata`);
			if (metadataResponse.data?.data) {
				metadataProfiles = metadataResponse.data.data;
				if (metadataProfiles.length > 0) {
					metadataProfileId = metadataProfiles[0].id;
				}
			}
		} catch (err) {
			errorMessage = `Error loading profiles: ${err instanceof Error ? err.message : 'Unknown error'}`;
		} finally {
			loadingProfiles = false;
		}
	}

	// Count how many movies are already in library
	let inLibraryCount = $derived(selectedMovies.filter((movie) => movie.inLibrary).length);

	// Request the download
	async function requestDownload() {
		// Validate form
		if (!selectedClientId) {
			errorMessage = 'Please select a download client';
			return;
		}

		if (qualityProfiles.length > 0 && !qualityProfileId) {
			errorMessage = 'Please select a quality profile';
			return;
		}

		isSubmitting = true;
		errorMessage = '';

		try {
			// Create download request payload
			const downloadPayload = {
				clientId: selectedClientId,
				movies: selectedMovies.map((movie) => ({
					id: movie.id,
					tmdbId: movie.tmdbId || movie.id,
					title: movie.title
				})),
				qualityProfileId,
				metadataProfileId,
				searchAfterAdd
			};

			// Make API call to request download
			const response = await GET(`/api/client/${selectedClientId}/radarr/download`, {
				body: downloadPayload
			});

			// Show success message
			successMessage = `Successfully requested download for ${selectedMovies.length} movies`;

			// Emit event with the download data
			dispatch('downloadRequested', downloadPayload);

			// Close modal after delay
			setTimeout(() => {
				closeModal();
			}, 1500);
		} catch (error) {
			errorMessage = `Error requesting download: ${error instanceof Error ? error.message : 'Unknown error'}`;
		} finally {
			isSubmitting = false;
		}
	}

	// Keyboard handling
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeModal();
		}
	}

	// Setup and cleanup event listeners
	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeydown);
	});
</script>

{#if show}
	<Portal>
		<div
			class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
			transition:fade={{ duration: 200 }}
			onclick={handleOutsideClick}
			role="dialog"
			aria-modal="true"
			aria-labelledby="download-request-title"
		>
			<div
				class="bg-surface-100-900 relative flex h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl shadow-xl"
				transition:fly={{ y: 20, duration: 300 }}
				onclick={() => {}}
			>
				<!-- Header -->
				<div class="border-surface-200-800 flex items-center justify-between border-b p-4">
					<h2 id="download-request-title" class="text-lg font-semibold">Request Downloads</h2>
					<button
						class="hover:bg-surface-200-800 rounded-full p-1.5 transition-colors"
						onclick={closeModal}
						aria-label="Close modal"
					>
						<X size={20} />
					</button>
				</div>

				<!-- Form - scrollable content area -->
				<div class="flex-1 overflow-y-auto p-5">
					{#if errorMessage}
						<div class="mb-4 rounded bg-red-500/10 p-3 text-red-500">
							{errorMessage}
						</div>
					{/if}

					{#if successMessage}
						<div class="mb-4 rounded bg-green-500/10 p-3 text-green-500">
							{successMessage}
						</div>
					{/if}

					<!-- Media client selection -->
					<div class="mb-4">
						<label for="download-client" class="mb-1 block text-sm font-medium"
							>Download Client</label
						>
						<select
							id="download-client"
							class="select w-full"
							onchange={handleClientChange}
							disabled={isSubmitting}
							required
						>
							<option value="">Select a download client</option>
							{#each availableClients as client (client.id)}
								<option value={client.id}>{client.name}</option>
							{/each}
						</select>
						{#if availableClients.length === 0}
							<p class="mt-2 text-sm text-amber-500">
								<AlertTriangle size={14} class="mr-1 inline" />
								No Radarr clients configured. Please add a Radarr client in Settings.
							</p>
						{/if}
					</div>

					<!-- Quality Profile selection -->
					{#if selectedClientId}
						<div class="mb-4">
							<label for="quality-profile" class="mb-1 block text-sm font-medium"
								>Quality Profile</label
							>
							<select
								id="quality-profile"
								class="select w-full"
								bind:value={qualityProfileId}
								disabled={isSubmitting || loadingProfiles}
								required={qualityProfiles.length > 0}
							>
								{#if loadingProfiles}
									<option value="">Loading profiles...</option>
								{:else if qualityProfiles.length === 0}
									<option value="">No quality profiles available</option>
								{:else}
									{#each qualityProfiles as profile (profile.id)}
										<option value={profile.id}>{profile.name}</option>
									{/each}
								{/if}
							</select>
						</div>

						<!-- Metadata Profile selection if available -->
						{#if metadataProfiles.length > 0}
							<div class="mb-4">
								<label for="metadata-profile" class="mb-1 block text-sm font-medium"
									>Metadata Profile</label
								>
								<select
									id="metadata-profile"
									class="select w-full"
									bind:value={metadataProfileId}
									disabled={isSubmitting || loadingProfiles}
								>
									{#if loadingProfiles}
										<option value="">Loading profiles...</option>
									{:else}
										{#each metadataProfiles as profile (profile.id)}
											<option value={profile.id}>{profile.name}</option>
										{/each}
									{/if}
								</select>
							</div>
						{/if}

						<!-- Search After Add option -->
						<div class="mb-4">
							<label class="flex items-center gap-2">
								<input
									type="checkbox"
									bind:checked={searchAfterAdd}
									disabled={isSubmitting}
									class="checkbox"
								/>
								<span class="text-sm">Search for movie after adding to Radarr</span>
							</label>
						</div>
					{/if}

					<!-- Movies list -->
					{#if selectedMovies.length > 0}
						<div class="mb-4">
							<div class="mb-2">
								<div class="flex items-center justify-between">
									<label class="text-sm font-medium"
										>Selected Movies ({selectedMovies.length})</label
									>
									{#if inLibraryCount > 0}
										<span class="text-xs text-amber-500">
											<AlertTriangle size={14} class="mr-1 inline" />
											{inLibraryCount}
											{inLibraryCount === 1 ? 'movie is' : 'movies are'} already in your library
										</span>
									{/if}
								</div>
							</div>
							<div class="border-surface-200-800 max-h-72 overflow-y-auto rounded border">
								{#each selectedMovies as movie (movie.id)}
									<div
										class="hover:bg-surface-300-800 flex items-center gap-2 p-2 transition-colors"
										animate:flip={{ duration: 300 }}
									>
										<img
											src={movie.poster ||
												movie.details?.artwork?.poster ||
												`https://via.placeholder.com/45x68?text=${encodeURIComponent(movie.title || 'Movie')}`}
											alt={movie.title}
											class="h-12 w-8 rounded object-cover"
										/>
										<div class="min-w-0 flex-1">
											<div class="truncate text-sm font-medium">{movie.title}</div>
											<div class="text-xs opacity-70">{movie.year || 'N/A'}</div>
										</div>
										{#if movie.inLibrary}
											<div class="text-green-500">
												<Check size={16} />
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Spacer to ensure content doesn't get hidden behind fixed footer -->
				</div>

				<!-- Fixed footer with action button -->
				<div class="border-surface-200-800 bg-surface-100-900 flex-shrink-0 border-t p-4 shadow-lg">
					<div class="flex justify-end">
						<button
							class="btn preset-filled-primary-500 flex items-center gap-2 px-4 py-2"
							onclick={requestDownload}
							disabled={isSubmitting || !selectedClientId || availableClients.length === 0}
							type="button"
						>
							{#if isSubmitting}
								<div class="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
								<span>Requesting...</span>
							{:else}
								<Download size={18} />
								<span>Request Download{selectedMovies.length > 1 ? 's' : ''}</span>
							{/if}
						</button>
					</div>
				</div>
			</div>
		</div>
	</Portal>
{/if}

<style>
	.modal-backdrop {
		backdrop-filter: blur(2px);
		-webkit-backdrop-filter: blur(2px);
	}
</style>
