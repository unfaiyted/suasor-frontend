export interface OnboardingData {
	// Media type preferences
	mediaTypes?: MediaTypes;
	// AI personality preference
	aiPersonality?: string;
	// Account linking selections
	accountsToLink?: AccountsToLink;
	// Flag to track if user skipped account linking
	skipAccountLinking?: boolean;
	// Account data with API keys, credentials, etc.
	accountData?: Record<string, any>;
	// Selected genres
	genres?: Genres;
	// Recommendation preferences
	recommendationFrequency?: string;
	automateRecommendations?: boolean;
}

export interface CompleteOnboardingData {
	mediaTypes: MediaTypes;
	aiPersonality: string;
	accountsToLink: AccountsToLink;
	skipAccountLinking: boolean;
	accountData: Record<string, any>;
	genres: Genres;
	recommendationFrequency: string;
	automateRecommendations: boolean;
}

export interface MediaTypes {
	movies: boolean;
	tvShows: boolean;
	music: boolean;
}

export interface Genres {
	movies: string[];
	tvShows: string[];
	music: string[];
}

export interface AccountsToLink {
	mediaApplications: string[];
	mediaTrackers: string[];
	automationTools: string[];
	aiEngines: string[];
}
