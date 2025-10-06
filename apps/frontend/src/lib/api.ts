import axios from "axios";

// Create axios instance with base configuration
export const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_BASE + "/api",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		console.error("API Error:", error);

		if (error.response?.status === 401) {
			// Handle unauthorized access
			// Redirect to login or refresh token
		}

		return Promise.reject(error);
	},
);

export default apiClient;
