<script lang="ts">
	import {
		Calendar,
		Bot,
		Activity,
		BarChart,
		ToggleRight,
		Sparkles,
		Clock,
		Check
	} from '@lucide/svelte';
	import {
		ModelsUserConfigRecommendationSyncFrequency,
		ModelsUserConfigRecommendationStrategy
	} from '$lib/api/suasor.v1.d';

	interface RecommendationSettingsTabProps {
		recommendationSyncFrequency: ModelsUserConfigRecommendationSyncFrequency;
		recommendationStrategy: ModelsUserConfigRecommendationStrategy;

		automateRecommendations: boolean;
		automationMinimumRating: number;
		enableDiscovery: boolean;
		discoveryRatio: number;
		setRecommendationStrategy: (strategy: ModelsUserConfigRecommendationStrategy) => void;
		setRecommendationFrequency: (frequency: ModelsUserConfigRecommendationSyncFrequency) => void;
	}

	// Props with explicit typing
	let {
		// Recommendation settings with defaults
		recommendationSyncFrequency = $bindable(ModelsUserConfigRecommendationSyncFrequency.weekly),
		recommendationStrategy = $bindable(ModelsUserConfigRecommendationStrategy.balanced),
		automateRecommendations = $bindable(false),
		automationMinimumRating = $bindable(7),

		enableDiscovery = $bindable(true),
		discoveryRatio = $bindable(0.5),
		setRecommendationStrategy,
		setRecommendationFrequency

		// Callback for updates
		// onUpdateSetting
	}: RecommendationSettingsTabProps = $props();

	// Map API enum values to user-friendly labels with improved descriptions
	const frequencyOptions = [
		{
			value: ModelsUserConfigRecommendationSyncFrequency.daily,
			label: 'Daily',
			description: 'Get fresh recommendations every day',
			icon: Clock
		},
		{
			value: ModelsUserConfigRecommendationSyncFrequency.weekly,
			label: 'Weekly',
			description: 'Refresh recommendations once a week',
			icon: Calendar
		},
		{
			value: ModelsUserConfigRecommendationSyncFrequency.monthly,
			label: 'Monthly',
			description: 'New recommendations once a month',
			icon: Calendar
		},
		{
			value: ModelsUserConfigRecommendationSyncFrequency.manual,
			label: 'Manual Only',
			description: 'Only update when you request it',
			icon: Activity
		}
	];

	const strategyOptions = [
		{
			value: ModelsUserConfigRecommendationStrategy.popular,
			label: 'Popular Content',
			description: 'Popular content based on your preferences',
			icon: Bot,
			color: 'indigo'
		},
		{
			value: ModelsUserConfigRecommendationStrategy.recent,
			label: 'New Releases',
			description: 'Focus on newly released content across your preferred media types',
			icon: Clock,
			color: 'blue'
		},
		{
			value: ModelsUserConfigRecommendationStrategy.similar,
			label: 'Similar Content',
			description: 'Content based on your preferences and similarity to your library',
			icon: BarChart,
			color: 'orange'
		},
		{
			value: ModelsUserConfigRecommendationStrategy.balanced,
			label: 'Balanced Mix',
			description: 'Combined approach with personalized, new, and popular content',
			icon: Sparkles,
			color: 'purple'
		}
	];
</script>

