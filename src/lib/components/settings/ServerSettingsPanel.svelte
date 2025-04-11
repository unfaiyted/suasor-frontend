<script lang="ts">
	import CardHeader from '../util/CardHeader.svelte';
	import SaveButton from '../util/SaveButton.svelte';

	const { serverSettings, onSave, isLoading = false } = $props();
</script>

<CardHeader title="Server Settings" subtitle="Configure server behavior (admin only)" />

<div class="card-body py-4">
	<form onsubmit={() => onSave(serverSettings)} class="space-y-4">
		<!-- Concurrent Jobs -->
		<div class="form-control">
			<label class="label">
				<span class="label-text">Maximum Concurrent Jobs</span>
				<input
					type="number"
					class="input !bg-surface-200-800"
					bind:value={serverSettings.maxConcurrentJobs}
					min="1"
					max="20"
				/>
			</label>
		</div>

		<!-- Backup Settings -->
		<div class="form-control">
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={serverSettings.backupEnabled} class="checkbox" />
				<span>Enable Automatic Backups</span>
			</label>
		</div>

		<!-- Backup Frequency -->
		{#if serverSettings.backupEnabled}
			<div class="form-control">
				<label class="label">
					<span class="label-text">Backup Frequency</span>
					<select class="select !bg-surface-200-800" bind:value={serverSettings.backupFrequency}>
						<option value="hourly">Hourly</option>
						<option value="daily">Daily</option>
						<option value="weekly">Weekly</option>
						<option value="monthly">Monthly</option>
					</select>
				</label>
			</div>
		{/if}

		<!-- Log Level -->
		<div class="form-control">
			<label class="label">
				<span class="label-text">Log Level</span>
				<select class="select !bg-surface-200-800" bind:value={serverSettings.logLevel}>
					<option value="debug">Debug</option>
					<option value="info">Info</option>
					<option value="warn">Warning</option>
					<option value="error">Error</option>
				</select>
			</label>
		</div>

		<SaveButton {isLoading} />
	</form>
</div>
