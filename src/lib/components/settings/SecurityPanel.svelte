<script lang="ts">
	import CardHeader from '../util/CardHeader.svelte';
	import SaveButton from '../util/SaveButton.svelte';

	export let saveSettings;
	export let isLoading;

	// Security settings
	let securitySettings = {
		sessionTimeout: 120, // minutes
		maxLoginAttempts: 5,
		passwordPolicy: {
			minLength: 8,
			requireUppercase: true,
			requireNumbers: true,
			requireSpecialChars: true
		},
		twoFactorAuth: {
			enabled: false,
			required: false
		},
		ipRestriction: {
			enabled: false,
			allowedIPs: ''
		}
	};
</script>

<CardHeader title="Security Settings" subtitle="Configure security options (admin only)" />

<div class="card-body py-4">
	<form on:submit|preventDefault={() => saveSettings('security')} class="space-y-4">
		<!-- Session Settings -->
		<div class="card preset-outlined-surface-500 mb-4 p-4">
			<h4 class="mb-2 text-lg font-bold">Session Management</h4>
			<div class="space-y-3">
				<label class="label">
					<span class="label-text">Session Timeout (minutes)</span>
					<input
						type="number"
						class="input !bg-surface-200-800"
						bind:value={securitySettings.sessionTimeout}
						min="5"
						max="1440"
					/>
				</label>
			</div>
		</div>

		<!-- Login Security -->
		<div class="card preset-outlined-surface-500 mb-4 p-4">
			<h4 class="mb-2 text-lg font-bold">Login Security</h4>
			<div class="space-y-3">
				<label class="label">
					<span class="label-text">Max Failed Login Attempts</span>
					<input
						type="number"
						class="input !bg-surface-200-800"
						bind:value={securitySettings.maxLoginAttempts}
						min="1"
						max="20"
					/>
				</label>
			</div>
		</div>

		<!-- Password Policy -->
		<div class="card preset-outlined-surface-500 mb-4 p-4">
			<h4 class="mb-2 text-lg font-bold">Password Policy</h4>
			<div class="space-y-3">
				<label class="label">
					<span class="label-text">Minimum Password Length</span>
					<input
						type="number"
						class="input !bg-surface-200-800"
						bind:value={securitySettings.passwordPolicy.minLength}
						min="6"
						max="32"
					/>
				</label>

				<label class="flex items-center gap-2">
					<input
						type="checkbox"
						bind:checked={securitySettings.passwordPolicy.requireUppercase}
						class="checkbox"
					/>
					<span>Require Uppercase Letters</span>
				</label>

				<label class="flex items-center gap-2">
					<input
						type="checkbox"
						bind:checked={securitySettings.passwordPolicy.requireNumbers}
						class="checkbox"
					/>
					<span>Require Numbers</span>
				</label>

				<label class="flex items-center gap-2">
					<input
						type="checkbox"
						bind:checked={securitySettings.passwordPolicy.requireSpecialChars}
						class="checkbox"
					/>
					<span>Require Special Characters</span>
				</label>
			</div>
		</div>

		<!-- Two-Factor Authentication -->
		<div class="card preset-outlined-surface-500 mb-4 p-4">
			<h4 class="mb-2 text-lg font-bold">Two-Factor Authentication</h4>
			<div class="space-y-3">
				<label class="flex items-center gap-2">
					<input
						type="checkbox"
						bind:checked={securitySettings.twoFactorAuth.enabled}
						class="checkbox"
					/>
					<span>Enable Two-Factor Authentication</span>
				</label>

				{#if securitySettings.twoFactorAuth.enabled}
					<label class="flex items-center gap-2">
						<input
							type="checkbox"
							bind:checked={securitySettings.twoFactorAuth.required}
							class="checkbox"
						/>
						<span>Require for All Users</span>
					</label>
				{/if}
			</div>
		</div>

		<!-- IP Restrictions -->
		<div class="card preset-outlined-surface-500 mb-4 p-4">
			<h4 class="mb-2 text-lg font-bold">IP Restrictions</h4>
			<div class="space-y-3">
				<label class="flex items-center gap-2">
					<input
						type="checkbox"
						bind:checked={securitySettings.ipRestriction.enabled}
						class="checkbox"
					/>
					<span>Enable IP Restrictions</span>
				</label>

				{#if securitySettings.ipRestriction.enabled}
					<label class="label">
						<span class="label-text">Allowed IP Addresses</span>
						<textarea
							class="textarea !bg-surface-200-800"
							bind:value={securitySettings.ipRestriction.allowedIPs}
							placeholder="192.168.1.1, 10.0.0.0/24"
							rows="3"
						></textarea>
					</label>
					<p class="text-xs opacity-70">
						Enter IP addresses or CIDR notation, comma-separated. Leave empty to allow all.
					</p>
				{/if}
			</div>
		</div>

		<SaveButton {isLoading} />
	</form>
</div>