<div class="space-y-6">
	<header class="mb-4 flex items-center gap-3">
		<div class="bg-primary-500 flex h-10 w-10 items-center justify-center rounded-full">
			<Sparkles size={20} class="text-white" />
		</div>
		<h3 class="text-lg font-medium">Recommendation Settings</h3>
	</header>

	<!-- Recommendation Strategy -->
	<div class="form-control">
		<label class="label" for="recommendation-strategy">
			<span class="label-text font-medium">Recommendation Strategy</span>
		</label>
		<p class="text-surface-900-50 mb-3 text-sm">Choose how recommendations are selected for you</p>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{#each strategyOptions as option}
				<button
					type="button"
					class="relative flex h-full flex-col rounded-lg border p-5 text-left transition-colors"
					class:bg-opacity-5={recommendationStrategy === option.value}
					class:bg-primary-500={recommendationStrategy === option.value}
					class:border-primary-500={recommendationStrategy === option.value}
					class:border-surface-300-600={recommendationStrategy !== option.value}
					onclick={() => {
						setRecommendationStrategy(option.value);
					}}
				>
					{#if recommendationStrategy === option.value}
						<div class="absolute top-3 right-3">
							<div class="bg-primary-500 rounded-full p-1 text-white">
								<Check size={16} />
							</div>
						</div>
					{/if}
					<div class="mb-3 flex items-center gap-3">
						{#if option.color === 'indigo'}
							<div
								class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500"
							>
								<option.icon size={20} class="text-white" />
							</div>
						{:else if option.color === 'blue'}
							<div
								class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500"
							>
								<option.icon size={20} class="text-white" />
							</div>
						{:else if option.color === 'orange'}
							<div
								class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500"
							>
								<option.icon size={20} class="text-white" />
							</div>
						{:else if option.color === 'purple'}
							<div
								class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-500"
							>
								<option.icon size={20} class="text-white" />
							</div>
						{/if}
						<span class="text-lg font-medium">{option.label}</span>
					</div>
					<p class="text-surface-900-50 text-sm">{option.description}</p>
				</button>
			{/each}
		</div>
	</div>

	<!-- Recommendation Frequency -->
	<div class="form-control">
		<label class="label" for="recommendation-frequency">
			<span class="label-text font-medium">Update Frequency</span>
		</label>
		<p class="text-surface-900-50 mb-3 text-sm">
			How often would you like to receive new recommendations?
		</p>

		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
			{#each frequencyOptions as option}
				<button
					type="button"
					class="relative flex items-center gap-3 rounded-lg border p-4 transition-colors"
					class:bg-opacity-5={recommendationSyncFrequency === option.value}
					class:bg-primary-500={recommendationSyncFrequency === option.value}
					class:border-primary-500={recommendationSyncFrequency === option.value}
					class:border-surface-300-600={recommendationSyncFrequency !== option.value}
					onclick={() => {
						setRecommendationFrequency(option.value);
					}}
				>
					{#if recommendationSyncFrequency === option.value}
						<div class="absolute top-3 right-3">
							<div class="bg-primary-500 rounded-full p-0.5 text-white">
								<Check size={12} />
							</div>
						</div>
					{/if}
					<div class="bg-primary-500 flex h-10 w-10 items-center justify-center rounded-full">
						<option.icon size={20} class="text-white" />
					</div>
					<div>
						<span class="block font-medium">{option.label}</span>
						<span class="text-surface-900-50 text-xs">{option.description}</span>
					</div>
				</button>
			{/each}
		</div>
	</div>

	<!-- Automation -->
	<div class="form-control">
		<label class="label" for="automation">
			<span class="label-text font-medium">Automation</span>
		</label>

		<div class="flex flex-col space-y-3">
			<div class="flex items-center gap-3 rounded-lg border p-4">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500">
					<ToggleRight size={18} class="text-white" />
				</div>
				<div class="flex flex-1 items-center justify-between">
					<div>
						<span class="font-medium">Automate Recommendations</span>
						<p class="text-surface-900-50 text-sm">
							Automatically download or add recommended content to your library
						</p>
					</div>
					<label class="relative inline-flex cursor-pointer items-center">
						<input type="checkbox" bind:checked={automateRecommendations} class="peer sr-only" />
						<div
							class="peer peer-checked:bg-primary-500 h-6 w-11 rounded-full bg-gray-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-md after:transition-all peer-checked:after:translate-x-full dark:bg-gray-600"
						></div>
					</label>
				</div>
			</div>

			{#if automateRecommendations}
				<div class="ml-12 space-y-3">
					<div class="flex items-center justify-between gap-3 rounded-lg border p-3">
						<span class="text-sm font-medium">Minimum Rating Threshold</span>
						<select
							class="select select-sm bg-surface-200-800/50"
							bind:value={automationMinimumRating}
						>
							<option value={5}>5.0+</option>
							<option value={6}>6.0+</option>
							<option value={7}>7.0+</option>
							<option value={8}>8.0+</option>
							<option value={9}>9.0+</option>
						</select>
					</div>

					<div class="flex items-center justify-between gap-3 rounded-lg border p-3">
						<span class="text-sm font-medium">Frequency Download Limit</span>
						<select class="select select-sm bg-surface-200-800/50">
							<option value={5}>5 Items</option>
							<option value={10}>10 Items</option>
							<option value={15}>15 Items</option>
							<option value={20}>20 Items</option>
							<option value={-1}>No Limit</option>
						</select>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Discovery Settings -->
	<div class="form-control">
		<label class="label" for="discovery-settings">
			<span class="label-text font-medium">Discovery Settings</span>
		</label>

		<div class="flex items-center gap-3 rounded-lg border p-4">
			<div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
				<Sparkles size={18} class="text-white" />
			</div>
			<div class="flex flex-1 items-center justify-between">
				<div>
					<span class="font-medium">Discover New Content</span>
					<p class="text-surface-900-50 text-sm">
						Include content outside your current preference patterns
					</p>
				</div>
				<label class="relative inline-flex cursor-pointer items-center">
					<input type="checkbox" bind:checked={enableDiscovery} class="peer sr-only" />
					<div
						class="peer peer-checked:bg-primary-500 h-6 w-11 rounded-full bg-gray-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-md after:transition-all peer-checked:after:translate-x-full dark:bg-gray-600"
					></div>
				</label>
			</div>
		</div>

		{#if enableDiscovery}
			<div class="mt-3 ml-12">
				<label class="text-sm font-medium" for="discovery-ratio">Discovery Ratio</label>
				<div class="mt-1 flex items-center gap-3">
					<input
						type="range"
						min="0"
						max="100"
						step="10"
						bind:value={discoveryRatio}
						class="range range-primary flex-1"
					/>
					<span class="w-12 text-center font-medium">{discoveryRatio}%</span>
				</div>
				<p class="text-surface-900-50 mt-1 text-xs">
					Percentage of recommendations that will explore new content types
				</p>
			</div>
		{/if}
	</div>
</div>
