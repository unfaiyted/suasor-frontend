<script lang="ts">
	import CardHeader from '../util/CardHeader.svelte';
	import SaveButton from '../util/SaveButton.svelte';

	export let userSettings;
	export let saveSettings;
	export let isLoading;
</script>

<CardHeader title="User Settings" subtitle="Manage your personal preferences" />

<div class="card-body py-4">
	<form on:submit|preventDefault={() => saveSettings('user')} class="space-y-4">
		<!-- Theme Preference -->
		<div class="form-control">
			<label class="label">
				<span class="label-text">Theme Preference</span>
				<select class="select !bg-surface-200-800" bind:value={userSettings.theme}>
					<option value="system">System Default</option>
					<option value="light">Light</option>
					<option value="dark">Dark</option>
				</select>
			</label>
		</div>

		<!-- Language -->
		<div class="form-control">
			<label class="label">
				<span class="label-text">Language</span>
				<select class="select !bg-surface-200-800" bind:value={userSettings.language}>
					<option value="en">English</option>
					<option value="es">Spanish</option>
					<option value="fr">French</option>
					<option value="de">German</option>
				</select>
			</label>
		</div>

		<!-- Notifications -->
		<div class="form-control">
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={userSettings.notifications} class="checkbox" />
				<span>Enable Notifications</span>
			</label>
		</div>

		<!-- Content Filter -->
		<div class="form-control">
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={userSettings.showAdultContent} class="checkbox" />
				<span>Show Adult Content</span>
			</label>
		</div>

		<SaveButton {isLoading} />
	</form>
</div>
