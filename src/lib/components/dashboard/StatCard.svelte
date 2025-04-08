<script lang="ts">
	interface StatCardProps {
		title: string;
		count: number;
		completed: number;
		extraInfo?: string;
	}

	const { title, count, completed, extraInfo = '' } = $props<StatCardProps>();

	// Calculate percentage
	let percentage = (completed / count) * 100;
</script>

<div class="bg-surface-100-900 rounded-lg p-6 shadow-md">
	<h3 class="mb-2 text-lg font-semibold">{title}</h3>
	<div class="flex items-end justify-between">
		<div>
			<p class="text-primary-600 text-3xl font-bold">{count}</p>
			<p class="text-sm">Recommendations</p>
		</div>
		<div class="text-right">
			<p class="text-xl font-medium text-green-500">{completed}</p>
			<p class="text-sm">{title === 'Music' ? 'Listened' : 'Watched'}</p>
		</div>
	</div>
	<div class="mt-4 h-2 w-full rounded-full bg-gray-200">
		<div class="bg-primary-500 h-2 rounded-full" style="width: {percentage}%"></div>
	</div>
	{#if extraInfo}
		<div class="mt-2 text-sm">
			<span class="font-medium">{extraInfo}</span>
		</div>
	{/if}
</div>

