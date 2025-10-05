import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type CalculatePointsRequest,
	type CreateWorkoutRequest,
	type UpdateWorkoutRequest,
	workoutService,
} from "../services/workouts";

// Query keys
export const workoutKeys = {
	all: ["workouts"] as const,
	user: (userProfileId: string) =>
		[...workoutKeys.all, "user", userProfileId] as const,
	userExpedition: (userProfileId: string, expeditionId: string) =>
		[
			...workoutKeys.all,
			"user",
			userProfileId,
			"expedition",
			expeditionId,
		] as const,
};

// Get user's workouts
export const useUserWorkouts = (
	userProfileId: string,
	expeditionId?: string,
) => {
	return useQuery({
		queryKey: expeditionId
			? workoutKeys.userExpedition(userProfileId, expeditionId)
			: workoutKeys.user(userProfileId),
		queryFn: () => workoutService.getUserWorkouts(userProfileId, expeditionId),
		enabled: !!userProfileId,
		staleTime: 1 * 60 * 1000, // 1 minute
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Create workout mutation
export const useCreateWorkout = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateWorkoutRequest) => workoutService.create(data),
		onSuccess: (data) => {
			// Invalidate user workouts
			queryClient.invalidateQueries({
				queryKey: workoutKeys.user(data.userProfileId),
			});
			// Invalidate expedition workouts if part of an expedition
			if (data.expeditionId) {
				queryClient.invalidateQueries({
					queryKey: workoutKeys.userExpedition(
						data.userProfileId,
						data.expeditionId,
					),
				});
			}
			// Invalidate user profile for points update
			queryClient.invalidateQueries({
				queryKey: ["user-profiles", "user", data.userProfileId],
			});
		},
	});
};

// Update workout mutation
export const useUpdateWorkout = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateWorkoutRequest }) =>
			workoutService.update(id, data),
		onSuccess: (data) => {
			// Invalidate user workouts
			queryClient.invalidateQueries({
				queryKey: workoutKeys.user(data.userProfileId),
			});
			// Invalidate expedition workouts if part of an expedition
			if (data.expeditionId) {
				queryClient.invalidateQueries({
					queryKey: workoutKeys.userExpedition(
						data.userProfileId,
						data.expeditionId,
					),
				});
			}
			// Invalidate user profile for points update
			queryClient.invalidateQueries({
				queryKey: ["user-profiles", "user", data.userProfileId],
			});
		},
	});
};

// Delete workout mutation
export const useDeleteWorkout = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => workoutService.delete(id),
		onSuccess: () => {
			// Invalidate all workout queries since we don't know the userProfileId
			queryClient.invalidateQueries({ queryKey: workoutKeys.all });
			// Invalidate user profiles for points update
			queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
		},
	});
};

// Calculate points mutation
export const useCalculatePoints = () => {
	return useMutation({
		mutationFn: (data: CalculatePointsRequest) =>
			workoutService.calculatePoints(data),
	});
};
