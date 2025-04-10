<script lang="ts">
	import { Upload, X, Check } from '@lucide/svelte';
	import type { UserResponse } from '$lib/api/types';
	import userApi from '$lib/stores/user';

	interface AvatarUploadProps {
		user: UserResponse;
		onAvatarUploaded: (filePath: string) => void;
	}

	const { user, onAvatarUploaded }: AvatarUploadProps = $props();

	let avatarFile: File | null = $state(null);
	let avatar: string | null = $state(user.avatar || null);
	let avatarDisplay = $state('none');
	let previewUrl: string | null = $state(null);
	let isUploading = $state(false);
	let errorMessage = $state<string | null>(null);
	let successMessage = $state<string | null>(null);

	console.log('AvatarUpload component props:', avatar);

	// File handling
	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const files = input.files;

		if (files && files.length > 0) {
			const file = files[0];

			// Check if file is an image
			if (!file.type.startsWith('image/')) {
				errorMessage = 'Please select an image file';
				avatarFile = null;
				previewUrl = null;
				return;
			}

			// Check file size (max 2MB)
			if (file.size > 2 * 1024 * 1024) {
				errorMessage = 'File size should be less than 2MB';
				avatarFile = null;
				previewUrl = null;
				return;
			}

			avatarFile = file;
			previewUrl = URL.createObjectURL(file);
			errorMessage = null;
		}
	}

	// Clear selected file
	function clearFile() {
		avatarFile = null;
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
		previewUrl = null;
		errorMessage = null;
		successMessage = null;
	}

	// Upload avatar
	async function uploadAvatar() {
		if (!avatarFile) {
			errorMessage = 'Please select an image file';
			return;
		}

		isUploading = true;
		errorMessage = null;
		successMessage = null;

		try {
			// Use the user store to upload avatar
			const filePath = await userApi.uploadAvatar(avatarFile);

			if (!filePath) {
				throw new Error('Failed to upload avatar');
			}

			successMessage = 'Avatar uploaded successfully';

			// Dispatch event to notify parent component
			onAvatarUploaded(filePath);

			// Wait a bit before clearing success message
			setTimeout(() => {
				clearFile();
				successMessage = null;
			}, 3000);
		} catch (error) {
			console.error('Avatar upload error:', error);
			errorMessage = 'Failed to upload avatar';
		} finally {
			isUploading = false;
		}
	}
</script>

<div class="flex w-full flex-col items-center justify-center gap-4">
	<!-- Avatar Preview -->
	<div class="relative">
		{#if previewUrl}
			<div class="relative h-32 w-32 overflow-hidden rounded-full">
				<img src={previewUrl} alt="Avatar preview" class="h-full w-full object-cover" />
				<button
					class="absolute top-0 right-0 rounded-full bg-red-500 p-1 text-white"
					onclick={clearFile}
					title="Clear"
				>
					<X size={16} />
				</button>
			</div>
		{:else if avatar}
			<div class="relative h-32 w-32 overflow-hidden rounded-full">
				<img src={avatar} alt="Current avatar" class={'h-full w-full object-cover '} />
			</div>
		{:else}
			<div
				class="bg-primary-500 flex h-32 w-32 items-center justify-center rounded-full text-white"
			>
				<span class="text-3xl font-bold">
					{user.username
						?.split(' ')
						?.map((part) => part[0])
						?.join('')
						?.toUpperCase() || 'U'}
				</span>
			</div>
		{/if}
	</div>

	<!-- File Upload Controls -->
	<div class="flex w-full flex-col items-center gap-2">
		<label
			class="btn btn-sm variant-filled-primary flex cursor-pointer items-center gap-2"
			for="avatar-upload"
		>
			<Upload size={16} />
			<span>Select Image</span>
		</label>

		<input
			type="file"
			id="avatar-upload"
			accept="image/*"
			onchange={handleFileSelect}
			class="hidden"
		/>

		{#if avatarFile}
			<button
				class="btn btn-sm variant-filled-secondary w-full"
				onclick={uploadAvatar}
				disabled={isUploading}
			>
				{#if isUploading}
					<div class="mr-2 animate-spin">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
					</div>
					<span>Uploading...</span>
				{:else}
					<Check size={16} />
					<span>Upload Avatar</span>
				{/if}
			</button>
		{/if}

		<!-- Messages -->
		{#if errorMessage}
			<div class="mt-2 text-sm text-red-500">
				{errorMessage}
			</div>
		{/if}

		{#if successMessage}
			<div class="mt-2 text-sm text-green-500">
				{successMessage}
			</div>
		{/if}
	</div>
</div>
