<script lang="ts">
	import { User, Mail, CircleUser } from '@lucide/svelte';
	import type { UserConfig, UserResponse } from '$lib/api/types';
	import AvatarUpload from '../user/AvatarUpload.svelte';
	import userApi from '$lib/stores/user';

	interface ProfileSettingsTabProps {
		formState: UserConfig;
		user: UserResponse;
		updateFormState: (formState: Partial<UserConfig>) => void;
		updateUser: (user: UserResponse) => void;
	}

	// Props
	let { formState, updateFormState, updateUser, user }: ProfileSettingsTabProps = $props();

	// Local state for user profile
	let username = $state(user.username || '');
	let email = $state(user.email || '');
	let displayName = $state(formState.displayName || '');
	let bio = $state(formState.bio || '');
	let avatar = $state<string | null>(user.avatar || null);
	let tempAvatar = $state<string | null>(null);
	let social = $state<Record<string, string>>(
		formState.socialLinks || {
			letterboxd: '',
			lastfm: '',
			trakt: ''
		}
	);
	let privacySettings = $state(
		formState.privacySettings || {
			showWatchHistory: true,
			shareRecommendations: true,
			publicProfile: true
		}
	);

	console.log('UserSettingsPanel props:', user);

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];

			// Validate file is an image and under size limit (5MB)
			if (!file.type.startsWith('image/')) {
				alert('Please select an image file');
				return;
			}

			if (file.size > 5 * 1024 * 1024) {
				alert('Image size should be less than 5MB');
				return;
			}

			// Create a preview URL
			const reader = new FileReader();
			reader.onload = (e) => {
				tempAvatar = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	function confirmAvatar() {
		if (tempAvatar) {
			avatar = tempAvatar;
			updateUser({ avatar: avatar });
			// Also update the global store
			userApi.updateProfile({ avatar: avatar });
			tempAvatar = null;
		}
	}

	function cancelAvatar() {
		tempAvatar = null;
	}

	function removeAvatar() {
		avatar = null;
		updateUser({ avatar: '' });
		// Also update the global store
		userApi.updateProfile({ avatar: '' });
	}
</script>

<div class="space-y-8">
	<header class="mb-6 flex items-center gap-3">
		<div class="bg-primary-500 flex h-10 w-10 items-center justify-center rounded-full">
			<User size={20} class="text-white" />
		</div>
		<h3 class="text-lg font-medium">Profile Settings</h3>
	</header>

	<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
		<!-- Left column: Avatar and Bio -->
		<div class="md:col-span-1">
			<div class="flex flex-col items-center justify-center space-y-4">
				<!-- Avatar Upload Component -->
				<AvatarUpload
					{user}
					onAvatarUploaded={(filePath) => {
						// Update form state with new avatar URL
						updateUser({ avatar: filePath });
						// Store already updated by AvatarUpload component
					}}
				/>

				<!-- Bio -->
				<div class="w-full">
					<label class="mb-1 block text-sm font-medium">Bio</label>
					<textarea
						class="bg-surface-200-800/50 focus:ring-primary-500 h-32 w-full rounded-lg p-2 text-sm focus:ring-2 focus:outline-none"
						placeholder="Tell us about yourself and your media interests..."
						maxlength="300"
						bind:value={bio}
					></textarea>
					<p class="text-surface-900-50 mt-1 text-right text-xs">
						{bio?.length || 0}/300 characters
					</p>
				</div>
			</div>
		</div>

		<!-- Right column: Profile Details -->
		<div class="space-y-6 md:col-span-2">
			<!-- Username and Display Name -->
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div class="form-control">
					<label class="label" for="username">
						<span class="label-text font-medium">Username</span>
					</label>
					<div class="flex items-center gap-2">
						<User size={18} class="text-surface-500-400" />
						<input
							type="text"
							id="username"
							class="bg-surface-200-800/50 focus:ring-primary-500 flex-1 rounded-lg p-2 focus:ring-2 focus:outline-none"
							value={username}
							readonly
							disabled
						/>
					</div>
					<p class="text-surface-900-50 mt-1 text-xs">Username cannot be changed</p>
				</div>

				<div class="form-control">
					<label class="label" for="displayName">
						<span class="label-text font-medium">Display Name</span>
					</label>
					<div class="flex items-center gap-2">
						<CircleUser size={18} class="text-surface-500-400" />
						<input
							type="text"
							id="displayName"
							class="bg-surface-200-800/50 focus:ring-primary-500 flex-1 rounded-lg p-2 focus:ring-2 focus:outline-none"
							placeholder="How you want to be known"
							bind:value={displayName}
						/>
					</div>
					<p class="text-surface-900-50 mt-1 text-xs">
						This is how your name appears to other users
					</p>
				</div>
			</div>

			<!-- Email -->
			<div class="form-control">
				<label class="label" for="email">
					<span class="label-text font-medium">Email Address</span>
				</label>
				<div class="flex items-center gap-2">
					<Mail size={18} class="text-surface-500-400" />
					<input
						type="email"
						id="email"
						class="bg-surface-200-800/50 focus:ring-primary-500 flex-1 rounded-lg p-2 focus:ring-2 focus:outline-none"
						value={email}
						readonly
						disabled
					/>
				</div>
				<p class="text-surface-900-50 mt-1 text-xs">Contact admin to change your email address</p>
			</div>

			<!-- Social Media Links -->
			<div class="form-control">
				<label class="label" for="social-links">
					<span class="label-text font-medium">Social Media & Service Links</span>
				</label>
				<div class="bg-surface-200-800/20 rounded-lg p-4">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label class="mb-1 block text-sm" for="letterboxd">Letterboxd</label>
							<input
								type="text"
								name="letterboxd"
								class="bg-surface-200-800/50 focus:ring-primary-500 w-full rounded p-2 text-sm focus:ring-2 focus:outline-none"
								placeholder="username"
								bind:value={social.letterboxd}
							/>
						</div>

						<div>
							<label class="mb-1 block text-sm" for="lastfm">Last.fm</label>
							<input
								type="text"
								id="lastfm"
								class="bg-surface-200-800/50 focus:ring-primary-500 w-full rounded p-2 text-sm focus:ring-2 focus:outline-none"
								placeholder="username"
								bind:value={social.lastfm}
							/>
						</div>

						<div>
							<label class="mb-1 block text-sm" for="trakt">Trakt.tv</label>
							<input
								type="text"
								id="trakt"
								class="bg-surface-200-800/50 focus:ring-primary-500 w-full rounded p-2 text-sm focus:ring-2 focus:outline-none"
								placeholder="username"
								bind:value={social.trakt}
							/>
						</div>
					</div>
					<p class="text-surface-900-50 mt-3 text-xs">
						Connect your media services profiles for better recommendations and sharing
					</p>
				</div>
			</div>

			<!-- Privacy Settings -->
			<div class="form-control">
				<label class="label">
					<span class="label-text font-medium">Privacy Settings</span>
				</label>
				<div class="bg-surface-200-800/20 rounded-lg p-4">
					<div class="space-y-3">
						<div class="flex items-center justify-between">
							<div>
								<span class="text-sm font-medium">Public Profile</span>
								<p class="text-surface-900-50 text-xs">Allow others to view your profile</p>
							</div>
							<input type="checkbox" bind:checked={privacySettings.publicProfile} />
						</div>

						<div class="border-surface-300-700 border-t pt-3"></div>

						<div class="flex items-center justify-between">
							<div>
								<span class="text-sm font-medium">Show Watch History</span>
								<p class="text-surface-900-50 text-xs">Let others see what you've watched</p>
							</div>
							<input type="checkbox" bind:checked={privacySettings.showWatchHistory} />
						</div>

						<div class="border-surface-300-700 border-t pt-3"></div>

						<div class="flex items-center justify-between">
							<div>
								<span class="text-sm font-medium">Share Recommendations</span>
								<p class="text-surface-900-50 text-xs">
									Allow your recommendations to be shared with other users
								</p>
							</div>
							<input type="checkbox" bind:checked={privacySettings.shareRecommendations} />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
