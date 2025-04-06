<script lang="ts">
	import { isAuthenticated, authUser, authStore } from '$lib/stores/auth';
	import type { UserResponse } from '$lib/api/types';
	import {
		Menu,
		Home,
		Search,
		ArrowLeft,
		Paperclip,
		Calendar,
		CircleUser,
		LogOut,
		LogIn,
		Settings
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import SpotlightSearch from './SpotlightSearch.svelte';

	let userInitials = '';
	let user: UserResponse | null = null;

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
			goto('/logout');
		});
	}

	let userMenuVisible = false;
	let mobileMenuVisible = false;
	let showSearch = false;

	function toggleUserMenu() {
		userMenuVisible = !userMenuVisible;
		if (userMenuVisible) {
			mobileMenuVisible = false;
		}
	}

	function toggleMobileMenu() {
		mobileMenuVisible = !mobileMenuVisible;
		if (mobileMenuVisible) {
			userMenuVisible = false;
		}
	}
	
	function toggleSearch() {
		showSearch = !showSearch;
	}

	// Close menus when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;

		if (!target.closest('.user-menu-container') && userMenuVisible) {
			userMenuVisible = false;
		}

		if (!target.closest('.mobile-menu-container') && mobileMenuVisible) {
			mobileMenuVisible = false;
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="flex w-full items-center justify-between bg-transparent p-2 pb-2">
	<div class="flex items-center">
		<button 
			class="text-primary-900-100 flex items-center justify-center z-20 ml-4 hover:bg-surface-200-800/50 rounded-full p-1"
			onclick={toggleSearch}
			aria-label="Search"
		>
			<Search size={24} />
		</button>
		<!-- <h2 class="h2 ml-3 sm:hidden">Movie Recommendations</h2> -->
	</div>

	<div class="hidden sm:block">
		<!-- <span>Movie Recommendations</span> -->
	</div>

	<div class="flex items-center">
		<div class="hidden space-x-4 sm:flex">
			<!-- <Paperclip size={20} /> -->
			<Calendar size={20} class="text-primary-900-100 z-20 mt-3" />

			<!-- User menu dropdown -->
			<div class="user-menu-container relative z-20 bg-transparent">
				<button class="hover:bg-surface-200-700/50 rounded-full p-2" onclick={toggleUserMenu}>
					{#if $isAuthenticated}
						<div class="bg-primary-500 flex h-8 w-8 items-center justify-center rounded-full">
							<span class="text-sm font-bold text-white">
								{userInitials || 'U'}
							</span>
						</div>
					{:else}
						<CircleUser size={20} />
					{/if}
				</button>

				{#if userMenuVisible}
					<div
						class="bg-surface-100-900 absolute right-0 z-20 z-50 mt-2 min-w-40 rounded-md p-2 pb-0 shadow-xl"
					>
						<div>
							{#if $isAuthenticated}
								<div class="px-4 py-2 text-sm font-medium">
									{user?.username || 'User'}
									<div class="text-xs opacity-70">{user?.email || ''}</div>
								</div>
								<div class="border-surface-400-600 my-1 border-t"></div>
								<a class="hover:bg-surface-200-800/50 block rounded px-4 py-2" href="/settings">
									<span class="flex items-center gap-2">
										<Settings size={16} />
										<span>Settings</span>
									</span>
								</a>
								<button
									class="hover:bg-surface-200-800/50 block w-full rounded px-4 py-2 text-left"
									onclick={handleLogout}
								>
									<span class="flex items-center gap-2">
										<LogOut size={16} />
										<span>Logout</span>
									</span>
								</button>
							{:else}
								<a class="hover:bg-surface-200-800/50 block rounded px-4 py-2" href="/login">
									<span class="flex items-center gap-2">
										<LogIn size={16} />
										<span>Log in</span>
									</span>
								</a>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>
		<div class="mobile-menu-container block sm:hidden">
			<button class="hover:bg-surface-200-700/50 rounded-full p-2" onclick={toggleMobileMenu}>
				<Menu size={20} />
			</button>

			<!-- Mobile Menu -->
			{#if mobileMenuVisible}
				<div
					class="absolute top-14 right-0 z-50 mt-2 w-48 rounded-md bg-transparent p-2 pb-0 shadow-xl"
				>
					<div>
						{#if $isAuthenticated}
							<div class="flex items-center gap-2 px-4 py-2 text-sm font-medium">
								<div class="bg-primary-500 flex h-6 w-6 items-center justify-center rounded-full">
									<span class="text-xs font-bold text-white">
										{userInitials || 'U'}
									</span>
								</div>
								<span>{user?.username || 'User'}</span>
							</div>
							<div class="border-surface-300-600 my-1 border-t"></div>
							<a class="hover:bg-surface-200-700/50 block rounded px-4 py-2" href="/movies">
								<span>Movies</span>
							</a>
							<a class="hover:bg-surface-200-700/50 block rounded px-4 py-2" href="/chat">
								<span>Recommendations</span>
							</a>
							<a class="hover:bg-surface-200-700/50 block rounded px-4 py-2" href="/settings">
								<span>Settings</span>
							</a>
							<div class="border-surface-300-600 my-1 border-t"></div>
							<button
								class="hover:bg-surface-200-700/50 block w-full rounded px-4 py-2 text-left"
								onclick={handleLogout}
							>
								<span class="flex items-center gap-2">
									<LogOut size={16} />
									<span>Logout</span>
								</span>
							</button>
						{:else}
							<a class="hover:bg-surface-200-700/50 block rounded px-4 py-2" href="/login">
								<span class="flex items-center gap-2">
									<LogIn size={16} />
									<span>Log in</span>
								</span>
							</a>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Search component -->
<SpotlightSearch bind:show={showSearch} />