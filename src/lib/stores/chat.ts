// src/lib/stores/chat.ts
import { writable, derived, get } from 'svelte/store';
import { createBaseStore, BaseApiState } from './base';
import { GET, POST } from '$lib/api/client';
import type { 
  GenerateTextRequest, 
  GenerateTextResponse, 
  APIGenerateTextResponse,
  ErrorResponse,
  ClientResponse,
  ClientType
} from '$lib/api/types';
import type { Movie, Chat, Message, MessageContent } from '$lib/components/chat/types';

// Define the chat store state interface
interface ChatState extends BaseApiState {
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
          client => client.clientType && aiClientTypes.includes(client.clientType)
        );
        
        chatStore.update(state => ({
          ...state,
          aiClients: aiClients,
          // Use the first AI client if available, or use the default
          currentAiClientId: aiClients.length > 0 ? aiClients[0].id : DEFAULT_AI_CLIENT.id,
          loading: false
        }));
      } else {
        // Use a default AI client for development/testing
        console.warn('No AI clients found, using default for development');
        chatStore.update(state => ({
          ...state,
          aiClients: [DEFAULT_AI_CLIENT],
          currentAiClientId: DEFAULT_AI_CLIENT.id,
          loading: false
        }));
      }
    } catch (error) {
      console.error('Error loading AI clients:', error);
      // Use default client for development/testing
      chatStore.update(state => ({
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
    
    chatStore.update(state => ({
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
    chatStore.update(state => {
      if (!state.currentChatId) return state;
      
      const currentChatIndex = state.chats.findIndex(chat => chat.id === state.currentChatId);
      if (currentChatIndex === -1) return state;
      
      // Extract recommendations from AI messages
      const recommendations = state.messages
        .filter(m => m.sender === 'ai' && m.content.type === 'movieList' && m.content.movies)
        .flatMap(m => m.content.movies || []);
      
      // Update chat with current messages and extracted recommendations
      const updatedChats = [...state.chats];
      updatedChats[currentChatIndex] = {
        ...updatedChats[currentChatIndex],
        messages: [...state.messages],
        recommendations,
        // Update title based on first user message if available
        title: state.messages
          .find(m => m.sender === 'user' && m.content.type === 'text')
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
    
    chatStore.update(state => {
      const selectedChat = state.chats.find(chat => chat.id === chatId);
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
    chatStore.update(state => {
      const selectedIndex = state.selectedMovies.findIndex(m => m.id === movie.id);
      
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
          selectedMovies: state.selectedMovies.filter(m => m.id !== movie.id)
        };
      }
    });
  },
  
  // Clear selected movies
  clearSelectedMovies() {
    chatStore.update(state => ({
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
    
    chatStore.update(state => ({
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
    
    chatStore.update(state => ({
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
        text: "Sorry, I encountered an error. Please try again."
      });
    }
  },
  
  // Generate AI response based on chat history
  async generateAiResponse(latestMessage: MessageContent) {
    const state = get(chatStore);
    
    if (!state.currentAiClientId) {
      this.addMessageFromAI({
        type: 'text',
        text: "Sorry, no AI client is configured. Please set up an AI client in settings."
      });
      return;
    }
    
    chatStore.setLoading(true);
    
    try {
      // Format context from conversation history
      const conversationHistory = state.messages.map(msg => {
        const role = msg.sender === 'user' ? 'user' : 'assistant';
        let content = '';
        
        if (msg.content.type === 'text') {
          content = msg.content.text || '';
        } else if (msg.content.type === 'movieList') {
          const movieList = msg.content.movies?.map(m => 
            `- ${m.title} (${m.year}) - ${m.genres.join(', ')}`
          ).join('\n');
          
          content = msg.content.text 
            ? `${msg.content.text}\n${movieList}`
            : movieList || '';
        }
        
        return `${role}: ${content}`;
      }).join('\n');
      
      // Add the latest message if it's from the user
      let prompt = '';
      
      if (latestMessage.type === 'text') {
        prompt = `${conversationHistory}\n\nPlease respond to the user's request for movie recommendations.`;
      } else {
        // For movie selections, create a more specific prompt
        const movieTitles = latestMessage.movies?.map(m => m.title).join(', ');
        prompt = `${conversationHistory}\n\nBased on the user's selected movies (${movieTitles}), suggest 3-5 similar movies with title, year, and a brief explanation of why they would enjoy each one. Format your response as natural text.`;
      }
      
      // Prepare the request
      const request: GenerateTextRequest = {
        prompt,
        maxTokens: 1000,
        systemInstructions: "You are a helpful movie recommendation assistant. You know about movies, actors, directors, and genres. When recommending movies, include their title, year, and a brief reason for the recommendation. Keep responses conversational and engaging."
      };
      
      // In development, we'll simulate the response for testing
      // In production, we would use the actual AI client with:
      // const response = await POST(`/ai/generate/${state.currentAiClientId}`, { body: request });
      
      // Simulate AI response for development/testing
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // For demonstration, provide a simulated movie recommendation
      const simulatedAiResponse = this.simulateAiResponse(latestMessage);
      
      // Add the response to the chat
      this.addMessageFromAI({
        type: 'text',
        text: simulatedAiResponse
      });

      // Add movie recommendations in a separate message
      if (latestMessage.type === 'movieList' || latestMessage.type === 'text') {
        // In development, provide sample movie recommendations
        // In production, we would parse the AI response or use a structured endpoint
        const sampleRecommendations: Movie[] = [
          {
            id: 'rec1',
            title: 'Parasite',
            year: 2019,
            type: 'movie',
            poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
            genres: ['Comedy', 'Thriller', 'Drama'],
            rating: 8.5,
            overview: 'A poor family cons their way into becoming the servants of a rich family...'
          },
          {
            id: 'rec2',
            title: 'The Banshees of Inisherin',
            year: 2022,
            type: 'movie',
            poster: 'https://image.tmdb.org/t/p/w500/4yFG6cSPaCaPhyJ1vtGOtMD1lgh.jpg',
            genres: ['Comedy', 'Drama'],
            rating: 7.7,
            overview: 'Two lifelong friends find themselves at an impasse when one abruptly ends their relationship...'
          }
        ];
        
        this.addMessageFromAI({
          type: 'movieList',
          movies: sampleRecommendations
        });
      }
      
      chatStore.setLoading(false);
    } catch (error) {
      console.error('Error generating AI response:', error);
      this.addMessageFromAI({
        type: 'text',
        text: "Sorry, I encountered an error processing your request. Please try again."
      });
      chatStore.setError(error);
      chatStore.setLoading(false);
    }
  },
  
  // Simulate AI response for development/testing
  simulateAiResponse(latestMessage: MessageContent): string {
    if (latestMessage.type === 'text') {
      const text = latestMessage.text?.toLowerCase() || '';
      
      if (text.includes('action') || text.includes('adventure')) {
        return "Based on your interest in action and adventure films, I'd recommend these movies:\n\n" +
          "1. **Mad Max: Fury Road (2015)** - A high-octane post-apocalyptic adventure with stunning visuals and practical effects.\n\n" +
          "2. **Top Gun: Maverick (2022)** - Not only does it deliver thrilling aerial sequences, but it also has emotional depth that the original lacked.\n\n" +
          "3. **The Woman King (2022)** - Features incredible battle choreography and a powerful story based on the all-female warrior unit that protected the African Kingdom of Dahomey.";
      } else if (text.includes('comedy') || text.includes('funny')) {
        return "If you're looking for comedies, here are some great options:\n\n" +
          "1. **Barbie (2023)** - A surprisingly thoughtful comedy that balances social commentary with genuine laughs.\n\n" +
          "2. **The Grand Budapest Hotel (2014)** - Wes Anderson's meticulously crafted comedy with amazing performances by Ralph Fiennes and a stellar supporting cast.\n\n" +
          "3. **What We Do in the Shadows (2014)** - This mockumentary about vampire roommates is consistently hilarious with its deadpan humor.";
      } else if (text.includes('horror') || text.includes('scary')) {
        return "For horror fans, I recommend:\n\n" +
          "1. **Hereditary (2018)** - A deeply unsettling psychological horror that builds dread masterfully.\n\n" +
          "2. **Get Out (2017)** - Jordan Peele's social thriller combines genuine scares with sharp social commentary.\n\n" +
          "3. **The Witch (2015)** - A slow-burning period piece with incredible attention to historical detail and a truly haunting atmosphere.";
      } else {
        return "I'd be happy to recommend some movies! Could you tell me what genres or types of films you enjoy the most? For example, do you prefer action, comedy, drama, sci-fi, or something else? Or maybe you have some favorite directors or actors?";
      }
    } else if (latestMessage.type === 'movieList') {
      // Recommendation based on selected movies
      return "Based on your selected movies, I think you'd enjoy these films that share similar themes, visual styles, or narrative approaches:";
    }
    
    return "I'm not sure what kind of movies you're looking for. Could you tell me more about your preferences?";
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
        text: "Sorry, I encountered an error creating your list. Please try again."
      });
      chatStore.setError(error);
    } finally {
      chatStore.setLoading(false);
    }
  }
};

// Create derived stores for convenience
export const currentChat = derived(chatStore, $state => {
  return $state.chats.find(chat => chat.id === $state.currentChatId) || null;
});

export const chatLoading = derived(chatStore, $state => $state.loading);
export const chatError = derived(chatStore, $state => $state.error);
export const selectedMovies = derived(chatStore, $state => $state.selectedMovies);

// Export the chat store API
export default chatApi;