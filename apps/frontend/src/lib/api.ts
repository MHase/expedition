import axios from "axios";

// Create axios instance with base configuration
export const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_BASE + "/api",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor for adding auth tokens if needed
apiClient.interceptors.request.use(
	(config) => {
		// Add auth token if available
		// const token = localStorage.getItem('auth-token');
		// if (token) {
		//   config.headers.Authorization = `Bearer ${token}`;
		// }
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

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
