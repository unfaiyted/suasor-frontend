<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Portal from '../portal/Portal.svelte';
	
	interface CalendarPopupProps {
		show: boolean;
		onClose: () => void;
	}
	
	let { show = false, onClose }: CalendarPopupProps = $props;
	
	let currentDate = new Date();
	let calendarDays: Date[] = [];
	let calendarContainerRef: HTMLElement;
	let selectedDate = $state<Date | null>(null);
	
	// Mock upcoming media events
	const upcomingEvents = [
		{
			id: '1',
			type: 'movie',
			title: 'Dune: Part Three',
			date: addDays(new Date(), 2).toISOString(),
			status: 'Coming Soon'
		},
		{
			id: '2',
			type: 'tv',
			title: 'Stranger Things S5E01',
			date: addDays(new Date(), 5).toISOString(),
			status: 'New Episode'
		},
		{
			id: '3',
			type: 'movie',
			title: 'Avatar 3',
			date: addDays(new Date(), 12).toISOString(),
			status: 'Coming Soon'
		},
		{
			id: '4',
			type: 'tv',
			title: 'House of the Dragon S2E05',
			date: addDays(new Date(), 14).toISOString(),
			status: 'New Episode'
		},
		{
			id: '5',
			type: 'movie',
			title: 'Mission Impossible 8',
			date: addDays(new Date(), 18).toISOString(),
			status: 'Pre-order Available'
		},
		{
			id: '6',
			type: 'tv',
			title: 'The Mandalorian S4E01',
			date: addDays(new Date(), 22).toISOString(),
			status: 'Season Premiere'
		},
		{
			id: '7',
			type: 'movie',
			title: 'Fantastic Beasts 4',
			date: addDays(new Date(), 25).toISOString(), 
			status: 'Trailer Release'
		}
	];
	
	// Helper functions to replace date-fns
	function addDays(date: Date, days: number): Date {
		const result = new Date(date);
		result.setDate(result.getDate() + days);
		return result;
	}
	
	function startOfMonth(date: Date): Date {
		const result = new Date(date);
		result.setDate(1);
		return result;
	}
	
	function endOfMonth(date: Date): Date {
		const result = new Date(date);
		result.setMonth(result.getMonth() + 1);
		result.setDate(0);
		return result;
	}
	
	function eachDayOfInterval(interval: { start: Date; end: Date }): Date[] {
		const days: Date[] = [];
		const currentDate = new Date(interval.start);
		
		while (currentDate <= interval.end) {
			days.push(new Date(currentDate));
			currentDate.setDate(currentDate.getDate() + 1);
		}
		
		return days;
	}
	
	function formatDate(date: Date, format: string): string {
		// Simple formatter for the few formats we need
		const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
		                   'July', 'August', 'September', 'October', 'November', 'December'];
		const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
		                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		
		const day = date.getDate();
		const month = date.getMonth();
		const year = date.getFullYear();
		
		if (format === 'd') {
			return day.toString();
		}
		
		if (format === 'MMMM yyyy') {
			return `${monthNames[month]} ${year}`;
		}
		
		if (format === 'MMM d') {
			return `${monthShort[month]} ${day}`;
		}
		
		if (format === 'yyyy-MM-dd') {
			return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
		}
		
		return date.toLocaleDateString();
	}
	
	function isToday(date: Date): boolean {
		const today = new Date();
		return date.getDate() === today.getDate() && 
			date.getMonth() === today.getMonth() && 
			date.getFullYear() === today.getFullYear();
	}
	
	function isSameMonth(date1: Date, date2: Date): boolean {
		return date1.getMonth() === date2.getMonth() && 
			date1.getFullYear() === date2.getFullYear();
	}
	
	function generateCalendarDays() {
		const monthStart = startOfMonth(currentDate);
		const monthEnd = endOfMonth(currentDate);
		calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
	}
	
	function getEventsForDay(date: Date) {
		const dateStr = formatDate(date, 'yyyy-MM-dd');
		return upcomingEvents.filter(event => {
			const eventDate = formatDate(new Date(event.date), 'yyyy-MM-dd');
			return eventDate === dateStr;
		});
	}
	
	function selectDate(date: Date) {
		// Toggle off if clicking the same date again
		if (selectedDate && 
			formatDate(selectedDate, 'yyyy-MM-dd') === formatDate(date, 'yyyy-MM-dd')) {
			selectedDate = null;
		} else {
			selectedDate = new Date(date);
		}
	}
	
	function navigateToMediaItem(type: string, id: string) {
		console.log('Navigating to media item:', type, id);
		onClose();
		goto(`/${type === 'movie' ? 'movies' : 'tv'}/${id}`);
	}
	
	function previousMonth() {
		currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
		generateCalendarDays();
	}
	
	function nextMonth() {
		currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
		generateCalendarDays();
	}
	
	function handleClickOutside() {
		onClose();
	}
	
	onMount(() => {
		generateCalendarDays();
	});
	
	$: monthName = formatDate(currentDate, 'MMMM yyyy');
	$: hasEvents = (date: Date) => getEventsForDay(date).length > 0;
	$: filteredEvents = selectedDate ? getEventsForDay(selectedDate) : upcomingEvents;
	$: isSelectedDate = (date: Date) => {
		return selectedDate && 
			formatDate(selectedDate, 'yyyy-MM-dd') === formatDate(date, 'yyyy-MM-dd');
	}
