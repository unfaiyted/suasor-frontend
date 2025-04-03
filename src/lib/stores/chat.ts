// src/lib/stores/chat.ts
import { writable, derived, get } from 'svelte/store';
import { createBaseStore } from './base';
import { GET, POST } from '$lib/api/client';
import type {
	GenerateTextRequest,
	GenerateStructuredRequest,
	GenerateTextResponse,
	GenerateStructuredResponse,
	APIGenerateTextResponse,
	APIGenerateStructuredResponse,
	ErrorResponse,
	ClientResponse,
	ClientType
} from '$lib/api/types';
import type { Movie, Chat, Message, MessageContent } from '$lib/components/chat/types';

// Define the chat store state interface
interface ChatState {
	loading: boolean;
	error: ErrorResponse | null;
	chats: Chat[];
	currentChatId: string | null;
	messages: Message[];
	selectedMovies: Movie[];
	aiClients: ClientResponse[];
	currentAiClientId: number | null;
}

// Initialize the chat store
const initialState: ChatState = {
	loading: false,
	error: null,
	chats: [],
	currentChatId: null,
	messages: [],
	selectedMovies: [],
	aiClients: [],
	currentAiClientId: null
};

// Create the base store
const chatStore = createBaseStore<ChatState>(initialState);

// Default AI client for development/testing
const DEFAULT_AI_CLIENT = {
	id: 1,
	name: 'Claude',
	clientType: 'claude',
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	userId: 1
};

