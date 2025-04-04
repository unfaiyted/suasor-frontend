// components/types.ts
// Import Movie type from API
import { Movie as APIMovie } from '$lib/api/types';

// Create a frontend-friendly movie type that extends the API type
export interface Movie extends Partial<APIMovie> {
	id: string;
	title?: string; // Will come from Details.title
	year?: number; // Will come from Details.releaseYear
	type?: 'movie' | 'series';
	poster?: string; // Will come from Details.Artwork.poster
	backdrop?: string; // Will come from Details.Artwork.background
	genres?: string[]; // Will come from Details.genres
	rating?: number; // Will come from Details.Ratings
	overview?: string; // Will come from Details.description
	reason?: string; // Added by frontend for recommendations
	// Additional metadata for the popover
	director?: string;
	cast?: string[] | any[]; // Could come from Movie.Cast
	runtime?: number; // Will come from Details.duration in seconds
	inLibrary?: boolean;
	mediaClientId?: number;
	mediaItemId?: string;
}

export interface MessageContent {
	type: 'text' | 'movieList';
	text?: string;
	movies?: Movie[];
}

export interface Message {
	id: number;
	sender: 'user' | 'ai';
	avatar: number;
	name: string;
	timestamp: string;
	content: MessageContent;
}

export interface Chat {
	id: string;
	title: string;
	timestamp: string;
	messages: Message[];
	recommendations: Movie[];
}
