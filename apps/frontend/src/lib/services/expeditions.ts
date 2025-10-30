import { apiClient } from "../api";
import type { CharacterClass } from "./character-classes";

export interface Expedition {
	id: string;
	name: string;
	description: string | null;
	targetPoints: number;
	duration: number;
	isPublic: boolean;
	inviteCode: string | null;
	startDate: string;
	endDate: string;
	status: "upcoming" | "active" | "completed" | "failed";
	createdById: string;
	createdAt: string;
	updatedAt: string;
	participants: Array<{
		id: string;
		pointsEarned: number;
		isActive: boolean;
		joinedAt: string;
		userProfile: {
			id: string;
			userId: string;
			userName?: string | null;
			totalPoints: number;
			level: number;
			characterClass: CharacterClass | null;
		};
	}>;
	creator: {
		id: string;
		userId: string;
		userName?: string | null;
		totalPoints: number;
		level: number;
		characterClass: CharacterClass | null;
	};
	workouts?: Array<{
		id: string;
		exerciseType: string;
		duration: number;
		points: number;
		workoutDate: string;
		createdAt: string;
		userProfile: {
			id: string;
			userId: string;
			characterClass: CharacterClass | null;
		};
		photos: Array<{
			id: string;
			url: string;
			caption: string | null;
		}>;
	}>;
}

export interface CreateExpeditionRequest {
	name: string;
	description?: string;
	targetPoints: number;
	duration: number;
	isPublic: boolean;
	startDate: string;
	createdById: string;
}

export interface JoinExpeditionRequest {
	userProfileId: string;
	inviteCode?: string;
}

export interface LeaveExpeditionRequest {
	userProfileId: string;
}

export interface UserExpedition {
	id: string;
	pointsEarned: number;
	isActive: boolean;
	joinedAt: string;
	userProfile: {
		id: string;
		userId: string;
		userName?: string | null;
		totalPoints: number;
		level: number;
		characterClass: CharacterClass | null;
	};
}

export interface ExpeditionProgress {
	expedition: Expedition;
	totalPoints: number;
	targetPoints: number;
	progressPercentage: number;
	participantCount: number;
	recentWorkouts: Array<{
		id: string;
		exerciseType: string;
		duration: number;
		points: number;
		workoutDate: string;
		createdAt: string;
		userProfile: {
			id: string;
			userId: string;
			userName?: string | null;
			characterClass: CharacterClass | null;
		};
	}>;
}

export const expeditionService = {
	// Get all public expeditions
	getPublic: async (): Promise<Expedition[]> => {
		const response = await apiClient.get<Expedition[]>("/expeditions/public");
		return response.data;
	},

	// Get expedition by ID
	getById: async (id: string): Promise<Expedition> => {
		const response = await apiClient.get<Expedition>(`/expeditions/${id}`);
		return response.data;
	},

	// Create new expedition
	create: async (data: CreateExpeditionRequest): Promise<Expedition> => {
		const response = await apiClient.post<Expedition>("/expeditions", data);
		return response.data;
	},

	// Join expedition
	join: async (
		id: string,
		data: JoinExpeditionRequest,
	): Promise<{ message: string }> => {
		const response = await apiClient.post<{ message: string }>(
			`/expeditions/${id}/join`,
			data,
		);
		return response.data;
	},

	// Join expedition by invite code
	joinByCode: async (data: {
		userProfileId: string;
		inviteCode: string;
	}): Promise<{ message: string }> => {
		const response = await apiClient.post<{ message: string }>(
			"/expeditions/join-by-code",
			data,
		);
		return response.data;
	},

	// Leave expedition
	leave: async (
		id: string,
		data: LeaveExpeditionRequest,
	): Promise<{ message: string }> => {
		const response = await apiClient.delete<{ message: string }>(
			`/expeditions/${id}/leave`,
			{
				data,
			},
		);
		return response.data;
	},

	// Get user's expeditions
	getUserExpeditions: async (
		userProfileId: string,
	): Promise<
		Array<{
			id: string;
			pointsEarned: number;
			isActive: boolean;
			joinedAt: string;
			expedition: Expedition;
		}>
	> => {
		const response = await apiClient.get<
			Array<{
				id: string;
				pointsEarned: number;
				isActive: boolean;
				joinedAt: string;
				expedition: Expedition;
			}>
		>(`/expeditions/user/${userProfileId}`);
		return response.data;
	},

	// Get expedition leaderboard
	getLeaderboard: async (id: string): Promise<UserExpedition[]> => {
		const response = await apiClient.get<UserExpedition[]>(
			`/expeditions/${id}/leaderboard`,
		);
		return response.data;
	},

	// Get expedition progress
	getProgress: async (id: string): Promise<ExpeditionProgress> => {
		const response = await apiClient.get<ExpeditionProgress>(
			`/expeditions/${id}/progress`,
		);
		return response.data;
	},
};
