// components/types.ts
export interface Movie {
	id: string;
	title: string;
	year: number;
	type: 'movie' | 'series';
	poster: string;
	genres: string[];
	rating: number;
	overview: string;
	reason?: string;
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
