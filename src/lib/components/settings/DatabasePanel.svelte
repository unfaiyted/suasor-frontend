<script lang="ts">
	import CardHeader from '../util/CardHeader.svelte';
	import SaveButton from '../util/SaveButton.svelte';

	export let saveSettings;
	export let isLoading;

	// Mock database stats
	let dbStats = {
		size: '1.23 GB',
		tables: 42,
		lastBackup: '2023-10-15 04:30 AM',
		connections: 5
	};

	// For backup creation
	let backupName = '';
	let includeMedia = false;

	// For vacuum operation
	let vacuumOptions = {
		analyze: true,
		full: false
	};

	function createBackup() {
		saveSettings('db-backup');
	}

	function runVacuum() {
		saveSettings('db-vacuum');
	}
</script>

<CardHeader title="Database Management" subtitle="Manage database operations (admin only)" />

<div class="card-body py-4">
	<!-- Database Stats -->
	<div class="card preset-outlined-surface-500 mb-6 p-4">
		<h4 class="mb-2 text-lg font-bold">Database Statistics</h4>
		<div class="grid grid-cols-2 gap-4">
			<div>
				<p class="text-sm opacity-70">Size</p>
				<p class="text-lg font-semibold">{dbStats.size}</p>
			</div>
			<div>
				<p class="text-sm opacity-70">Tables</p>
				<p class="text-lg font-semibold">{dbStats.tables}</p>
			</div>
			<div>
				<p class="text-sm opacity-70">Last Backup</p>
				<p class="text-lg font-semibold">{dbStats.lastBackup}</p>
			</div>
			<div>
				<p class="text-sm opacity-70">Active Connections</p>
				<p class="text-lg font-semibold">{dbStats.connections}</p>
			</div>
		</div>
	</div>

	<!-- Backup Section -->
	<form on:submit|preventDefault={createBackup} class="card preset-outlined-surface-500 mb-6 p-4">
		<h4 class="mb-2 text-lg font-bold">Create Backup</h4>
		<div class="space-y-3">
			<label class="label">
				<span class="label-text">Backup Name</span>
				<input
					type="text"
					class="input !bg-surface-200-800"
					bind:value={backupName}
					placeholder="my_backup_20231015"
				/>
			</label>

			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={includeMedia} class="checkbox" />
				<span>Include Media Files (may be large)</span>
			</label>

			<button
				type="submit"
				class="btn preset-filled-primary-500 w-full {isLoading ? 'loading' : ''}"
				disabled={isLoading || !backupName}
			>
				{isLoading ? 'Creating Backup...' : 'Create Backup'}
			</button>
		</div>
	</form>

	<!-- Database Maintenance -->
	<form on:submit|preventDefault={runVacuum} class="card preset-outlined-surface-500 mb-6 p-4">
		<h4 class="mb-2 text-lg font-bold">Database Maintenance</h4>
		<div class="space-y-3">
			<p class="mb-2 text-sm opacity-70">
				Vacuum operations clean up database fragmentation and optimize performance.
			</p>

			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={vacuumOptions.analyze} class="checkbox" />
				<span>Analyze Tables</span>
			</label>

			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={vacuumOptions.full} class="checkbox" />
				<span>Full Vacuum (takes longer)</span>
			</label>

			<button
				type="submit"
				class="btn preset-filled-primary-500 w-full {isLoading ? 'loading' : ''}"
				disabled={isLoading}
			>
				{isLoading ? 'Optimizing...' : 'Run Database Optimization'}
			</button>
		</div>
	</form>
</div>
