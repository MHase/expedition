import { Navigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

interface AuthGuardProps {
	children: ReactNode;
	requireCharacterClass?: boolean;
	redirectTo?: string;
}

export function AuthGuard({
	children,
	requireCharacterClass = false,
	redirectTo = "/",
}: AuthGuardProps) {
	const { data: session, isPending: sessionLoading } = authClient.useSession();
	const { data: userProfile, isPending: profileLoading } = useUserProfile(
		session?.user?.id || "",
	);

	// Show loading state while checking authentication
	if (sessionLoading || profileLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<Card className="w-96">
					<CardHeader>
						<CardTitle className="text-center">Loading...</CardTitle>
					</CardHeader>
					<CardContent className="text-center">
						<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
						<p className="text-gray-600">
							Please wait while we verify your account.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Redirect to home if not authenticated
	if (!session?.user) {
		return <Navigate to={redirectTo} />;
	}

	// Redirect to character selection if character class is required but not selected
	if (requireCharacterClass && !userProfile?.characterClass) {
		return <Navigate to="/character-selection" />;
	}

	return <>{children}</>;
}
