import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { exerciseTypeService } from "../services/exercise-types";

// Query keys
export const exerciseTypeKeys = {
	all: ["exercise-types"] as const,
	lists: () => [...exerciseTypeKeys.all, "list"] as const,
};

// Get all exercise types
export const useExerciseTypes = () => {
	return useQuery({
		queryKey: exerciseTypeKeys.lists(),
		queryFn: exerciseTypeService.getAll,
		staleTime: 10 * 60 * 1000, // 10 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
	});
};

// Seed exercise types mutation
export const useSeedExerciseTypes = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: exerciseTypeService.seed,
		onSuccess: () => {
			// Invalidate and refetch exercise types after seeding
			queryClient.invalidateQueries({ queryKey: exerciseTypeKeys.lists() });
		},
	});
};
