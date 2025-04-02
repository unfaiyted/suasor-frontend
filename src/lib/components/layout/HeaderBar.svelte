<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import { isAuthenticated, authUser, authStore } from '$lib/stores/auth';
	import type { UserResponse } from '$lib/api/types';
	import {
		Menu,
		ArrowLeft,
		Paperclip,
		Calendar,
		CircleUser,
		LogOut,
		LogIn,
		Settings
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';

	let userInitials = $state('');
	let user = $state<UserResponse | null>(null);

	authUser.subscribe((change: UserResponse | null) => {
		console.log('authUser changed:', change);
		userInitials =
			change?.username
				?.split(' ')
				?.map((part: string) => part[0])
				?.join('')
				?.toUpperCase() || '';
		console.log('userInitials changed:', userInitials);
		user = change;
	});

	function handleLogout() {
		authStore.logout().then(() => {
			goto('/login');
		});
	}

	// TODO: Add a popup directive to the AppBar component
</script>

<AppBar
	background="bg-surface-100-900/30"
	headlineClasses="sm:hidden"
	centerClasses="hidden sm:block"
>
	{#snippet lead()}
		<ArrowLeft size={24} />
	{/snippet}
	{#snippet trail()}
		<div class="hidden space-x-4 sm:flex">
			<Paperclip size={20} />
			<Calendar size={20} />

			<!-- User menu dropdown -->
			<div class="relative">
				<button class="btn-icon btn-sm variant-ghost-surface">
					{#if $isAuthenticated}
						<div class="avatar placeholder h-8 w-8">
							<div class="bg-primary-500 text-sm font-bold">
								{userInitials || 'U'}
							</div>
						</div>
					{:else}
						<CircleUser size={20} />
					{/if}
				</button>

				<div class="card p-2 shadow-xl" data-popup="userMenu">
					<div class="menu">
						{#if $isAuthenticated}
							<div class="px-4 py-2 text-sm font-medium">
								{user?.username || 'User'}
								<div class="text-xs opacity-70">{user?.email || ''}</div>
							</div>
							<div class="divider my-1"></div>
							<a class="menu-item" href="/settings">
								<span class="flex items-center gap-2">
									<Settings size={16} />
									<span>Settings</span>
								</span>
							</a>
							<button class="menu-item" onclick={handleLogout}>
								<span class="flex items-center gap-2">
									<LogOut size={16} />
									<span>Logout</span>
								</span>
							</button>
						{:else}
							<a class="menu-item" href="/login">
								<span class="flex items-center gap-2">
									<LogIn size={16} />
									<span>Log in</span>
								</span>
							</a>
						{/if}
					</div>
				</div>
			</div>
		</div>
		<div class="block sm:hidden">
			<button class="btn-icon btn-sm variant-ghost-surface">
				<Menu size={20} />
			</button>

			<!-- Mobile Menu -->
			<div class="card w-48 p-2 shadow-xl" data-popup="mobileMenu">
				<div class="menu">
					{#if $isAuthenticated}
						<div class="flex items-center gap-2 px-4 py-2 text-sm font-medium">
							<div class="avatar placeholder h-6 w-6">
								<div class="bg-primary-500 text-xs font-bold">
									{userInitials || 'U'}
								</div>
							</div>
							<span>{user?.username || 'User'}</span>
						</div>
						<div class="divider my-1"></div>
						<a class="menu-item" href="/movies">
							<span>Movies</span>
						</a>
						<a class="menu-item" href="/chat">
							<span>Recommendations</span>
						</a>
						<a class="menu-item" href="/settings">
							<span>Settings</span>
						</a>
						<div class="divider my-1"></div>
						<button class="menu-item" onclick={handleLogout}>
							<span class="flex items-center gap-2">
								<LogOut size={16} />
								<span>Logout</span>
							</span>
						</button>
					{:else}
						<a class="menu-item" href="/login">
							<span class="flex items-center gap-2">
								<LogIn size={16} />
								<span>Log in</span>
							</span>
						</a>
					{/if}
				</div>
			</div>
		</div>
	{/snippet}
	{#snippet headline()}
		<h2 class="h2">Movie Recommendations</h2>
	{/snippet}
	<span>Movie Recommendations</span>
</AppBar>