// Add chat-specific methods
const chatApi = {
	...chatStore,

	// Load available AI clients
	async loadAiClients() {
		chatStore.setLoading(true);
		try {
			// Get all clients, then filter for AI types
			const response = await GET('/clients/media', {});

			if (response.data?.data) {
				// Filter for AI clients (type claude, openai, ollama)
				const aiClientTypes: string[] = ['claude', 'openai', 'ollama'];
				const aiClients = response.data.data.filter(
					(client) => client.clientType && aiClientTypes.includes(client.clientType)
				);

				chatStore.update((state) => ({
					...state,
					aiClients: aiClients,
					// Use the first AI client if available, or use the default
					currentAiClientId: aiClients.length > 0 ? aiClients[0].id : DEFAULT_AI_CLIENT.id,
					loading: false
				}));
			} else {
				// Use a default AI client for development/testing
				console.warn('No AI clients found, using default for development');
				chatStore.update((state) => ({
					...state,
					aiClients: [DEFAULT_AI_CLIENT],
					currentAiClientId: DEFAULT_AI_CLIENT.id,
					loading: false
				}));
			}
		} catch (error) {
			console.error('Error loading AI clients:', error);
			// Use default client for development/testing
			chatStore.update((state) => ({
				...state,
				aiClients: [DEFAULT_AI_CLIENT],
				currentAiClientId: DEFAULT_AI_CLIENT.id,
				loading: false
			}));
			chatStore.setError(error);
		}
	},

	// Start a new chat session
	startNewChat() {
		const state = get(chatStore);

		// Save current chat if it exists
		if (state.currentChatId && state.messages.length > 0) {
			this.saveCurrentChat();
		}

		// Create a new chat
		const newChatId = crypto.randomUUID();
		const timestamp = new Date().toISOString();

		chatStore.update((state) => ({
			...state,
			currentChatId: newChatId,
			messages: [],
			selectedMovies: [],
			chats: [
				{
					id: newChatId,
					title: `New Chat`,
					timestamp,
					messages: [],
					recommendations: []
				},
				...state.chats
			]
		}));

		// Add welcome message
		this.addMessageFromAI({
			type: 'text',
			text: "Hi! I'm your movie recommendation assistant. What kind of movies do you enjoy watching?"
		});

		// For now, in development, add a sample movie list
		// In production, this would come from the API
		const sampleMovies: Movie[] = [
			{
				id: 'air1',
				title: 'Everything Everywhere All at Once',
				year: 2022,
				type: 'movie',
				poster: 'https://image.tmdb.org/t/p/original/u68AjlvlutfEIcpmbYpKcdi09ut.jpg',
				genres: ['Action', 'Adventure', 'Science Fiction'],
				rating: 8.0,
				overview: 'An aging Chinese immigrant is swept up in an insane adventure...'
			},
			{
				id: 't1',
				title: 'Oppenheimer',
				year: 2023,
				type: 'movie',
				poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
				genres: ['Drama', 'History'],
				rating: 8.2,
				overview: 'The story of American scientist J. Robert Oppenheimer...'
			},
			{
				id: 't2',
				title: 'Poor Things',
				year: 2023,
				type: 'movie',
				poster: 'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg',
				genres: ['Science Fiction', 'Comedy', 'Romance'],
				rating: 8.0,
				overview: 'Brought back to life by an unorthodox scientist...'
			}
		];

		this.addMessageFromAI({
			type: 'movieList',
			text: 'Here are some popular titles you might like:',
			movies: sampleMovies
		});
	},

	// Save the current chat state
	saveCurrentChat() {
		chatStore.update((state) => {
			if (!state.currentChatId) return state;

			const currentChatIndex = state.chats.findIndex((chat) => chat.id === state.currentChatId);
			if (currentChatIndex === -1) return state;

			// Extract recommendations from AI messages
			const recommendations = state.messages
				.filter((m) => m.sender === 'ai' && m.content.type === 'movieList' && m.content.movies)
				.flatMap((m) => m.content.movies || []);

			// Update chat with current messages and extracted recommendations
			const updatedChats = [...state.chats];
			updatedChats[currentChatIndex] = {
				...updatedChats[currentChatIndex],
				messages: [...state.messages],
				recommendations,
				// Update title based on first user message if available
				title:
					state.messages
						.find((m) => m.sender === 'user' && m.content.type === 'text')
						?.content.text?.slice(0, 25) + '...' || updatedChats[currentChatIndex].title
			};

			return {
				...state,
				chats: updatedChats
			};
		});
	},

	// Load a specific chat
	selectChat(chatId: string) {
		const state = get(chatStore);

		// Save current chat if it exists
		if (state.currentChatId && state.messages.length > 0) {
			this.saveCurrentChat();
		}

		chatStore.update((state) => {
			const selectedChat = state.chats.find((chat) => chat.id === chatId);
			if (!selectedChat) return state;

			return {
				...state,
				currentChatId: chatId,
				messages: [...selectedChat.messages],
				selectedMovies: []
			};
		});
	},

	// Toggle movie selection
	toggleMovieSelection(movie: Movie) {
		chatStore.update((state) => {
			const selectedIndex = state.selectedMovies.findIndex((m) => m.id === movie.id);

			if (selectedIndex === -1) {
				// Add to selection
				return {
					...state,
					selectedMovies: [...state.selectedMovies, movie]
				};
			} else {
				// Remove from selection
				return {
					...state,
					selectedMovies: state.selectedMovies.filter((m) => m.id !== movie.id)
				};
			}
		});
	},

	// Clear selected movies
	clearSelectedMovies() {
		chatStore.update((state) => ({
			...state,
			selectedMovies: []
		}));
	},

	// Add a user message to the chat
	addMessageFromUser(content: MessageContent) {
		const timestamp = new Date().toLocaleString('en-US', {
			hour: 'numeric',
			minute: 'numeric',
			hour12: true
		});

		chatStore.update((state) => ({
			...state,
			messages: [
				...state.messages,
				{
					id: state.messages.length,
					sender: 'user',
					avatar: 48, // Can be customized later
					name: 'You',
					timestamp: `Today @ ${timestamp}`,
					content
				}
			]
		}));
	},

	// Add an AI message to the chat
	addMessageFromAI(content: MessageContent) {
		const timestamp = new Date().toLocaleString('en-US', {
			hour: 'numeric',
			minute: 'numeric',
			hour12: true
		});

		chatStore.update((state) => ({
			...state,
			messages: [
				...state.messages,
				{
					id: state.messages.length,
					sender: 'ai',
					avatar: 14, // Can be customized later
					name: 'MovieAI',
					timestamp: `Today @ ${timestamp}`,
					content
				}
			]
		}));
	},

	// Send a message to the AI and get a response
	async sendMessage(message: string) {
		const state = get(chatStore);

		if (!message.trim() && state.selectedMovies.length === 0) {
			return; // Don't send empty messages
		}

		// Prepare message content
		let messageContent: MessageContent;

		if (message.trim()) {
			// Text message
			messageContent = {
				type: 'text',
				text: message
			};
		} else {
			// Movie selection
			messageContent = {
				type: 'movieList',
				text: "I'd like recommendations based on these movies:",
				movies: [...state.selectedMovies]
			};
		}

		// Add user message to chat
		this.addMessageFromUser(messageContent);

		// Clear input and selected movies after sending
		if (state.selectedMovies.length > 0) {
			this.clearSelectedMovies();
		}

		// Call the AI API (or simulate during development)
		try {
			await this.generateAiResponse(messageContent);
		} catch (error) {
			console.error('Error generating response:', error);
			this.addMessageFromAI({
				type: 'text',
				text: 'Sorry, I encountered an error. Please try again.'
			});
		}
	},

	// Convert structured AI response to movie objects
	convertStructuredResponseToMovies(structuredData: any): {
		movies: Movie[];
		agentMessage: string;
	} {
		// Ensure we have a valid response
		if (!structuredData || !Array.isArray(structuredData.recommendations)) {
			console.warn('Invalid structured data format:', structuredData);
			return { movies: [], agentMessage: "I couldn't find any relevant movie recommendations." };
		}

		try {
			// Extract the agent message or use a default
			const agentMessage =
				structuredData.agent_message || 'Here are some movie recommendations for you:';

			// Map the structured data to our Movie format
			const movies = structuredData.recommendations.map((rec: any, index: number) => {
				// Generate a unique ID if none is provided
				const id = rec.id || `recommendation-${index}-${Date.now()}`;

				// Create a properly formatted Movie object
				return {
					id,
					title: rec.title || 'Unknown Title',
					year: rec.year || new Date().getFullYear(),
					type: rec.type || 'movie',
					poster:
						rec.poster ||
						`https://via.placeholder.com/300x450.png?text=${encodeURIComponent(rec.title || 'Movie')}`,
					genres: rec.genres || [],
					rating: rec.rating || 0,
					overview: rec.overview || rec.description || 'No description available.',
					reason: rec.reason || ''
				};
			});

			return { movies, agentMessage };
		} catch (error) {
			console.error('Error converting structured data to movies:', error);
			return {
				movies: [],
				agentMessage: 'I encountered an error processing movie recommendations.'
			};
		}
	},

	// Generate AI response based on chat history
	async generateAiResponse(latestMessage: MessageContent) {
		const state = get(chatStore);

		if (!state.currentAiClientId) {
			this.addMessageFromAI({
				type: 'text',
				text: 'Sorry, no AI client is configured. Please set up an AI client in settings.'
			});
			return;
		}

		chatStore.setLoading(true);

		try {
			// Format context from conversation history
			const conversationHistory = state.messages
				.map((msg) => {
					const role = msg.sender === 'user' ? 'user' : 'assistant';
					let content = '';

					if (msg.content.type === 'text') {
						content = msg.content.text || '';
					} else if (msg.content.type === 'movieList') {
						const movieList = msg.content.movies
							?.map((m) => `- ${m.title} (${m.year}) - ${m.genres.join(', ')}`)
							.join('\n');

						content = msg.content.text ? `${msg.content.text}\n${movieList}` : movieList || '';
					}

					return `${role}: ${content}`;
				})
				.join('\n');

			// Determine if we need text or structured response
			let conversationalResponse = true;
			let structuredRecommendations = false;

			// Check user message to determine response type
			if (latestMessage.type === 'text') {
				const text = latestMessage.text?.toLowerCase() || '';
				if (
					text.includes('recommend') ||
					text.includes('suggest') ||
					text.includes('movie') ||
					text.includes('similar') ||
					text.includes('like') ||
					text.includes('watch')
				) {
					// This appears to be a recommendation request
					structuredRecommendations = true;
				}
			} else if (latestMessage.type === 'movieList') {
				// A list of movies was selected, definitely a recommendation request
				structuredRecommendations = true;
				// We might still want some conversational context
				conversationalResponse = true;
			}

			// First, get a conversational response if needed
			if (conversationalResponse) {
				let textPrompt = '';

				if (latestMessage.type === 'text') {
					textPrompt = `${conversationHistory}\n\nPlease respond to the user's message in a conversational way.`;
					if (structuredRecommendations) {
						textPrompt +=
							" Don't list specific movie recommendations yet - you'll do that separately.";
					}
				} else {
					// For movie selections, create a more specific prompt
					const movieTitles = latestMessage.movies?.map((m) => m.title).join(', ');
					textPrompt = `${conversationHistory}\n\nThe user has selected these movies: ${movieTitles}. Acknowledge their selection and respond conversationally.`;
				}

				// Prepare the text request
				const textRequest: GenerateTextRequest = {
					prompt: textPrompt,
					maxTokens: 500,
					systemInstructions:
						'You are a helpful movie recommendation assistant. Keep responses conversational, friendly, and brief.'
				};

				// Try to call the API first, fall back to simulation if failed
				let responseText = '';
				try {
					const textResponse = await POST(`/api/v1/ai/generate/${state.currentAiClientId}`, {
						body: textRequest
					});
					if (textResponse.data) {
						// Use the real API response
						responseText = textResponse.data.text || this.simulateAiResponse(latestMessage, false);
						await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay for UI
					}
				} catch (error) {
					console.warn('API call failed, using simulated response', error);
					// Fall back to simulation
					await new Promise((resolve) => setTimeout(resolve, 800));
					responseText = this.simulateAiResponse(latestMessage, false);
				}

				// Add the conversational response to the chat
				this.addMessageFromAI({
					type: 'text',
					text: responseText
				});
			}

			// Next, if we need structured recommendations, get them
			if (structuredRecommendations) {
				// Create a structured request for movie recommendations
				let structuredPrompt = '';

				if (latestMessage.type === 'text') {
					structuredPrompt = `${conversationHistory}\n\nBased on the user's message, recommend 3-5 movies they might enjoy. Include title, year, genres, and a brief reason for each recommendation.`;
				} else {
					// For movie selections, create a more specific prompt
					const movieDetails = latestMessage.movies
						?.map((m) => `${m.title} (${m.year}): ${m.genres.join(', ')}`)
						.join('\n');

					structuredPrompt = `The user has selected these movies:\n${movieDetails}\n\nRecommend 3-5 similar movies they might enjoy based on these selections.`;
				}

				// Prepare the structured request with a schema
				const structuredRequest: GenerateStructuredRequest = {
					prompt: structuredPrompt,
					maxTokens: 1500,
					systemInstructions: `You are a movie recommendation API. Return a JSON object with an agent message and an array of recommended movies.
           Include:
           - agent_message: string (a friendly message explaining the recommendations)
           - recommendations: array of movie objects
           
           Each movie should have: 
           - title: string
           - year: number
           - genres: string[]
           - overview: string (brief description)
           - rating: number (1-10)
           - reason: string (why this is recommended)
           
           Format your response as valid JSON like this:
           {
             "agent_message": "Here are some movies I think you'll enjoy based on your interest in action films!",
             "recommendations": [
               {
                 "title": "Movie Title",
                 "year": 2023,
                 "genres": ["Action", "Thriller"],
                 "overview": "Brief description of the movie...",
                 "rating": 8.5,
                 "reason": "Why the user might like this based on their preferences"
               },
               ...more recommendations
             ]
           }`
				};

				// Try to call the API first, fall back to simulation if failed
				try {
					const structuredResponse = await POST(
						`/api/v1/ai/generate-structured/${state.currentAiClientId}`,
						{ body: structuredRequest }
					);
					if (structuredResponse.data && structuredResponse.data.json) {
						// Use the real API response
						const structuredData = JSON.parse(structuredResponse.data.json);
						// Convert and display the real data
						const { movies: recommendedMovies, agentMessage } =
							this.convertStructuredResponseToMovies(structuredData);
						if (recommendedMovies.length > 0) {
							this.addMessageFromAI({
								type: 'movieList',
								text: agentMessage,
								movies: recommendedMovies
							});
							return; // Exit early since we've processed the response
						}
					}
				} catch (error) {
					console.warn('API structured call failed, using simulated response', error);
				}

				// Fall back to simulation
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Simulate a structured JSON response
				const simulatedStructuredData = this.simulateStructuredResponse(latestMessage);

				// Convert the structured data to Movie objects and get the agent message
				const { movies: recommendedMovies, agentMessage } =
					this.convertStructuredResponseToMovies(simulatedStructuredData);

				// Add the movie recommendations as a movieList message
				if (recommendedMovies.length > 0) {
					this.addMessageFromAI({
						type: 'movieList',
						text: agentMessage,
						movies: recommendedMovies
					});
				}
			}

			chatStore.setLoading(false);
		} catch (error) {
			console.error('Error generating AI response:', error);
			this.addMessageFromAI({
				type: 'text',
				text: 'Sorry, I encountered an error processing your request. Please try again.'
			});
			chatStore.setError(error);
			chatStore.setLoading(false);
		}
	},

	// Simulate AI response for development/testing
	simulateAiResponse(latestMessage: MessageContent, forRecommendation: boolean = true): string {
		if (latestMessage.type === 'text') {
			const text = latestMessage.text?.toLowerCase() || '';

			if (forRecommendation) {
				// Response when we're going to follow up with structured recommendations
				if (text.includes('action') || text.includes('adventure')) {
					return "I'd be happy to suggest some action and adventure films for you! I've put together a selection that I think you'll enjoy based on your preferences.";
				} else if (text.includes('comedy') || text.includes('funny')) {
					return "Looking for something to make you laugh? Great choice! I've selected some comedies that range from witty to hilarious that should be right up your alley.";
				} else if (text.includes('horror') || text.includes('scary')) {
					return "Horror fan, I see! I've found some chilling options that should give you the scares you're looking for. Check these out:";
				} else {
					return "I'd be happy to recommend some movies based on what you've told me! Here are some options I think you might enjoy:";
				}
			} else {
				// More detailed responses when we're not following up with structured data
				if (text.includes('action') || text.includes('adventure')) {
					return (
						"Based on your interest in action and adventure films, I'd recommend these movies:\n\n" +
						'1. **Mad Max: Fury Road (2015)** - A high-octane post-apocalyptic adventure with stunning visuals and practical effects.\n\n' +
						'2. **Top Gun: Maverick (2022)** - Not only does it deliver thrilling aerial sequences, but it also has emotional depth that the original lacked.\n\n' +
						'3. **The Woman King (2022)** - Features incredible battle choreography and a powerful story based on the all-female warrior unit that protected the African Kingdom of Dahomey.'
					);
				} else if (text.includes('comedy') || text.includes('funny')) {
					return (
						"If you're looking for comedies, here are some great options:\n\n" +
						'1. **Barbie (2023)** - A surprisingly thoughtful comedy that balances social commentary with genuine laughs.\n\n' +
						"2. **The Grand Budapest Hotel (2014)** - Wes Anderson's meticulously crafted comedy with amazing performances by Ralph Fiennes and a stellar supporting cast.\n\n" +
						'3. **What We Do in the Shadows (2014)** - This mockumentary about vampire roommates is consistently hilarious with its deadpan humor.'
					);
				} else if (text.includes('horror') || text.includes('scary')) {
					return (
						'For horror fans, I recommend:\n\n' +
						'1. **Hereditary (2018)** - A deeply unsettling psychological horror that builds dread masterfully.\n\n' +
						"2. **Get Out (2017)** - Jordan Peele's social thriller combines genuine scares with sharp social commentary.\n\n" +
						'3. **The Witch (2015)** - A slow-burning period piece with incredible attention to historical detail and a truly haunting atmosphere.'
					);
				} else {
					return "I'd be happy to recommend some movies! Could you tell me what genres or types of films you enjoy the most? For example, do you prefer action, comedy, drama, sci-fi, or something else? Or maybe you have some favorite directors or actors?";
				}
			}
		} else if (latestMessage.type === 'movieList') {
			// Recommendation based on selected movies
			const movieCount = latestMessage.movies?.length || 0;

			if (movieCount === 1) {
				const movie = latestMessage.movies![0];
				return `Great choice with ${movie.title}! Based on this selection, I've found some similar movies you might enjoy.`;
			} else {
				return `Thanks for selecting these ${movieCount} movies! I've analyzed your choices and found some recommendations that match their themes and styles.`;
			}
		}

		return "I'm not sure what kind of movies you're looking for. Could you tell me more about your preferences?";
	},

	// Simulate structured JSON response for development/testing
	simulateStructuredResponse(latestMessage: MessageContent): any {
		// Get genre preferences from the message
		let genres: string[] = [];

		if (latestMessage.type === 'text') {
			const text = latestMessage.text?.toLowerCase() || '';

			if (text.includes('action') || text.includes('adventure')) {
				genres = ['Action', 'Adventure', 'Thriller'];
			} else if (text.includes('comedy') || text.includes('funny')) {
				genres = ['Comedy', 'Romance'];
			} else if (text.includes('horror') || text.includes('scary')) {
				genres = ['Horror', 'Thriller'];
			} else if (text.includes('drama')) {
				genres = ['Drama'];
			} else if (text.includes('sci-fi') || text.includes('science fiction')) {
				genres = ['Science Fiction', 'Fantasy'];
			} else {
				// Default to a mix if no specific genre mentioned
				genres = ['Drama', 'Thriller', 'Comedy'];
			}
		} else if (latestMessage.type === 'movieList' && latestMessage.movies?.length) {
			// Extract genres from selected movies
			const allGenres = latestMessage.movies.flatMap((m) => m.genres);
			const genreCount: Record<string, number> = {};

			// Count genre occurrences
			allGenres.forEach((g) => {
				genreCount[g] = (genreCount[g] || 0) + 1;
			});

			// Sort by frequency and take top 3
			genres = Object.entries(genreCount)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 3)
				.map(([genre]) => genre);
		}

		// Generate movie recommendations based on genres
		const recommendations = [];

		// Action/Adventure-oriented movies
		if (genres.includes('Action') || genres.includes('Adventure')) {
			recommendations.push({
				title: 'John Wick',
				year: 2014,
				genres: ['Action', 'Thriller'],
				overview:
					'An ex-hitman comes out of retirement to track down the gangsters who killed his dog and took his car.',
				rating: 7.4,
				poster: 'https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Pd8.jpg',
				reason: 'High-octane action sequences with stylish direction and world-building.'
			});

			recommendations.push({
				title: 'Mission: Impossible - Fallout',
				year: 2018,
				genres: ['Action', 'Adventure', 'Thriller'],
				overview: 'Ethan Hunt and his IMF team race against time after a mission gone wrong.',
				rating: 7.7,
				poster: 'https://image.tmdb.org/t/p/w500/AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg',
				reason: 'Features some of the most impressive practical stunts in recent action cinema.'
			});
		}

		// Comedy-oriented movies
		if (genres.includes('Comedy')) {
			recommendations.push({
				title: 'The Nice Guys',
				year: 2016,
				genres: ['Comedy', 'Crime', 'Action'],
				overview:
					'In 1970s Los Angeles, a mismatched pair of private eyes investigate a missing girl and the mysterious death of a porn star.',
				rating: 7.3,
				poster: 'https://image.tmdb.org/t/p/w500/vNCeqxbKyDHL9LUza03V2Im16wB.jpg',
				reason: 'Sharp dialogue, great chemistry between the leads, and a nostalgic 70s setting.'
			});

			recommendations.push({
				title: 'Thor: Ragnarok',
				year: 2017,
				genres: ['Action', 'Adventure', 'Comedy', 'Fantasy'],
				overview:
					'Thor is imprisoned on the planet Sakaar and must race against time to return to Asgard and stop Ragnarök.',
				rating: 7.9,
				poster: 'https://image.tmdb.org/t/p/w500/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg',
				reason: "Taika Waititi's direction brings a fresh, comedic take to the superhero genre."
			});
		}

		// Horror/Thriller-oriented movies
		if (genres.includes('Horror') || genres.includes('Thriller')) {
			recommendations.push({
				title: 'A Quiet Place',
				year: 2018,
				genres: ['Horror', 'Thriller', 'Science Fiction'],
				overview:
					'A family struggles to survive in a world where most humans have been killed by blind but noise-sensitive creatures.',
				rating: 7.5,
				poster: 'https://image.tmdb.org/t/p/w500/nAU74GmpUk7t5iklEp3bufwDq4n.jpg',
				reason:
					'Creates tension through sound design and visual storytelling rather than jump scares.'
			});

			recommendations.push({
				title: 'The Lighthouse',
				year: 2019,
				genres: ['Horror', 'Fantasy', 'Drama'],
				overview:
					'Two lighthouse keepers try to maintain their sanity while living on a remote and mysterious New England island in the 1890s.',
				rating: 7.5,
				poster: 'https://image.tmdb.org/t/p/w500/5Kb0KAP42CJJ8kH68Pz2GCNMwpF.jpg',
				reason:
					'Robert Pattinson and Willem Dafoe deliver mesmerizing performances in this psychological horror.'
			});
		}

		// Drama-oriented movies
		if (genres.includes('Drama')) {
			recommendations.push({
				title: 'The Father',
				year: 2020,
				genres: ['Drama'],
				overview:
					'A man refuses all assistance from his daughter as he ages. As he tries to make sense of his changing circumstances, he begins to doubt his loved ones, his own mind and even the fabric of his reality.',
				rating: 8.3,
				poster: 'https://image.tmdb.org/t/p/w500/uxWXW1YYQENSv7OzHB4Hds0bK3b.jpg',
				reason:
					'Anthony Hopkins delivers an Oscar-winning performance in this poignant portrayal of dementia.'
			});
		}

		// Sci-Fi-oriented movies
		if (genres.includes('Science Fiction') || genres.includes('Fantasy')) {
			recommendations.push({
				title: 'Dune',
				year: 2021,
				genres: ['Science Fiction', 'Adventure'],
				overview:
					'Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.',
				rating: 8.0,
				poster: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
				reason:
					"Denis Villeneuve's visually stunning adaptation of Frank Herbert's classic sci-fi novel."
			});
		}

		// If we still need more recommendations, add some highly-rated films
		if (recommendations.length < 3) {
			recommendations.push({
				title: 'The Shawshank Redemption',
				year: 1994,
				genres: ['Drama', 'Crime'],
				overview:
					'Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden.',
				rating: 8.7,
				poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
				reason:
					'A timeless classic about hope and redemption, consistently rated as one of the greatest films ever made.'
			});

			recommendations.push({
				title: 'Whiplash',
				year: 2014,
				genres: ['Drama', 'Music'],
				overview:
					"A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
				rating: 8.5,
				poster: 'https://image.tmdb.org/t/p/w500/6uSPcdGMzZNawasVOOEu9YfnFPm.jpg',
				reason:
					'Intense performances from Miles Teller and J.K. Simmons in this riveting examination of artistic perfection.'
			});
		}

		// Create a structured response
		return {
			agent_message: 'Here are some personalized movie recommendations based on your preferences:',
			recommendations: recommendations.slice(0, 5) // Limit to 5 recommendations
		};
	},

	// Create a list from selected movies
	async createListFromSelection(name: string) {
		const state = get(chatStore);

		if (state.selectedMovies.length === 0) {
			return;
		}

		chatStore.setLoading(true);

		try {
			// This would be replaced with an actual API call
			// For now, we'll just simulate success
			console.log(`Creating list "${name}" with movies:`, state.selectedMovies);

			// Add confirmation message
			this.addMessageFromAI({
				type: 'text',
				text: `I've created a list named "${name}" with ${state.selectedMovies.length} selected movies.`
			});

			// Clear selection
			this.clearSelectedMovies();
		} catch (error) {
			console.error('Error creating list:', error);
			this.addMessageFromAI({
				type: 'text',
				text: 'Sorry, I encountered an error creating your list. Please try again.'
			});
			chatStore.setError(error);
		} finally {
			chatStore.setLoading(false);
		}
	}
};

// Create derived stores for convenience
export const currentChat = derived(chatStore, ($state) => {
	return $state.chats.find((chat) => chat.id === $state.currentChatId) || null;
});

export const chatLoading = derived(chatStore, ($state) => $state.loading);
export const chatError = derived(chatStore, ($state) => $state.error);
export const selectedMovies = derived(chatStore, ($state) => $state.selectedMovies);

// Export the chat store API
export default chatApi;
