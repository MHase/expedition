import { Navigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

interface GuestGuardProps {
	children: ReactNode;
	redirectTo?: string;
}

export function GuestGuard({
	children,
	redirectTo = "/expeditions",
}: GuestGuardProps) {
	const { data: session, isPending: sessionLoading } = authClient.useSession();

	// Show loading state while checking authentication
	if (sessionLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<Card className="w-96">
					<CardHeader>
						<CardTitle className="text-center">Loading...</CardTitle>
					</CardHeader>
					<CardContent className="text-center">
						<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
						<p className="text-gray-600">
							Please wait while we check your authentication status.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Redirect to expeditions if already authenticated
	if (session?.user) {
		return <Navigate to={redirectTo} />;
	}

	return <>{children}</>;
}
