import { writable } from 'svelte/store';
import type { Movie } from './types';

// Create a store for the movie popover
const popoverStore = writable<{
	visible: boolean;
	movie: Movie | null;
	position: { x: number; y: number };
}>({
	visible: false,
	movie: null,
	position: { x: 0, y: 0 }
});

// Function to show the popover
export function showMoviePopover(movie: Movie, x: number, y: number): void {
	popoverStore.set({
		visible: true,
		movie,
		position: { x, y }
	});
}

// Function to hide the popover
export function hideMoviePopover(): void {
	popoverStore.update((state) => ({
		...state,
		visible: false
	}));
}

// Export the store for subscribing
export const moviePopoverStore = popoverStore;
