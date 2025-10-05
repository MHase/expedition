import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { characterClassService } from "../services/character-classes";

// Query keys
export const characterClassKeys = {
	all: ["character-classes"] as const,
	lists: () => [...characterClassKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) =>
		[...characterClassKeys.lists(), { filters }] as const,
	details: () => [...characterClassKeys.all, "detail"] as const,
	detail: (id: string) => [...characterClassKeys.details(), id] as const,
};

// Get all character classes
export const useCharacterClasses = () => {
	return useQuery({
		queryKey: characterClassKeys.lists(),
		queryFn: characterClassService.getAll,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

// Get character class by ID
export const useCharacterClass = (id: string) => {
	return useQuery({
		queryKey: characterClassKeys.detail(id),
		queryFn: () => characterClassService.getById(id),
		enabled: !!id,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

// Seed character classes mutation
export const useSeedCharacterClasses = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: characterClassService.seed,
		onSuccess: () => {
			// Invalidate and refetch character classes after seeding
			queryClient.invalidateQueries({ queryKey: characterClassKeys.lists() });
		},
	});
};
