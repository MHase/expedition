import { apiClient } from "../api";

export interface DeleteUserRequest {
	userId: string;
}

export interface DeleteUserResponse {
	message: string;
}

export const userDeletionService = {
	// Delete user and all related data
	deleteUser: async (data: DeleteUserRequest): Promise<DeleteUserResponse> => {
		const response = await apiClient.delete<DeleteUserResponse>(
			"/user-deletion",
			{
				data,
			},
		);
		return response.data;
	},
};