</script>

{#if show}
	<Portal>
		<div 
			class="fixed inset-0 z-40 bg-black/20"
			onclick={handleClickOutside}
		>
			<div 
				class="fixed top-14 right-4 z-50 max-h-[90vh] w-96 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800" 
				bind:this={calendarContainerRef}
				onclick={(e) => e.stopPropagation()}
			>
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-lg font-semibold">Media Calendar</h2>
					<div class="flex items-center gap-2">
						<button 
							class="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700" 
							onclick={previousMonth}
							aria-label="Previous month"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
						</button>
						<span class="text-sm font-medium">{monthName}</span>
						<button 
							class="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700" 
							onclick={nextMonth}
							aria-label="Next month"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
						</button>
					</div>
				</div>
				
				<div class="mb-4 grid grid-cols-7 gap-1 text-center">
					{#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
						<div class="text-xs font-medium text-gray-500 dark:text-gray-400">{day}</div>
					{/each}
				</div>
				
				<div class="grid grid-cols-7 gap-1">
					{#each calendarDays as day, i}
						<div 
							class="h-10 p-0.5"
							onclick={() => selectDate(day)}
						>
							<div 
								class={`flex h-full w-full cursor-pointer items-center justify-center rounded text-sm relative ${
									isToday(day) 
										? 'bg-primary-100 font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' 
										: ''
								} ${
									hasEvents(day) 
										? 'font-medium ring-1 ring-primary-300 dark:ring-primary-700' 
										: ''
								} ${
									!isSameMonth(day, currentDate) 
										? 'text-gray-400 dark:text-gray-600' 
										: ''
								} ${
									isSelectedDate(day)
										? 'bg-primary-200 dark:bg-primary-800/50'
										: ''
								}`}
							>
								{formatDate(day, 'd')}
								{#if hasEvents(day)}
									<span class="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-primary-500"></span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
				
				<div class="mt-4">
					<h3 class="mb-2 text-sm font-medium">
						{selectedDate ? `Events for ${formatDate(selectedDate, 'MMM d')}` : 'Upcoming Events'}
						{#if selectedDate}
							<button 
								class="ml-2 text-xs text-primary-500 hover:text-primary-600"
								onclick={() => selectedDate = null}
							>
								(Show all)
							</button>
						{/if}
					</h3>
					<div class="space-y-2">
						{#if filteredEvents.length === 0}
							<div class="py-2 text-center text-sm text-gray-500">
								No events found
							</div>
						{:else}
							{#each filteredEvents.slice(0, 5) as event}
								<div 
									class="flex cursor-pointer items-start rounded-md border border-gray-100 p-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
									onclick={() => navigateToMediaItem(event.type, event.id)}
								>
									<div class={`mr-2 mt-0.5 h-2 w-2 rounded-full ${event.type === 'movie' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
									<div class="flex-1">
										<div class="flex items-center justify-between">
											<span class="text-sm font-medium">{event.title}</span>
											<span class="text-xs text-gray-500">{formatDate(new Date(event.date), 'MMM d')}</span>
										</div>
										<div class="mt-1 flex items-center">
											<span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
												{event.type === 'movie' ? 'Movie' : 'TV Show'}
											</span>
											<span class="ml-2 text-xs text-gray-500">{event.status}</span>
										</div>
									</div>
								</div>
							{/each}
							{#if !selectedDate && filteredEvents.length > 5}
								<div class="mt-2 text-center text-xs font-medium text-primary-600 dark:text-primary-400">
									+ {filteredEvents.length - 5} more events
								</div>
							{/if}
						{/if}
					</div>
				</div>
			</div>
		</div>
	</Portal>
{/if}