import { apiClient } from "../api";

export interface ExerciseType {
	id: string;
	name: string;
	metValue: number;
	category: string;
	createdAt: string;
	updatedAt: string;
}

export interface Workout {
	id: string;
	userProfileId: string;
	expeditionId: string | null;
	exerciseType: string;
	duration: number;
	metValue: number;
	points: number;
	isSolo: boolean;
	isPublic: boolean;
	notes: string | null;
	workoutDate: string;
	loggedAt: string;
	createdAt: string;
	updatedAt: string;
	photos: Array<{
		id: string;
		url: string;
		caption: string | null;
		createdAt: string;
	}>;
	expedition?: {
		id: string;
		name: string;
		status: string;
	};
}

export interface CreateWorkoutRequest {
	userProfileId: string;
	expeditionId?: string;
	exerciseType: string;
	duration: number;
	metValue: number;
	points: number;
	isSolo: boolean;
	isPublic: boolean;
	notes?: string;
	workoutDate: string;
}

export interface UpdateWorkoutRequest {
	duration?: number;
	metValue?: number;
	points?: number;
	notes?: string;
	isPublic?: boolean;
}

export interface CalculatePointsRequest {
	duration: number;
	metValue: number;
	userProfileId: string;
	isSolo: boolean;
}

export interface CalculatePointsResponse {
	basePoints: number;
	finalPoints: number;
	multiplier: number;
}

export const workoutService = {
	// Get user's workouts
	getUserWorkouts: async (
		userProfileId: string,
		expeditionId?: string,
	): Promise<Workout[]> => {
		const params = new URLSearchParams();
		if (expeditionId) {
			params.append("expeditionId", expeditionId);
		}

		const response = await apiClient.get<Workout[]>(
			`/workouts/user/${userProfileId}?${params.toString()}`,
		);
		return response.data;
	},

	// Create new workout
	create: async (data: CreateWorkoutRequest): Promise<Workout> => {
		const response = await apiClient.post<Workout>("/workouts", data);
		return response.data;
	},

	// Update workout
	update: async (id: string, data: UpdateWorkoutRequest): Promise<Workout> => {
		const response = await apiClient.patch<Workout>(`/workouts/${id}`, data);
		return response.data;
	},

	// Delete workout
	delete: async (id: string): Promise<{ message: string }> => {
		const response = await apiClient.delete<{ message: string }>(
			`/workouts/${id}`,
		);
		return response.data;
	},

	// Calculate points for a workout
	calculatePoints: async (
		data: CalculatePointsRequest,
	): Promise<CalculatePointsResponse> => {
		const response = await apiClient.post<CalculatePointsResponse>(
			"/workouts/calculate-points",
			data,
		);
		return response.data;
	},
};
