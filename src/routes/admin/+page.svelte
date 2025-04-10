<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authUser } from '$lib/stores/auth';
	import type { UserResponse } from '$lib/api/types';
	import LoadingSpinner from '$lib/components/util/LoadingSpinner.svelte';
	import {
		Users,
		Shield,
		Settings,
		BarChart2,
		Database,
		Server,
		Network,
		Play,
		X
	} from '@lucide/svelte';

	// Admin sections
	const adminSections = [
		{
			id: 'users',
			title: 'User Management',
			icon: Users,
			description: 'Add, edit, and manage user accounts, permissions, and roles',
			link: '/admin/users',
			color: 'bg-primary-500/10 text-primary-500'
		},
		{
			id: 'metrics',
			title: 'System Metrics',
			icon: BarChart2,
			description: 'View system performance, usage statistics, and analytics',
			link: '/settings',
			color: 'bg-success-500/10 text-success-500'
		},
		{
			id: 'security',
			title: 'Security Settings',
			icon: Shield,
			description: 'Configure security policies, access controls, and authentication',
			link: '/settings/security',
			color: 'bg-warning-500/10 text-warning-500'
		},
		{
			id: 'server',
			title: 'Server Management',
			icon: Server,
			description: 'Configure server settings, backups, and maintenance options',
			link: '/settings/server',
			color: 'bg-info-500/10 text-info-500'
		},
		{
			id: 'database',
			title: 'Database Controls',
			icon: Database,
			description: 'Manage database settings, backup and restore options',
			link: '/settings/database',
			color: 'bg-secondary-500/10 text-secondary-500'
		},
		{
			id: 'integrations',
			title: 'System Integrations',
			icon: Network,
			description: 'Configure third-party integrations and external services',
			link: '/settings/integrations',
			color: 'bg-accent-500/10 text-accent-500'
		}
	];
	
	// Local state
	let isLoading = $state(true);
	let error = $state('');
	let adminUser = $state<UserResponse | null>(null);
	let isAdmin = $state(false);
	
	// Subscribe to auth store
	authUser.subscribe((user: UserResponse | null) => {
		adminUser = user;
		isAdmin = user?.role === 'admin';
		isLoading = false;
	});
	
	// Navigate to section
	function navigateToSection(link: string) {
		goto(link);
	}
	
	// Check admin status on mount
	onMount(() => {
		setTimeout(() => {
			isLoading = false;
		}, 500);
	});
</script>

<div class="container mx-auto max-w-7xl px-4 py-8">
	<!-- Header Section -->
	<div class="mb-8">
		<h1 class="flex items-center gap-3 text-3xl font-bold">
			<div class="bg-primary-500/10 p-1.5 rounded-lg">
				<Shield size={28} class="text-primary-500" />
			</div>
			Admin Dashboard
		</h1>
		<p class="text-surface-100-900/60 mt-1">
			System administration and management interface
		</p>
	</div>
	
	<!-- Loading or Error States -->
	{#if isLoading}
		<div class="flex h-80 items-center justify-center">
			<LoadingSpinner size="xl" />
		</div>
	{:else if !isAdmin}
		<div class="card preset-filled-surface-100-900 flex h-80 flex-col items-center justify-center p-8 text-center shadow-xl backdrop-blur-sm">
			<Shield size={64} class="mb-4 opacity-20" />
			<h2 class="text-xl font-bold">Access Restricted</h2>
			<p class="max-w-md opacity-70">
				You need administrator privileges to access the admin dashboard.
			</p>
			<button class="btn btn-outline mt-6" on:click={() => goto('/')}>
				Return to Home
			</button>
		</div>
	{:else if error}
		<div class="mb-6 flex items-center gap-3 rounded-lg bg-error-500/10 p-4 text-error-500 shadow">
			<X size={20} />
			<p>{error}</p>
		</div>
	{:else}
		<!-- Admin Sections Grid -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each adminSections as section}
				<div 
					class="card preset-filled-surface-100-900 overflow-hidden transition-all duration-200 hover:shadow-lg shadow-md backdrop-blur-sm"
					on:click={() => navigateToSection(section.link)}
					on:keypress={(e) => e.key === 'Enter' && navigateToSection(section.link)}
					tabindex="0"
					role="button"
					aria-label={`Go to ${section.title}`}
				>
					<div class="card-body p-6">
						<div class="card-title mb-4 flex items-center gap-3">
							<div class="{section.color} p-2 rounded-lg">
								<svelte:component this={section.icon} size={24} />
							</div>
							<h2 class="text-xl font-bold">{section.title}</h2>
						</div>
						<p class="opacity-70">{section.description}</p>
						<div class="card-actions justify-end mt-4">
							<button class="btn btn-sm btn-primary">
								<Play size={16} />
								Manage
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>