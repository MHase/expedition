import { createFileRoute, Navigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const { data: session, isPending } = authClient.useSession();

	// Show loading state while checking authentication
	if (isPending) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	// Redirect authenticated users to expeditions
	if (session?.user) {
		return <Navigate to="/expeditions" />;
	}

	// Redirect unauthenticated users to landing page
	return <Navigate to="/landing" />;
}
