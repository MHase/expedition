import { useMutation } from "@tanstack/react-query";
import {
	type DeleteUserRequest,
	userDeletionService,
} from "../services/user-deletion";

export const useDeleteUser = () => {
	return useMutation({
		mutationFn: (data: DeleteUserRequest) =>
			userDeletionService.deleteUser(data),
	});
};
