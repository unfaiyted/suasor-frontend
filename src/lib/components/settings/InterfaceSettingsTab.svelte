<script lang="ts">
	import { Settings, Moon, Sun, Languages, Bell, Bot } from '@lucide/svelte';
	import { ModelsUserConfigAiChatPersonality, ModelsUserConfigTheme } from '$lib/api/suasor.v1.d';

	interface InterfaceSettingsTabProps {
		theme: ModelsUserConfigTheme;
		language: string;
		notifications: boolean;
		aiPersonality: ModelsUserConfigAiChatPersonality;
		setTheme: (theme: ModelsUserConfigTheme) => void;
		setLanguage: (language: string) => void;
		setNotifications: (notifications: boolean) => void;
		setAiPersonality: (aiPersonality: ModelsUserConfigAiChatPersonality) => void;
	}

	// Props - use individual props and update functions
	let {
		theme = $bindable(ModelsUserConfigTheme.system),
		language = $bindable('en'),
		notifications = $bindable(true),
		aiPersonality = $bindable(ModelsUserConfigAiChatPersonality.friendly),
		setTheme,
		setNotifications,
		setAiPersonality
	}: InterfaceSettingsTabProps = $props();

	// AI personality options
	const personalityOptions = [
		{
			id: ModelsUserConfigAiChatPersonality.friendly,
			label: 'Friendly',
			description: 'Casual and approachable style',
			icon: Bot,
			color: 'blue'
		},
		{
			id: ModelsUserConfigAiChatPersonality.analytical,
			label: 'Professional',
			description: 'Formal and concise responses',
			icon: Bot,
			color: 'green'
		},
		{
			id: ModelsUserConfigAiChatPersonality.enthusiastic,
			label: 'Enthusiastic',
			description: 'Energetic and passionate style',
			icon: Bot,
			color: 'purple'
		}
	];

	// // Notification toggle handler
	// function toggleNotifications(checked: boolean) {
	// 	notifications = checked;
	// }
	//
	// // Personality selection handler
	// function selectPersonality(id: ModelsUserConfigAiChatPersonality) {
	// 	aiPersonality = id;
	// }
</script>

<div class="space-y-6">
	<header class="mb-4 flex items-center gap-3">
		<div class="bg-primary-500 flex h-10 w-10 items-center justify-center rounded-full">
			<Settings size={20} class="text-white" />
		</div>
		<h3 class="text-lg font-medium">Interface Settings</h3>
	</header>

	<!-- Theme Preference -->
	<div class="form-control">
		<label class="label" for="theme-preference">
			<span class="label-text font-medium">Theme Preference</span>
		</label>
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
			<button
				type="button"
				class="flex items-center gap-3 rounded-lg border p-4 transition-colors"
				class:bg-primary-500={theme === 'light'}
				class:bg-opacity-10={theme === 'light'}
				class:border-primary-500={theme === 'light'}
				class:border-surface-300-600={theme !== 'light'}
				onclick={() => setTheme(ModelsUserConfigTheme.light)}
			>
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500">
					<Sun size={18} class="text-white" />
				</div>
				<span class="font-medium">Light</span>
			</button>

			<button
				type="button"
				class="flex items-center gap-3 rounded-lg border p-4 transition-colors"
				class:bg-primary-500={theme === 'dark'}
				class:bg-opacity-10={theme === 'dark'}
				class:border-primary-500={theme === 'dark'}
				class:border-surface-300-600={theme !== 'dark'}
				onclick={() => setTheme(ModelsUserConfigTheme.dark)}
			>
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500">
					<Moon size={18} class="text-white" />
				</div>
				<span class="font-medium">Dark</span>
			</button>

			<button
				type="button"
				class="flex items-center gap-3 rounded-lg border p-4 transition-colors"
				class:bg-primary-500={theme === 'system'}
				class:bg-opacity-10={theme === 'system'}
				class:border-primary-500={theme === 'system'}
				class:border-surface-300-600={theme !== 'system'}
				onclick={() => setTheme(ModelsUserConfigTheme.system)}
			>
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-500">
					<Settings size={18} class="text-white" />
				</div>
				<span class="font-medium">System</span>
			</button>
		</div>
		<p class="text-surface-900-50 mt-2 text-xs">Choose how Suasor appears on your device</p>
	</div>

	<!-- Language -->
	<div class="form-control">
		<label class="label" for="language">
			<span class="label-text font-medium">Language</span>
		</label>
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500">
				<Languages size={18} class="text-white" />
			</div>
			<div class="flex-1">
				<select class="select bg-surface-200-800/50 w-full" bind:value={language}>
					<option value="en">English</option>
					<option value="es">Spanish</option>
					<option value="fr">French</option>
					<option value="de">German</option>
				</select>
				<p class="text-surface-900-50 mt-1 text-xs">
					Select your preferred language for the interface
				</p>
			</div>
		</div>
	</div>

	<!-- Notifications -->
	<div class="form-control">
		<label class="label" for="notifications">
			<span class="label-text font-medium">Notifications</span>
		</label>
		<div class="flex items-center gap-3">
			<div class="bg-primary-500 flex h-10 w-10 items-center justify-center rounded-full">
				<Bell size={18} class="text-white" />
			</div>
			<div class="flex flex-1 items-center justify-between">
				<div>
					<span class="font-medium">Enable Notifications</span>
					<p class="text-surface-900-50 text-sm">
						Get notified about new recommendations and updates
					</p>
				</div>
				<input
					type="checkbox"
					checked={notifications}
					onchange={() => setNotifications(notifications)}
					class="toggle"
				/>
			</div>
		</div>
	</div>

	<!-- AI Personality -->
	<div class="form-control">
		<label class="label" for="ai-personality">
			<span class="label-text font-medium">AI Personality</span>
		</label>
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
			{#each personalityOptions as option}
				<button
					type="button"
					class="flex flex-col items-center rounded-lg border border-transparent p-4 transition-colors"
					class:bg-primary-500={aiPersonality === option.id}
					class:bg-opacity-10={aiPersonality === option.id}
					class:border-primary-500={aiPersonality === option.id}
					onclick={() => setAiPersonality(option.id)}
				>
					{#if option.color === 'blue'}
						<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
							<Bot size={22} class="text-white" />
						</div>
					{:else if option.color === 'green'}
						<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
							<Bot size={22} class="text-white" />
						</div>
					{:else if option.color === 'purple'}
						<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500">
							<Bot size={22} class="text-white" />
						</div>
					{/if}
					<span class="font-medium">{option.label}</span>
					<p class="text-surface-900-50 mt-1 text-center text-xs">{option.description}</p>
				</button>
			{/each}
		</div>
	</div>
</div>
