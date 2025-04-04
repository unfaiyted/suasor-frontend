// src/lib/stores/chat.ts
import { writable, derived, get } from 'svelte/store';
import { createBaseStore } from './base';
import { GET, POST } from '$lib/api/client';
import type {
	ErrorResponse,
	ClientResponse,
	ClientType,
	MediaType
} from '$lib/api/types';

// Define these interfaces locally since they're commented out in types.ts
interface GenerateTextRequest {
	prompt: string;
	systemInstructions?: string;
	maxTokens?: number;
	temperature?: number;
}

interface GenerateStructuredRequest {
	prompt: string;
	systemInstructions?: string;
	maxTokens?: number;
	temperature?: number;
}
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
	mediaClients: ClientResponse[];
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
	currentAiClientId: null,
	mediaClients: []
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
			// Get all clients
			const response = await GET('/clients', {});

			if (response.data?.data) {
				// Filter for AI clients (type claude, openai, ollama)
				const aiClientTypes: string[] = ['claude', 'openai', 'ollama', 'gemini'];
				const aiClients = response.data.data.filter(
					(client) => client.clientType && aiClientTypes.includes(client.clientType)
				);

				// Filter for media clients (plex, emby, etc.)
				const mediaClientTypes: string[] = ['plex', 'emby', 'jellyfin', 'subsonic'];
				const mediaClients = response.data.data.filter(
					(client) => client.clientType && mediaClientTypes.includes(client.clientType)
				);

				chatStore.update((state) => ({
					...state,
					aiClients: aiClients,
					// Use the first AI client if available, or use the default
					currentAiClientId: aiClients.length > 0 ? aiClients[0].id : DEFAULT_AI_CLIENT.id,
					mediaClients: mediaClients,
					loading: false
				}));
			} else {
				// Use a default AI client for development/testing
				console.warn('No AI clients found, using default for development');
				chatStore.update((state) => ({
					...state,
					aiClients: [DEFAULT_AI_CLIENT],
					currentAiClientId: DEFAULT_AI_CLIENT.id,
					mediaClients: [],
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
				mediaClients: [],
				loading: false
			}));
			chatStore.setError(error);
		}
	},
	
	// Set the current AI client
	setCurrentAiClient(clientId: number) {
		chatStore.update((state) => ({
			...state,
			currentAiClientId: clientId
		}));
	},

	// Start a new chat session
	async startNewChat() {
		const state = get(chatStore);
		// Import the conversation store
		const conversationStore = (await import('./conversation')).default;

		// Save current chat if it exists
		if (state.currentChatId && state.messages.length > 0) {
			this.saveCurrentChat();
		}

		chatStore.setLoading(true);

		try {
			if (!state.currentAiClientId) {
				throw new Error("No AI client is configured");
			}
			
			// Create a timestamp
			const timestamp = new Date().toISOString();
			
			// Use the conversation store to start a new conversation
			const result = await conversationStore.startConversation(state.currentAiClientId, {
				favoriteGenres: ["sci-fi", "thriller", "drama"],
				recentlyWatched: []
			});

			const { conversationId, welcome } = result;

			// Create a new chat
			chatStore.update((state) => ({
				...state,
				currentChatId: conversationId,
				messages: [],
				selectedMovies: [],
				chats: [
					{
						id: conversationId,
						title: `New Chat`,
						timestamp,
						messages: [],
						recommendations: []
					},
					...state.chats
				]
			}));

			// Add welcome message from the API
			this.addMessageFromAI({
				type: 'text',
				text: welcome || "Hi! I'm your movie recommendation assistant. What kind of movies do you enjoy watching?"
			});

		} catch (error) {
			console.error('Error starting new chat:', error);
			
			// Fallback to creating a local chat if API fails
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

			// Add error message
			this.addMessageFromAI({
				type: 'text',
				text: "Hi! I'm your movie recommendation assistant. There was an issue connecting to the AI service, but I'll do my best to help you."
			});
		} finally {
			chatStore.setLoading(false);
		}
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
		// Import the conversation store
		const conversationStore = (await import('./conversation')).default;

		if (!message.trim() && state.selectedMovies.length === 0) {
			return; // Don't send empty messages
		}

		// Prepare message content
		let messageContent: MessageContent;
		let apiMessage: string;

		if (message.trim()) {
			// Text message
			messageContent = {
				type: 'text',
				text: message
			};
			apiMessage = message;
		} else {
			// Movie selection - format as text for the API
			const movieList = state.selectedMovies
				.map(m => `${m.title} (${m.year}) - ${m.genres.join(', ')}`)
				.join('\n');
			
			messageContent = {
				type: 'movieList',
				text: "I'd like recommendations based on these movies:",
				movies: [...state.selectedMovies]
			};
			apiMessage = `I'd like recommendations based on these movies:\n${movieList}`;
		}

		// Add user message to chat
		this.addMessageFromUser(messageContent);

		// Clear input and selected movies after sending
		if (state.selectedMovies.length > 0) {
			this.clearSelectedMovies();
		}

		chatStore.setLoading(true);

		try {
			if (!state.currentChatId || !state.currentAiClientId) {
				throw new Error("Chat session not initialized");
			}

			// Use the conversation store to send the message
			const result = await conversationStore.sendMessage(apiMessage);
			
			const { message: aiMessage, recommendations } = result;

			// First add the text message
			this.addMessageFromAI({
				type: 'text',
				text: aiMessage
			});

			// If there are recommendations, add them as a separate message
			if (recommendations && recommendations.length > 0) {
				// Convert API recommendations to our Movie format using the conversationStore helper
				const movieRecommendations = conversationStore.convertRecommendationsToMovies(recommendations);

				this.addMessageFromAI({
					type: 'movieList',
					text: 'Here are some movies you might enjoy:',
					movies: movieRecommendations
				});
			}
		} catch (error) {
			console.error('Error sending message to conversation:', error);
			
			// Fallback to the previous implementation if the conversation API fails
			try {
				await this.generateAiResponse(messageContent);
			} catch (fallbackError) {
				console.error('Error in fallback response generation:', fallbackError);
				this.addMessageFromAI({
					type: 'text',
					text: 'Sorry, I encountered an error communicating with the AI service. Please try again.'
				});
			}
		} finally {
			chatStore.setLoading(false);
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

	// Simplified fallback API for when conversation endpoints fail
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
			// First add a basic text response
			const responseText = this.simulateAiResponse(latestMessage, false);
			this.addMessageFromAI({
				type: 'text',
				text: responseText
			});

			// If this was a recommendation request, add some basic recommendations
			if (latestMessage.type === 'movieList' || 
			    (latestMessage.type === 'text' && latestMessage.text?.toLowerCase().includes('movie'))) {
				
				// Try to call the direct API
				try {
					const textRequest = {
						prompt: `Recommend 3 movies based on user preferences. Return as JSON with title, year, genres, overview, and rating.`,
						maxTokens: 1500,
						systemInstructions: `You are a helpful movie recommendation assistant.`
					};

					const response = await POST(`/ai/generate-structured/${state.currentAiClientId}` as any, {
						body: textRequest
					});

					if (response.data?.json) {
						// Process the real API response
						try {
							const structuredData = JSON.parse(response.data.json);
							const { movies, agentMessage } = this.convertStructuredResponseToMovies(structuredData);
							
							if (movies.length > 0) {
								this.addMessageFromAI({
									type: 'movieList',
									text: agentMessage || "Here are some recommendations:",
									movies: movies
								});
							}
						} catch (parseError) {
							console.error('Error parsing structured response:', parseError);
						}
					}
				} catch (apiError) {
					console.warn('API call failed in fallback mode:', apiError);
				}
			}

			chatStore.setLoading(false);
		} catch (error) {
			console.error('Error in fallback AI response:', error);
			this.addMessageFromAI({
				type: 'text',
				text: 'Sorry, I encountered an error processing your request. Please try again.'
			});
			chatStore.setError(error);
			chatStore.setLoading(false);
		}
	},
	
	// Enhance AI recommendations with data from media clients
	async enhanceRecommendationsWithMediaData(recommendationData: any, mediaClientId: number) {
		try {
			if (!recommendationData || !recommendationData.recommendations || !mediaClientId) {
				return null;
			}
			
			// Extract titles from the AI recommendations
			const titles = recommendationData.recommendations.map((rec: any) => rec.title);
			
			// Query the media client for these titles
			const response = await POST(`/media/${mediaClientId}/search`, {
				body: { query: titles.join(','), mediaType: 'movie', limit: 10 }
			});
			
			if (!response.data || !response.data.data) {
				return null;
			}
			
			// Get the media search results
			const mediaResults = response.data.data;
			
			// Create a map of title -> media item for fast lookup
			const mediaMap = new Map();
			mediaResults.forEach((item: any) => {
				// Normalize the title for comparison
				const normalizedTitle = item.title.toLowerCase().trim();
				mediaMap.set(normalizedTitle, item);
			});
			
			// Enhance each recommendation with real media data when available
			const enhancedRecommendations = recommendationData.recommendations.map((rec: any) => {
				const normalizedRecTitle = rec.title.toLowerCase().trim();
				
				// Look for exact or close matches
				const mediaItem = mediaMap.get(normalizedRecTitle);
				
				if (mediaItem) {
					// Enhance with real media data
					return {
						...rec,
						id: mediaItem.id || rec.id || `rec-${Date.now()}`,
						poster: mediaItem.poster || rec.poster,
						year: mediaItem.year || rec.year,
						genres: mediaItem.genres || rec.genres,
						rating: mediaItem.rating || rec.rating,
						overview: mediaItem.overview || rec.overview,
						// Keep the AI's reason for recommending
						reason: rec.reason
					};
				}
				
				// If no match found, return the original recommendation
				return rec;
			});
			
			// Return the enhanced data structure
			return {
				...recommendationData,
				recommendations: enhancedRecommendations
			};
		} catch (error) {
			console.error('Error enhancing recommendations:', error);
			return null; // Return null to indicate enhancement failed
		}
	},

	// Simplified fallback response generator for when the API is unavailable
	simulateAiResponse(latestMessage: MessageContent, forRecommendation: boolean = true): string {
		if (latestMessage.type === 'text') {
			return "I'm sorry, but I wasn't able to connect to the movie recommendation service. Could you try again later?";
		} else if (latestMessage.type === 'movieList') {
			// Basic response for movie selection
			const movieCount = latestMessage.movies?.length || 0;
			return `I see you've selected ${movieCount} movie(s), but I'm having trouble connecting to the recommendation service. Please try again in a few moments.`;
		}
		return "I'm having trouble processing your request. Please try again later.";
	},

	// Simplified fallback structured response for when the API is unavailable
	simulateStructuredResponse(latestMessage: MessageContent): any {
		return {
			agent_message: "I'm sorry, but I couldn't connect to the movie database at the moment.",
			recommendations: []
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
export const aiClients = derived(chatStore, ($state) => $state.aiClients);
export const currentAiClient = derived(chatStore, ($state) => {
	if (!$state.currentAiClientId) return null;
	return $state.aiClients.find(client => client.id === $state.currentAiClientId) || null;
});
export const mediaClients = derived(chatStore, ($state) => $state.mediaClients);

// Export the chat store API
export default chatApi;