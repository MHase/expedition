import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Dumbbell, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth-client";

export const Route = createRootRoute({
	component: () => {
		const { data: session } = authClient.useSession();

		return (
			<>
				{/* Navigation */}
				<nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex justify-between items-center h-16">
							{/* Logo */}
							<Link to="/" className="flex items-center">
								<Dumbbell className="h-8 w-8 text-blue-600 mr-3" />
								<span className="text-2xl font-bold text-gray-900">
									FitnessExpedition
								</span>
							</Link>

							{/* Navigation Links */}
							{session?.user ? (
								<div className="flex items-center gap-4">
									<div className="hidden md:flex items-center gap-4">
										<Link
											to="/expeditions"
											className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium [&.active]:text-blue-600 [&.active]:bg-blue-50"
										>
											Expeditions
										</Link>
										<Link
											to="/my-expeditions"
											className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium [&.active]:text-blue-600 [&.active]:bg-blue-50"
										>
											My Expeditions
										</Link>
										<Link
											to="/workouts"
											className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium [&.active]:text-blue-600 [&.active]:bg-blue-50"
										>
											Workouts
										</Link>
									</div>

									{/* User Menu */}
									<div className="flex items-center gap-2">
										<div className="flex items-center gap-2 text-sm text-gray-600">
											<User className="h-4 w-4" />
											<span className="hidden sm:inline">
												{session.user.name || session.user.email}
											</span>
										</div>
										<Link to="/profile">
											<Button variant="outline" size="sm">
												Profile
											</Button>
										</Link>
										<Button
											variant="outline"
											size="sm"
											onClick={() => authClient.signOut()}
										>
											<LogOut className="h-4 w-4 mr-2" />
											Sign Out
										</Button>
									</div>
								</div>
							) : (
								<div className="flex items-center gap-4">
									<Link
										to="/landing"
										className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
									>
										Home
									</Link>
									<Button
										onClick={() =>
											authClient.signIn.social({ provider: "google" })
										}
										size="sm"
									>
										Get Started
									</Button>
								</div>
							)}
						</div>
					</div>
				</nav>

				{/* Main Content */}
				<main>
					<Outlet />
				</main>

				{/* Footer */}
				<footer className="bg-gray-50 border-t mt-auto">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
						<div className="text-center text-gray-500 text-sm">
							© 2024 FitnessExpedition. Turn fitness into adventure.
						</div>
					</div>
				</footer>

				<TanStackRouterDevtools />
				<Toaster />
			</>
		);
	},
});
