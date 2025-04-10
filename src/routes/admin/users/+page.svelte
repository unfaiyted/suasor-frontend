<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		userApi,
		users as usersStore,
		userLoading,
		userError,
		userSuccess,
		userPage,
		userTotalPages,
		userTotalCount,
		normalizeAvatarUrl
	} from '$lib/stores/user';
	import { authUser } from '$lib/stores/auth';
	import type { UserResponse } from '$lib/api/types';

	// Import UI components
	import LoadingSpinner from '$lib/components/util/LoadingSpinner.svelte';
	import {
		Trash,
		UserCheck,
		UserMinus,
		Edit,
		Plus,
		Search,
		User,
		UserCog,
		Lock,
		Shield,
		X,
		Check,
		ChevronLeft,
		ChevronRight
	} from '@lucide/svelte';

	// Local state
	let localUsers = $state<UserResponse[]>([]);
	let localLoading = $state(true);
	let localError = $state('');
	let localSuccess = $state('');
	let currentPage = $state(1);
	let totalPages = $state(1);
	let totalUsers = $state(0);
	let searchQuery = $state('');
	let adminUser = $state<UserResponse | null>(null);
	let isAdmin = $state(false);

	// Modal state
	let showAddModal = $state(false);
	let showDeleteModal = $state(false);
	let showEditModal = $state(false);
	let showPermissionsModal = $state(false);
	let selectedUser = $state<UserResponse | null>(null);
	let editUserData = $state({
		id: 0,
		username: '',
		email: '',
		role: 'user' as 'user' | 'admin',
		active: true,
		avatar: ''
	});

	// New user form data
	let newUserData = $state({
		username: '',
		email: '',
		password: '',
		role: 'user' as 'user' | 'admin'
	});

	// Permissions management (mock-up)
	const PERMISSIONS = [
		{ id: 'view_dashboard', name: 'View Dashboard', description: 'Access dashboard view' },
		{ id: 'manage_media', name: 'Manage Media', description: 'Add and edit media content' },
		{ id: 'run_jobs', name: 'Run Jobs', description: 'Execute and manage system jobs' },
		{ id: 'manage_users', name: 'Manage Users', description: 'Add, edit, and remove users' },
		{ id: 'configure_system', name: 'Configure System', description: 'Modify system settings' },
		{
			id: 'manage_integrations',
			name: 'Manage Integrations',
			description: 'Add and configure integrations'
		}
	];

	let userPermissions = $state<string[]>([]);

	// Media client associations (mock-up)
	const MEDIA_CLIENTS = [
		{ id: 1, name: 'Plex Home Theater', type: 'plex' },
		{ id: 2, name: 'Jellyfin Living Room', type: 'jellyfin' },
		{ id: 3, name: 'Emby Bedroom', type: 'emby' },
		{ id: 4, name: 'Sonarr TV Shows', type: 'sonarr' },
		{ id: 5, name: 'Radarr Movies', type: 'radarr' }
	];

	let userMediaProfiles = $state<
		Array<{ clientId: number; profileId: string; profileName: string }>
	>([]);

	// Client profile data (mock)
	const CLIENT_PROFILES = {
		1: [
			{ id: 'plex1', name: 'Main User' },
			{ id: 'plex2', name: 'Kids' },
			{ id: 'plex3', name: 'Guest' }
		],
		2: [
			{ id: 'jf1', name: 'Admin' },
			{ id: 'jf2', name: 'Family' }
		],
		3: [
			{ id: 'emby1', name: 'User' },
			{ id: 'emby2', name: 'Movies Buff' }
		],
		4: [{ id: 'son1', name: 'Default' }],
		5: [{ id: 'rad1', name: 'Default' }]
	};

	// Subscribe to store changes
	usersStore.subscribe((users: UserResponse[]) => {
		localUsers = users;
	});

	userLoading.subscribe((loading: boolean) => {
		localLoading = loading;
	});

	userError.subscribe((error: Error | null) => {
		localError = error ? error.message : '';

		// Auto-clear errors after 5 seconds
		if (error) {
			setTimeout(() => {
				localError = '';
			}, 5000);
		}
	});

	userSuccess.subscribe((success: string | null) => {
		localSuccess = success || '';

		// Auto-clear success after 3 seconds
		if (success) {
			setTimeout(() => {
				localSuccess = '';
			}, 3000);
		}
	});

	userPage.subscribe((page: number) => {
		currentPage = page;
	});

	userTotalPages.subscribe((pages: number) => {
		totalPages = pages;
	});

	userTotalCount.subscribe((count: number) => {
		totalUsers = count;
	});

	authUser.subscribe((user: UserResponse | null) => {
		adminUser = user;
		isAdmin = user?.role === 'admin';
	});

	// Pagination handlers
	async function nextPage() {
		if (currentPage < totalPages) {
			await userApi.getUsers(currentPage + 1);
		}
	}

	async function prevPage() {
		if (currentPage > 1) {
			await userApi.getUsers(currentPage - 1);
		}
	}

	async function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			await userApi.getUsers(page);
		}
	}

	// Search handler
	async function handleSearch(event: Event) {
		event.preventDefault();
		if (searchQuery.trim()) {
			await userApi.searchUsers(searchQuery);
		} else {
			await userApi.getUsers(1);
		}
	}

	// Add user
	async function handleAddUser() {
		// This would normally call API
		console.log('Adding user:', newUserData);

		// Mock implementation - would be replaced with actual API call
		const newUser: UserResponse = {
			id: Math.floor(Math.random() * 1000) + 100,
			username: newUserData.username,
			email: newUserData.email,
			role: newUserData.role,
			active: true,
			avatar: null
		};

		// Update local state
		localUsers = [newUser, ...localUsers];
		localSuccess = `User ${newUser.username} added successfully`;

		// Clear form and close modal
		newUserData = {
			username: '',
			email: '',
			password: '',
			role: 'user'
		};
		showAddModal = false;

		// Refresh user list
		await userApi.getUsers(currentPage);
	}

	// Delete user
	async function openDeleteModal(user: UserResponse) {
		selectedUser = user;
		showDeleteModal = true;
	}

	async function confirmDeleteUser() {
		if (!selectedUser) return;

		await userApi.deleteUser(selectedUser.id);
		showDeleteModal = false;
		selectedUser = null;
	}

	// Edit user
	async function openEditModal(user: UserResponse) {
		selectedUser = user;
		editUserData = {
			id: user.id,
			username: user.username,
			email: user.email || '',
			role: user.role || 'user',
			active: user.active !== false,
			avatar: user.avatar || ''
		};
		showEditModal = true;
	}

	async function handleUpdateUser() {
		console.log('Updating user:', editUserData);

		// Update role if changed
		if (selectedUser && selectedUser.role !== editUserData.role) {
			await userApi.changeUserRole(editUserData.id, editUserData.role);
		}

		// Update active status if changed
		if (selectedUser && selectedUser.active !== editUserData.active) {
			if (editUserData.active) {
				await userApi.activateUser(editUserData.id);
			} else {
				await userApi.deactivateUser(editUserData.id);
			}
		}

		// Close modal and refresh
		showEditModal = false;
		selectedUser = null;
		await userApi.getUsers(currentPage);
	}

	// Toggle user active status
	async function toggleUserActive(user: UserResponse) {
		if (user.active) {
			await userApi.deactivateUser(user.id);
		} else {
			await userApi.activateUser(user.id);
		}
	}

	// Toggle user role
	async function toggleUserRole(user: UserResponse) {
		const newRole = user.role === 'admin' ? 'user' : 'admin';
		await userApi.changeUserRole(user.id, newRole);
	}

	// Permissions modal
	async function openPermissionsModal(user: UserResponse) {
		selectedUser = user;

		// Reset permissions (this would be fetched from API in real implementation)
		userPermissions =
			user.role === 'admin' ? PERMISSIONS.map((p) => p.id) : ['view_dashboard', 'manage_media']; // Default permissions for regular users

		showPermissionsModal = true;
	}

	async function savePermissions() {
		if (!selectedUser) return;

		// Mock saving permissions
		console.log(`Saving permissions for user ${selectedUser.username}:`, userPermissions);

		localSuccess = `Permissions updated for ${selectedUser.username}`;
		showPermissionsModal = false;
		selectedUser = null;
	}

	// Media profile management
	async function openMediaProfilesModal(user: UserResponse) {
		selectedUser = user;

		// Mock fetching user's media profiles
		userMediaProfiles = [
			{ clientId: 1, profileId: 'plex1', profileName: 'Main User' },
			{ clientId: 2, profileId: 'jf2', profileName: 'Family' }
		];

		showPermissionsModal = true;
	}

	function getClientById(id: number) {
		return MEDIA_CLIENTS.find((client) => client.id === id);
	}

	// Toggle permission checkbox
	function togglePermission(permissionId: string) {
		if (userPermissions.includes(permissionId)) {
			userPermissions = userPermissions.filter((id) => id !== permissionId);
		} else {
			userPermissions = [...userPermissions, permissionId];
		}
	}

	// Format date
	function formatDate(date: string | null | undefined): string {
		if (!date) return 'Never';

		return new Date(date).toLocaleDateString();
	}

	// Load users on component mount
	onMount(async () => {
		// Check if current user is admin
		if (!adminUser || adminUser.role !== 'admin') {
			localError = 'Access denied. Admin privileges required.';
			return;
		}

		// Load users
		await userApi.getUsers();
	});

	// Clean up on destroy
	onDestroy(() => {
		userApi.resetState();
	});
