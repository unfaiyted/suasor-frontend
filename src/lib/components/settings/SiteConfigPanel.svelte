<script lang="ts">
	import CardHeader from '../util/CardHeader.svelte';
	import SaveButton from '../util/SaveButton.svelte';

	export let siteSettings;
	export let saveSettings;
	export let isLoading;
</script>

<CardHeader title="Site Configuration" subtitle="Manage global site settings (admin only)" />

<div class="card-body py-4">
	<form on:submit|preventDefault={() => saveSettings('site')} class="space-y-4">
		<!-- Site Name -->
		<div class="form-control">
			<label class="label">
				<span class="label-text">Site Name</span>
				<input
					type="text"
					class="input !bg-surface-200-800"
					bind:value={siteSettings.siteName}
					placeholder="Site Name"
				/>
			</label>
		</div>

		<!-- Site Description -->
		<div class="form-control">
			<label class="label">
				<span class="label-text">Description</span>
				<textarea
					class="textarea !bg-surface-200-800"
					bind:value={siteSettings.description}
					placeholder="Site Description"
					rows="3"
				></textarea>
			</label>
		</div>

		<!-- Registration Settings -->
		<div class="form-control">
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={siteSettings.allowRegistration} class="checkbox" />
				<span>Allow New User Registration</span>
			</label>
		</div>

		<!-- Email Verification -->
		<div class="form-control">
			<label class="flex items-center gap-2">
				<input
					type="checkbox"
					bind:checked={siteSettings.requireEmailVerification}
					class="checkbox"
				/>
				<span>Require Email Verification</span>
			</label>
		</div>

		<!-- Maintenance Mode -->
		<div class="form-control">
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={siteSettings.maintenanceMode} class="checkbox" />
				<span>Enable Maintenance Mode</span>
			</label>
		</div>

		<SaveButton {isLoading} />
	</form>
</div>
