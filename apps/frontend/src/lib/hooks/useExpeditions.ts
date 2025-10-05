import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type CreateExpeditionRequest,
	expeditionService,
	type JoinExpeditionRequest,
	type LeaveExpeditionRequest,
} from "../services/expeditions";

// Query keys
export const expeditionKeys = {
	all: ["expeditions"] as const,
	public: () => [...expeditionKeys.all, "public"] as const,
	detail: (id: string) => [...expeditionKeys.all, "detail", id] as const,
	user: (userProfileId: string) =>
		[...expeditionKeys.all, "user", userProfileId] as const,
};

// Get all public expeditions
export const usePublicExpeditions = () => {
	return useQuery({
		queryKey: expeditionKeys.public(),
		queryFn: expeditionService.getPublic,
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Get expedition by ID
export const useExpedition = (id: string) => {
	return useQuery({
		queryKey: expeditionKeys.detail(id),
		queryFn: () => expeditionService.getById(id),
		enabled: !!id,
		staleTime: 1 * 60 * 1000, // 1 minute
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Get user's expeditions
export const useUserExpeditions = (userProfileId: string) => {
	return useQuery({
		queryKey: expeditionKeys.user(userProfileId),
		queryFn: () => expeditionService.getUserExpeditions(userProfileId),
		enabled: !!userProfileId,
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Get expedition leaderboard
export const useExpeditionLeaderboard = (expeditionId: string) => {
	return useQuery({
		queryKey: [...expeditionKeys.detail(expeditionId), "leaderboard"],
		queryFn: () => expeditionService.getLeaderboard(expeditionId),
		enabled: !!expeditionId,
		staleTime: 30 * 1000, // 30 seconds
		gcTime: 2 * 60 * 1000, // 2 minutes
	});
};

// Get expedition progress
export const useExpeditionProgress = (expeditionId: string) => {
	return useQuery({
		queryKey: [...expeditionKeys.detail(expeditionId), "progress"],
		queryFn: () => expeditionService.getProgress(expeditionId),
		enabled: !!expeditionId,
		staleTime: 30 * 1000, // 30 seconds
		gcTime: 2 * 60 * 1000, // 2 minutes
	});
};

// Create expedition mutation
export const useCreateExpedition = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateExpeditionRequest) =>
			expeditionService.create(data),
		onSuccess: () => {
			// Invalidate public expeditions and user expeditions
			queryClient.invalidateQueries({ queryKey: expeditionKeys.public() });
			// Note: We'll need to invalidate user expeditions after we know the userProfileId
		},
	});
};

// Join expedition mutation
export const useJoinExpedition = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: JoinExpeditionRequest }) =>
			expeditionService.join(id, data),
		onSuccess: (_, { data }) => {
			// Invalidate public expeditions and user expeditions
			queryClient.invalidateQueries({ queryKey: expeditionKeys.public() });
			queryClient.invalidateQueries({
				queryKey: expeditionKeys.user(data.userProfileId),
			});
		},
	});
};

// Join expedition by code mutation
export const useJoinExpeditionByCode = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: { userProfileId: string; inviteCode: string }) =>
			expeditionService.joinByCode(data),
		onSuccess: (_, { userProfileId }) => {
			// Invalidate public expeditions and user expeditions
			queryClient.invalidateQueries({ queryKey: expeditionKeys.public() });
			queryClient.invalidateQueries({
				queryKey: expeditionKeys.user(userProfileId),
			});
		},
	});
};

// Leave expedition mutation
export const useLeaveExpedition = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: LeaveExpeditionRequest }) =>
			expeditionService.leave(id, data),
		onSuccess: (_, { data }) => {
			// Invalidate public expeditions and user expeditions
			queryClient.invalidateQueries({ queryKey: expeditionKeys.public() });
			queryClient.invalidateQueries({
				queryKey: expeditionKeys.user(data.userProfileId),
			});
		},
	});
};
