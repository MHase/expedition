import { apiClient } from "../api";
import type { CharacterClass } from "./character-classes";

// Transform API response to include parsed character class perks
const transformUserProfile = (
	data: UserProfile & { characterClass?: { perks: string | string[] } },
): UserProfile => ({
	...data,
	characterClass: data.characterClass
		? {
				...data.characterClass,
				perks:
					typeof data.characterClass.perks === "string"
						? JSON.parse(data.characterClass.perks)
						: data.characterClass.perks,
			}
		: null,
});

export interface UserProfile {
	id: string;
	userId: string;
	characterClassId: string | null;
	totalPoints: number;
	level: number;
	createdAt: string;
	updatedAt: string;
	characterClass: CharacterClass | null;
	expeditions: Array<{
		id: string;
		pointsEarned: number;
		isActive: boolean;
		joinedAt: string;
		expedition: {
			id: string;
			name: string;
			status: string;
			targetPoints: number;
			startDate: string;
			endDate: string;
		};
	}>;
	workouts: Array<{
		id: string;
		exerciseType: string;
		duration: number;
		points: number;
		workoutDate: string;
		createdAt: string;
	}>;
	artifacts: Array<{
		id: string;
		earnedAt: string;
		expeditionId: string | null;
		artifact: {
			id: string;
			name: string;
			description: string;
			rarity: string;
			imageUrl: string | null;
		};
	}>;
}

export interface CreateUserProfileRequest {
	userId: string;
	characterClassId: string;
}

export interface UpdateUserProfileRequest {
	totalPoints?: number;
	level?: number;
	characterClassId?: string;
}

export const userProfileService = {
	// Get user profile by user ID
	getByUserId: async (userId: string): Promise<UserProfile> => {
		const response = await apiClient.get<
			UserProfile & { characterClass?: { perks: string | string[] } }
		>(`/user-profiles/${userId}`);
		return transformUserProfile(response.data);
	},

	// Create or update user profile
	createOrUpdate: async (
		data: CreateUserProfileRequest,
	): Promise<UserProfile> => {
		const response = await apiClient.post<
			UserProfile & { characterClass?: { perks: string | string[] } }
		>("/user-profiles", data);
		return transformUserProfile(response.data);
	},

	// Update user profile
	update: async (
		userId: string,
		data: UpdateUserProfileRequest,
	): Promise<UserProfile> => {
		const response = await apiClient.patch<
			UserProfile & { characterClass?: { perks: string | string[] } }
		>(`/user-profiles/${userId}`, data);
		return transformUserProfile(response.data);
	},
};
