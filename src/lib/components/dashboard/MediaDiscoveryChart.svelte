<script lang="ts">
	interface ChartDataPoint {
		month: string;
		count: number;
	}

	interface MediaDiscoveryChartProps {
		data: ChartDataPoint[];
	}

	const { data } = $props<MediaDiscoveryChartProps>();

	// Find the maximum count to calculate relative heights
	let maxCount = Math.max(...data.map((item) => item.count));
</script>

<div>
	<!-- Title is shown in parent card -->
	<div class="h-64">
		<div class="flex h-full items-end">
			{#each data as month}
				<div class="flex flex-1 flex-col items-center">
					<div
						class="bg-primary-500 w-full transition-all duration-500 ease-in-out"
						style="height: {(month.count / maxCount) * 90}%"
					></div>
					<p class="mt-2 text-xs">{month.month}</p>
				</div>
			{/each}
		</div>
	</div>
</div>

