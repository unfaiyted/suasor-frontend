<script lang="ts">
	import type { UserResponse } from '$lib/api/types';

	interface HeaderProps {
		user: UserResponse | null;
	}

	const { user }: HeaderProps = $props();
</script>

<header class="mb-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-primary-600 text-3xl font-bold">Media Compass</h1>
			<p class="">Your personalized entertainment dashboard</p>
		</div>
		{#if user}
			<div class="flex items-center">
				<div class="mr-3 text-right">
					<p class="font-medium">Welcome, {user.username}</p>
					<p class="text-sm text-gray-500">Premium Member</p>
				</div>
			</div>
		{/if}
	</div>
</header>