</script>

<div class="container mx-auto max-w-7xl px-4 py-8">
	<!-- Header Section -->
	<div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
		<div>
			<h1 class="flex items-center gap-3 text-3xl font-bold">
				<div class="bg-primary-500/10 rounded-lg p-1.5">
					<UserCog size={28} class="text-primary-500" />
				</div>
				User Management
			</h1>
			<p class="text-surface-100-900/60 mt-1">
				Add, edit, and manage user accounts and permissions
			</p>
		</div>

		<!-- Action buttons -->
		<div class="mt-4 flex gap-2 md:mt-0">
			<form on:submit={handleSearch} class="join">
				<input
					type="text"
					placeholder="Search users..."
					class="input join-item input-bordered w-full max-w-xs"
					bind:value={searchQuery}
				/>
				<button type="submit" class="btn join-item btn-primary">
					<Search size={18} />
				</button>
			</form>

			<button class="btn btn-primary" on:click={() => (showAddModal = true)}>
				<Plus size={18} />
				Add User
			</button>
		</div>
	</div>

	<!-- Notification Area -->
	{#if localError}
		<div class="bg-error-500/10 text-error-500 mb-6 flex items-center gap-3 rounded-lg p-4 shadow">
			<X size={20} />
			<p>{localError}</p>
		</div>
	{/if}

	{#if localSuccess}
		<div
			class="bg-success-500/10 text-success-500 mb-6 flex items-center gap-3 rounded-lg p-4 shadow"
		>
			<Check size={20} />
			<p>{localSuccess}</p>
		</div>
	{/if}

	<!-- Content Section -->
	<div class="card preset-filled-surface-100-900 overflow-hidden shadow-xl backdrop-blur-sm">
		{#if localLoading && localUsers.length === 0}
			<div class="flex h-80 items-center justify-center">
				<LoadingSpinner size="xl" />
			</div>
		{:else if !isAdmin}
			<div class="flex h-80 flex-col items-center justify-center p-8 text-center">
				<Shield size={64} class="mb-4 opacity-20" />
				<h2 class="text-xl font-bold">Access Restricted</h2>
				<p class="max-w-md opacity-70">
					You need administrator privileges to access the user management area.
				</p>
			</div>
		{:else if localUsers.length === 0 && !localLoading}
			<div class="flex h-80 flex-col items-center justify-center p-8 text-center">
				<User size={64} class="mb-4 opacity-20" />
				<h2 class="text-xl font-bold">No Users Found</h2>
				<p class="max-w-md opacity-70">
					{searchQuery
						? `No users matching '${searchQuery}' were found.`
						: 'No users have been added to the system yet.'}
				</p>
				{#if searchQuery}
					<button
						class="btn btn-outline btn-sm mt-4"
						on:click={() => {
							searchQuery = '';
							userApi.getUsers();
						}}
					>
						Clear Search
					</button>
				{/if}
			</div>
		{:else}
			<!-- User table -->
			<div class="overflow-x-auto">
				<table class="table w-full">
					<thead class="bg-surface-300-700/30 text-xs uppercase">
						<tr>
							<th class="px-6 py-3 text-left font-semibold tracking-wider">User</th>
							<th class="px-6 py-3 text-left font-semibold tracking-wider">Email</th>
							<th class="px-6 py-3 text-left font-semibold tracking-wider">Role</th>
							<th class="px-6 py-3 text-left font-semibold tracking-wider">Status</th>
							<th class="px-6 py-3 text-right font-semibold tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-surface-300-700/10 divide-y">
						{#each localUsers as user, i}
							<tr class="hover:bg-surface-300-700/10 transition-colors">
								<td class="px-6 py-4">
									<div class="flex items-center space-x-3">
										<div class="avatar">
											<div
												class="bg-primary-500/5 border-surface-300-700/20 h-10 w-10 rounded-full border"
											>
												{#if user.avatar}
													<img src={normalizeAvatarUrl(user.avatar)} alt={user.username} />
												{:else}
													<div class="flex h-full w-full items-center justify-center">
														<User size={20} class="opacity-40" />
													</div>
												{/if}
											</div>
										</div>
										<div>
											<div class="font-medium">{user.username}</div>
											<div class="text-sm opacity-50">ID: {user.id}</div>
										</div>
									</div>
								</td>
								<td class="px-6 py-4">{user.email || 'No email'}</td>
								<td class="px-6 py-4">
									{#if user.role === 'admin'}
										<span
											class="badge bg-primary-500/10 text-primary-500 border-primary-500/30 gap-1"
										>
											<Shield size={12} />
											Admin
										</span>
									{:else}
										<span class="badge bg-surface-300-700/20 gap-1">
											<User size={12} />
											User
										</span>
									{/if}
								</td>
								<td class="px-6 py-4">
									{#if user.active !== false}
										<span
											class="badge bg-success-500/10 text-success-500 border-success-500/30 gap-1"
										>
											<span class="bg-success-500 h-1.5 w-1.5 rounded-full"></span>
											Active
										</span>
									{:else}
										<span class="badge bg-error-500/10 text-error-500 border-error-500/30 gap-1">
											<span class="bg-error-500 h-1.5 w-1.5 rounded-full"></span>
											Inactive
										</span>
									{/if}
								</td>
								<td class="space-x-1 px-6 py-4 text-right">
									<!-- Action buttons -->
									<div class="btn-group">
										<button
											class="btn btn-sm btn-ghost tooltip"
											data-tip="Edit User"
											on:click={() => openEditModal(user)}
										>
											<Edit size={16} />
										</button>

										<button
											class="btn btn-sm btn-ghost tooltip"
											data-tip="{user.active !== false ? 'Deactivate' : 'Activate'} User"
											on:click={() => toggleUserActive(user)}
										>
											{#if user.active !== false}
												<UserMinus size={16} />
											{:else}
												<UserCheck size={16} />
											{/if}
										</button>

										<button
											class="btn btn-sm btn-ghost tooltip"
											data-tip="Manage Permissions"
											on:click={() => openPermissionsModal(user)}
										>
											<Lock size={16} />
										</button>

										<button
											class="btn btn-sm btn-ghost text-error-500 tooltip"
											data-tip="Delete User"
											on:click={() => openDeleteModal(user)}
										>
											<Trash size={16} />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Pagination -->
			{#if totalPages > 1}
				<div
					class="bg-surface-300-700/20 border-surface-300-700/10 flex items-center justify-between border-t px-6 py-3"
				>
					<div class="text-sm">
						Showing <span class="font-medium"
							>{Math.min((currentPage - 1) * 10 + 1, totalUsers)}</span
						>
						to <span class="font-medium">{Math.min(currentPage * 10, totalUsers)}</span> of
						<span class="font-medium">{totalUsers}</span> users
					</div>

					<div class="join">
						<button class="btn join-item btn-sm" disabled={currentPage === 1} on:click={prevPage}>
							<ChevronLeft size={16} />
						</button>

						{#each Array(totalPages) as _, i}
							{#if i + 1 === currentPage || i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)}
								<button
									class="btn join-item btn-sm {i + 1 === currentPage ? 'btn-primary' : ''}"
									on:click={() => goToPage(i + 1)}
								>
									{i + 1}
								</button>
							{:else if (i + 1 === currentPage - 2 || i + 1 === currentPage + 2) && i + 1 > 1 && i + 1 < totalPages}
								<button class="btn join-item btn-sm btn-disabled">...</button>
							{/if}
						{/each}

						<button
							class="btn join-item btn-sm"
							disabled={currentPage === totalPages}
							on:click={nextPage}
						>
							<ChevronRight size={16} />
						</button>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>

<!-- Add User Modal -->
{#if showAddModal}
	<div class="modal modal-open">
		<div class="modal-box relative max-w-md">
			<button
				class="btn btn-ghost btn-circle absolute top-2 right-2"
				on:click={() => (showAddModal = false)}
			>
				<X size={20} />
			</button>
			<h3 class="text-lg font-bold">Add New User</h3>
			<form on:submit|preventDefault={handleAddUser} class="mt-4 space-y-4">
				<div class="form-control">
					<label class="label" for="username">
						<span class="label-text">Username</span>
					</label>
					<input
						id="username"
						type="text"
						class="input input-bordered w-full"
						required
						bind:value={newUserData.username}
					/>
				</div>

				<div class="form-control">
					<label class="label" for="email">
						<span class="label-text">Email</span>
					</label>
					<input
						id="email"
						type="email"
						class="input input-bordered w-full"
						required
						bind:value={newUserData.email}
					/>
				</div>

				<div class="form-control">
					<label class="label" for="password">
						<span class="label-text">Password</span>
					</label>
					<input
						id="password"
						type="password"
						class="input input-bordered w-full"
						required
						bind:value={newUserData.password}
					/>
				</div>

				<div class="form-control">
					<label class="label" for="role">
						<span class="label-text">Role</span>
					</label>
					<select id="role" class="select select-bordered w-full" bind:value={newUserData.role}>
						<option value="user">User</option>
						<option value="admin">Admin</option>
					</select>
				</div>

				<div class="mt-6 flex justify-end space-x-2">
					<button type="button" class="btn btn-ghost" on:click={() => (showAddModal = false)}>
						Cancel
					</button>
					<button type="submit" class="btn btn-primary"> Add User </button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" on:click={() => (showAddModal = false)}></div>
	</div>
{/if}

<!-- Edit User Modal -->
{#if showEditModal && selectedUser}
	<div class="modal modal-open">
		<div class="modal-box relative max-w-md">
			<button
				class="btn btn-ghost btn-circle absolute top-2 right-2"
				on:click={() => (showEditModal = false)}
			>
				<X size={20} />
			</button>
			<h3 class="text-lg font-bold">Edit User: {selectedUser.username}</h3>
			<form on:submit|preventDefault={handleUpdateUser} class="mt-4 space-y-4">
				<div class="form-control">
					<label class="label" for="edit-username">
						<span class="label-text">Username</span>
					</label>
					<input
						id="edit-username"
						type="text"
						class="input input-bordered w-full"
						disabled
						bind:value={editUserData.username}
					/>
					<label class="label">
						<span class="label-text-alt">Username cannot be changed</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label" for="edit-email">
						<span class="label-text">Email</span>
					</label>
					<input
						id="edit-email"
						type="email"
						class="input input-bordered w-full"
						readonly
						bind:value={editUserData.email}
					/>
					<label class="label">
						<span class="label-text-alt">Email change requires user verification</span>
					</label>
				</div>

				<div class="form-control">
					<label class="label" for="edit-role">
						<span class="label-text">Role</span>
					</label>
					<select
						id="edit-role"
						class="select select-bordered w-full"
						bind:value={editUserData.role}
					>
						<option value="user">User</option>
						<option value="admin">Admin</option>
					</select>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-3">
						<input type="checkbox" class="checkbox" bind:checked={editUserData.active} />
						<span class="label-text">Account Active</span>
					</label>
				</div>

				<div class="mt-6 flex justify-end space-x-2">
					<button type="button" class="btn btn-ghost" on:click={() => (showEditModal = false)}>
						Cancel
					</button>
					<button type="submit" class="btn btn-primary"> Update User </button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" on:click={() => (showEditModal = false)}></div>
	</div>
{/if}

<!-- Delete User Modal -->
{#if showDeleteModal && selectedUser}
	<div class="modal modal-open">
		<div class="modal-box relative">
			<button
				class="btn btn-ghost btn-circle absolute top-2 right-2"
				on:click={() => (showDeleteModal = false)}
			>
				<X size={20} />
			</button>
			<h3 class="text-lg font-bold">Delete User</h3>
			<p class="py-4">
				Are you sure you want to delete the user <span class="font-semibold"
					>{selectedUser.username}</span
				>? This action cannot be undone.
			</p>
			<div class="mt-6 flex justify-end space-x-2">
				<button class="btn btn-ghost" on:click={() => (showDeleteModal = false)}> Cancel </button>
				<button class="btn btn-error" on:click={confirmDeleteUser}> Delete User </button>
			</div>
		</div>
		<div class="modal-backdrop" on:click={() => (showDeleteModal = false)}></div>
	</div>
{/if}

<!-- Permissions Modal -->
{#if showPermissionsModal && selectedUser}
	<div class="modal modal-open">
		<div class="modal-box relative max-w-3xl">
			<button
				class="btn btn-ghost btn-circle absolute top-2 right-2"
				on:click={() => (showPermissionsModal = false)}
			>
				<X size={20} />
			</button>
			<h3 class="flex items-center gap-2 text-lg font-bold">
				<Lock size={18} />
				User Permissions: {selectedUser.username}
			</h3>

			<div class="py-4">
				<div class="bg-surface-300-700/20 mb-4 rounded-lg p-4">
					<h4 class="mb-2 font-semibold">Application Permissions</h4>
					<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
						{#each PERMISSIONS as permission}
							<div class="form-control">
								<label class="label cursor-pointer justify-start gap-2">
									<input
										type="checkbox"
										class="checkbox checkbox-primary"
										checked={userPermissions.includes(permission.id)}
										on:change={() => togglePermission(permission.id)}
									/>
									<div>
										<span class="label-text">{permission.name}</span>
										<p class="text-xs opacity-60">{permission.description}</p>
									</div>
								</label>
							</div>
						{/each}
					</div>
				</div>

				<div class="bg-surface-300-700/20 mb-4 rounded-lg p-4">
					<h4 class="mb-2 font-semibold">Media Client Profiles</h4>
					<div class="space-y-3">
						{#each MEDIA_CLIENTS as client}
							<div class="bg-surface-300-700/10 rounded-md p-3">
								<div class="mb-2 flex items-center gap-2">
									<div class="bg-primary-500/10 rounded-full p-1.5">
										<img src="/static/{client.type}.svg" alt={client.type} class="h-5 w-5" />
									</div>
									<span class="font-medium">{client.name}</span>
								</div>

								<div>
									<label class="label" for={`profile-${client.id}`}>
										<span class="label-text">Associate Profile</span>
									</label>
									<select
										id={`profile-${client.id}`}
										class="select select-bordered select-sm w-full max-w-xs"
									>
										<option value="">No profile associated</option>
										{#each CLIENT_PROFILES[client.id] || [] as profile}
											<option
												value={profile.id}
												selected={userMediaProfiles.some(
													(p) => p.clientId === client.id && p.profileId === profile.id
												)}
											>
												{profile.name}
											</option>
										{/each}
									</select>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<div class="mt-6 flex justify-end space-x-2">
				<button class="btn btn-ghost" on:click={() => (showPermissionsModal = false)}>
					Cancel
				</button>
				<button class="btn btn-primary" on:click={savePermissions}> Save Permissions </button>
			</div>
		</div>
		<div class="modal-backdrop" on:click={() => (showPermissionsModal = false)}></div>
	</div>
{/if}
