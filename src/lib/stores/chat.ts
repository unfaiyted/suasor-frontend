// src/lib/stores/chat.ts
import { writable, derived, get } from 'svelte/store';
import { createBaseStore, BaseApiState } from './base';
import { GET, POST } from '$lib/api/client';
import type { 
  GenerateTextRequest, 
  GenerateTextResponse, 
  APIGenerateTextResponse,
  ErrorResponse 
} from '$lib/api/types';
import type { Movie, Chat, Message, MessageContent } from '$lib/components/chat/types';

// Define the chat store state interface
interface ChatState extends BaseApiState {
  chats: Chat[];
  currentChatId: string | null;
  messages: Message[];
  selectedMovies: Movie[];
  aiClients: { id: number; name: string; type: string }[];
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

// Add chat-specific methods
const chatApi = {
  ...chatStore,
  
  // Load available AI clients
  async loadAiClients() {
    chatStore.setLoading(true);
    try {
      const response = await GET('/clients/ai', {});
      
      if (response.data?.data) {
        chatStore.update(state => ({
          ...state,
          aiClients: response.data.data,
          currentAiClientId: response.data.data.length > 0 ? response.data.data[0].id : null,
          loading: false
        }));
      } else {
        throw new Error('Failed to load AI clients');
      }
    } catch (error) {
      console.error('Error loading AI clients:', error);
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
    
    // Call the AI API
    await this.generateAiResponse(messageContent);
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
      
      // Send the request to the AI
      const response = await POST(`/ai/generate/${state.currentAiClientId}`, {
        body: request
      });
      
      if (response.data?.data?.text) {
        const aiResponse = response.data.data.text;
        
        // Process the response to extract movie recommendations
        // This is a simplified version - in a real implementation, you might want to 
        // parse the AI response to extract structured movie data
        
        // For now, we'll just add the text response
        this.addMessageFromAI({
          type: 'text',
          text: aiResponse
        });
      } else {
        throw new Error('Failed to generate AI response');
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      this.addMessageFromAI({
        type: 'text',
        text: "Sorry, I encountered an error processing your request. Please try again."
      });
      chatStore.setError(error);
    } finally {
      chatStore.setLoading(false);
    }
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