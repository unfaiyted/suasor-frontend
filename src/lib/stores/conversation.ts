// src/lib/stores/conversation.ts
import { writable, derived, get } from 'svelte/store';
import { POST } from '$lib/api/client';
import type { Movie } from '$lib/components/chat/types';
import type { Artwork } from '$lib/api/types';

// Define interfaces
interface ConversationState {
  isActive: boolean;
  conversationId: string | null;
  clientId: number | null;
  clientType: string;
  contentType: string;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ConversationState = {
  isActive: false,
  conversationId: null,
  clientId: null,
  clientType: 'claude',
  contentType: 'movie',
  loading: false,
  error: null
};

// Create the store
function createConversationStore() {
  const { subscribe, set, update } = writable<ConversationState>(initialState);

  return {
    subscribe,
    
    // Start a new conversation
    async startConversation(clientId: number, preferences = {}) {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        // Prepare request data
        const startRequest = {
          contentType: "movie",
          preferences: {
            favoriteGenres: ["sci-fi", "thriller", "drama"],
            ...preferences
          },
          clientType: "claude",
          clientId,
          systemInstructions: "You are a concise film critic who specializes in personalized movie recommendations. Keep your responses brief and to the point. When making recommendations:\n\n1. Recommend just 1-3 highly relevant movies unless the user specifically asks for more options\n2. For each recommendation, include ONE concise sentence explaining why this movie would appeal to the user based on their stated preferences\n3. Focus on quality over quantity in your recommendations\n4. Keep your overall responses short and direct, under 3 sentences when possible\n5. Avoid lengthy introductions and unnecessary explanations"
        };
        
        // Call the conversation start endpoint
        const response = await POST(`/ai/claude/conversation/start` as any, {
          body: startRequest
        });
        
        if (!response.data?.data?.conversationId) {
          throw new Error("Failed to start conversation");
        }
        
        const { conversationId } = response.data.data;
        
        // Update store with the new conversation data
        update(state => ({
          ...state,
          isActive: true,
          conversationId,
          clientId,
          loading: false
        }));
        
        return {
          conversationId,
          welcome: response.data.data.welcome
        };
      } 
      catch (error) {
        console.error('Error starting conversation:', error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
        throw error;
      }
    },
    
    // Send a message in an existing conversation
    async sendMessage(message: string) {
      const state = get({ subscribe });
      
      if (!state.conversationId || !state.clientId) {
        throw new Error("No active conversation");
      }
      
      update(s => ({ ...s, loading: true, error: null }));
      
      try {
        // Prepare the message request
        const messageRequest = {
          conversationId: state.conversationId,
          message,
          clientId: state.clientId,
          context: {
            extractRecommendations: true
          }
        };
        
        // Call the conversation message endpoint
        const response = await POST(`/ai/claude/conversation/message` as any, {
          body: messageRequest
        });
        
        if (!response.data?.data?.message) {
          throw new Error("Failed to get AI response");
        }
        
        update(s => ({ ...s, loading: false }));
        
        // Return the response data
        return {
          message: response.data.data.message,
          recommendations: response.data.data.recommendations || []
        };
      } 
      catch (error) {
        console.error('Error sending message to conversation:', error);
        update(s => ({ 
          ...s, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
        throw error;
      }
    },
    
    // Helper to convert API recommendations to Movie objects
    convertRecommendationsToMovies(recommendations: any[]): Movie[] {
      if (!recommendations || !Array.isArray(recommendations)) {
        return [];
      }
      
      return recommendations.map((rec: any, index: number) => {
        // Handle both API structure and simple structure
        const details = rec.Details || rec;
        const artwork: Artwork = details.Artwork || details;
        
        return {
          id: rec.id || `rec-${index}-${Date.now()}`,
          type: 'movie',
          // Map API fields to frontend fields
          title: details.title || 'Unknown Title',
          year: details.releaseYear || new Date().getFullYear(),
          poster: artwork.poster || `https://via.placeholder.com/300x450.png?text=${encodeURIComponent(details.title || 'Movie')}`,
          backdrop: artwork.background,
          genres: details.genres || [],
          rating: typeof details.userRating === 'number' ? details.userRating : (details.Ratings?.imdb || 0),
          overview: details.description || 'No description available.',
          reason: rec.reason || '',
          // Store original data structure
          Details: rec.Details
        };
      });
    },
    
    // Reset the conversation state
    reset() {
      set(initialState);
    }
  };
}

// Create and export the store
const conversationStore = createConversationStore();
export default conversationStore;

// Derived stores
export const isConversationActive = derived(conversationStore, $state => $state.isActive);
export const conversationLoading = derived(conversationStore, $state => $state.loading);
export const conversationError = derived(conversationStore, $state => $state.error);