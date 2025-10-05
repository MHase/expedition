import { apiClient } from "../api";

export interface CharacterClass {
	id: string;
	name: string;
	description: string;
	perks: string[];
	soloMultiplier: number;
	groupMultiplier: number;
	createdAt: string;
	updatedAt: string;
}

export interface CharacterClassResponse {
	id: string;
	name: string;
	description: string;
	perks: string; // JSON string from API
	soloMultiplier: number;
	groupMultiplier: number;
	createdAt: string;
	updatedAt: string;
}

// Transform API response to include parsed perks
const transformCharacterClass = (
	data: CharacterClassResponse,
): CharacterClass => ({
	...data,
	perks: JSON.parse(data.perks),
});

export const characterClassService = {
	// Get all character classes
	getAll: async (): Promise<CharacterClass[]> => {
		const response =
			await apiClient.get<CharacterClassResponse[]>("/character-classes");
		return response.data.map(transformCharacterClass);
	},

	// Get character class by ID
	getById: async (id: string): Promise<CharacterClass> => {
		const response = await apiClient.get<CharacterClassResponse>(
			`/character-classes/${id}`,
		);
		return transformCharacterClass(response.data);
	},

	// Seed character classes (for development)
	seed: async (): Promise<{ message: string; count: number }> => {
		const response = await apiClient.post<{ message: string; count: number }>(
			"/character-classes/seed",
		);
		return response.data;
	},
};
