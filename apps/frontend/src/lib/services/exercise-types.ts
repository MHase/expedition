import { apiClient } from "../api";

export interface ExerciseType {
	id: string;
	name: string;
	metValue: number;
	category: string;
	createdAt: string;
	updatedAt: string;
}

export const exerciseTypeService = {
	// Get all exercise types
	getAll: async (): Promise<ExerciseType[]> => {
		const response = await apiClient.get<ExerciseType[]>("/exercise-types");
		return response.data;
	},

	// Seed exercise types (for development)
	seed: async (): Promise<{ message: string; count: number }> => {
		const response = await apiClient.post<{ message: string; count: number }>(
			"/exercise-types/seed",
		);
		return response.data;
	},
};
