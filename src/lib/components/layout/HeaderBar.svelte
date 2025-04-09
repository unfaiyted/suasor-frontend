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
	import CalendarPopup from './CalendarPopup.svelte';

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

	let userMenuVisible = $state(false);
	let mobileMenuVisible = $state(false);
	let showSearch = $state(false);
	let calendarVisible = $state(false);

	function toggleUserMenu() {
		userMenuVisible = !userMenuVisible;
		if (userMenuVisible) {
			mobileMenuVisible = false;
			calendarVisible = false;
		}
	}

	function toggleMobileMenu() {
		mobileMenuVisible = !mobileMenuVisible;
		if (mobileMenuVisible) {
			userMenuVisible = false;
			calendarVisible = false;
		}
	}

	function toggleSearch() {
		showSearch = !showSearch;
		// Close other menus when opening search
		if (showSearch) {
			userMenuVisible = false;
			mobileMenuVisible = false;
			calendarVisible = false;
		}
	}

	function toggleCalendar() {
		console.log('Toggle calendar called, current state:', calendarVisible);
		calendarVisible = !calendarVisible;
		if (calendarVisible) {
			userMenuVisible = false;
			mobileMenuVisible = false;
		}
		console.log('Calendar visibility set to:', calendarVisible);
	}

	function closeCalendar() {
		calendarVisible = false;
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

		// Calendar is handled by its own component
	}

	// Handle keyboard shortcuts for the HeaderBar
	function handleKeyDown(event: KeyboardEvent) {
		// Ctrl+K or Command+K for search
		if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
			event.preventDefault();
			toggleSearch();
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<div class="z-20 flex w-full items-center justify-between bg-transparent p-2 pb-2">
	<div class="z-20 flex items-center">
		<!-- Logo -->
		<a href="/" class="mr-2 hidden sm:block">
			<img src="/logo.svg" alt="Suasor Logo" class=" z-20 h-8 pl-4" />
		</a>

		<button
			class="text-primary-900-100 hover:bg-surface-200-800/50 z-20 ml-4 flex items-center justify-center rounded-full p-1"
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
			<!-- Calendar icon and popup -->
			<div class="calendar-container relative z-20">
				<button
					class="text-primary-900-100 hover:bg-surface-200-800/50 flex items-center justify-center rounded-full p-2"
					onclick={toggleCalendar}
					aria-label="Calendar"
				>
					<Calendar size={20} />
				</button>
				<CalendarPopup show={calendarVisible} onClose={closeCalendar} />
			</div>

			<!-- User menu dropdown -->
			<div class="user-menu-container relative z-20 bg-transparent">
				<button
					class="hover:bg-surface-200-700/50 rounded-full p-2"
					onclick={toggleUserMenu}
					aria-label="User menu"
					aria-expanded={userMenuVisible}
				>
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
							<button
								class="hover:bg-surface-200-700/50 flex w-full items-center gap-2 rounded px-4 py-2 text-left"
								onclick={(e) => {
									e.preventDefault();
									mobileMenuVisible = false;
									toggleCalendar();
								}}
							>
								<Calendar size={16} />
								<span>Calendar</span>
							</button>
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
<SpotlightSearch show={showSearch} on:close={() => (showSearch = false)} />
