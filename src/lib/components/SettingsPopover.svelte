<script lang="ts">
	// Initialize theme on component mount
	import { onMount } from 'svelte';
	import IconSun from './icons/IconSun.svelte';
	import IconMoon from './icons/IconMoon.svelte';
	import IconUp from './icons/IconUp.svelte';

	import { Popover } from '@skeletonlabs/skeleton-svelte';
	import { Switch } from '@skeletonlabs/skeleton-svelte';

	// Props for customization
	let githubUsername = 'unfaiyted'; // Default empty, should be set by parent

	let openState = $state(false); // Using Svelte 5 runes
	let darkMode = $state(false); // Theme state

	// Initialize theme from localStorage or system preference
	function initializeTheme() {
		if (typeof window !== 'undefined') {
			// Check localStorage first
			const storedTheme = localStorage.getItem('theme');
			if (storedTheme) {
				darkMode = storedTheme === 'dark';
			} else {
				// Check system preference
				darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
			}
			applyTheme();
		}
	}

	// Apply theme to document
	function applyTheme() {
		if (typeof document !== 'undefined') {
			if (darkMode) {
				document.documentElement.setAttribute('data-mode', 'dark');
				localStorage.setItem('theme', 'dark');
			} else {
				document.documentElement.setAttribute('data-mode', 'light');
				localStorage.setItem('theme', 'light');
			}
		}
	}

	// Toggle theme function
	function toggleTheme() {
		darkMode = !darkMode;
		applyTheme();
	}

	function popoverClose() {
		openState = false;
	}
	onMount(() => {
		initializeTheme();
	});
</script>

<Popover
	open={openState}
	onOpenChange={(e) => (openState = e.open)}
	positioning={{
		placement: 'bottom',
		strategy: 'fixed',
		// offset: { mainAxis: 3, crossAxis: -50 },
		shift: -90,
		gutter: 5
	}}
	triggerBase="btn preset-tonal p-2"
	contentBase="card bg-surface-200-800 p-4 space-y-4 max-w-[320px]"
	arrow={false}
	arrowBackground="!bg-surface-200 dark:!bg-surface-800"
>
	{#snippet trigger()}<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-5 w-5 sm:h-6 sm:w-6"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
			/>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
			/>
		</svg>{/snippet}
	{#snippet content()}
		<header class="flex justify-between">
			<p class="text-xl font-bold">Settings</p>
			<button class="btn-icon hover:preset-tonal" onclick={popoverClose}><IconUp /></button>
		</header>
		<article class="space-y-4">
			<!-- Theme Toggle -->
			<div
				class="hover:bg-surface-300-600-token rounded-token flex items-center justify-between p-2"
			>
				<span class="flex items-center gap-2 pr-2">
					{#if darkMode}
						<IconMoon />
					{:else}
						<IconSun />
					{/if}
					<span class="w-24">{darkMode ? 'Dark' : 'Light'} Mode</span>
				</span>

				<Switch
					name="mode"
					checked={!darkMode}
					controlInactive="bg-white"
					onCheckedChange={toggleTheme}
				>
					<!-- {#snippet inactiveChild()}<IconMoon />{/snippet} -->
					<!-- {#snippet activeChild()}<IconSun />{/snippet} -->
				</Switch>
			</div>

			<!-- Language Settings -->
			<div
				class="hover:bg-surface-300-600-token rounded-token flex items-center justify-between p-2"
			>
				<span class="flex items-center gap-2">
					<svg
						class="h-5 w-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
						></path>
					</svg>
					<span>Language</span>
				</span>
				<span class="text-sm opacity-70">English</span>
			</div>

			<!-- Help & Support -->

			<a
				href="https://github.com/{githubUsername}"
				target="_blank"
				rel="noopener noreferrer"
				class="hover:bg-surface-200-800 flex w-full items-center gap-2 rounded-lg p-2"
			>
				<svg
					class="h-5 w-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					></path>
				</svg>
				<span>Help & Support</span>
			</a>

			<!-- GitHub Link -->
			{#if githubUsername}
				<a
					href="https://github.com/{githubUsername}"
					target="_blank"
					rel="noopener noreferrer"
					class="hover:bg-surface-200-800 flex items-center gap-2 rounded-lg p-2"
				>
					<svg
						class="h-5 w-5"
						fill="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
						/>
					</svg>
					<span>GitHub Profile</span>
				</a>
			{/if}
		</article>
	{/snippet}
</Popover>

<style>
</style>
