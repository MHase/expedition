import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type CreateUserProfileRequest,
	type UpdateUserProfileRequest,
	userProfileService,
} from "../services/user-profiles";

// Query keys
export const userProfileKeys = {
	all: ["user-profiles"] as const,
	byUserId: (userId: string) =>
		[...userProfileKeys.all, "user", userId] as const,
};

// Get user profile by user ID
export const useUserProfile = (userId: string) => {
	return useQuery({
		queryKey: userProfileKeys.byUserId(userId),
		queryFn: () => userProfileService.getByUserId(userId),
		enabled: !!userId,
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Create or update user profile mutation
export const useCreateOrUpdateUserProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateUserProfileRequest) =>
			userProfileService.createOrUpdate(data),
		onSuccess: (data) => {
			// Invalidate and refetch user profile
			queryClient.invalidateQueries({
				queryKey: userProfileKeys.byUserId(data.userId),
			});
		},
	});
};

// Update user profile mutation
export const useUpdateUserProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			userId,
			data,
		}: {
			userId: string;
			data: UpdateUserProfileRequest;
		}) => userProfileService.update(userId, data),
		onSuccess: (data) => {
			// Invalidate and refetch user profile
			queryClient.invalidateQueries({
				queryKey: userProfileKeys.byUserId(data.userId),
			});
		},
	});
};
