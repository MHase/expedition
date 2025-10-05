import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowRight,
	Dumbbell,
	Shield,
	Star,
	Target,
	Trophy,
	Users,
	Zap,
} from "lucide-react";
import { GuestGuard } from "@/components/GuestGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/landing")({
	component: Landing,
});

function Landing() {
	const handleGoogleSignIn = () => {
		authClient.signIn.social({
			provider: "google",
			callbackURL: "http://localhost:5173",
		});
	};

	return (
		<GuestGuard>
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
				{/* Navigation */}
				<nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex justify-between items-center h-16">
							<div className="flex items-center">
								<Dumbbell className="h-8 w-8 text-blue-600 mr-3" />
								<span className="text-2xl font-bold text-gray-900">
									FitnessExpedition
								</span>
							</div>
							<Button
								onClick={handleGoogleSignIn}
								className="bg-blue-600 hover:bg-blue-700"
							>
								Get Started
							</Button>
						</div>
					</div>
				</nav>

				{/* Hero Section */}
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
					<div className="text-center">
						<h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
							Turn Fitness Into
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
								{" "}
								Adventure
							</span>
						</h1>
						<p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
							Join epic fitness expeditions with friends, earn points for your
							workouts, and unlock character classes with unique perks. Make
							every workout count!
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button
								size="lg"
								onClick={handleGoogleSignIn}
								className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
							>
								Start Your Journey
								<ArrowRight className="ml-2 h-5 w-5" />
							</Button>
							<Button variant="outline" size="lg" className="text-lg px-8 py-3">
								Learn More
							</Button>
						</div>
					</div>
				</div>

				{/* Features Section */}
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Why Choose FitnessExpedition?
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Transform your fitness routine into an engaging, social experience
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						<Card className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
									<Users className="h-6 w-6 text-blue-600" />
								</div>
								<CardTitle>Social Fitness</CardTitle>
								<CardDescription>
									Join expeditions with friends and compete on leaderboards
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
									<Zap className="h-6 w-6 text-purple-600" />
								</div>
								<CardTitle>Character Classes</CardTitle>
								<CardDescription>
									Choose your fitness class with unique perks and multipliers
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
									<Target className="h-6 w-6 text-green-600" />
								</div>
								<CardTitle>Smart Points</CardTitle>
								<CardDescription>
									Earn points based on MET values and your character class
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mx-auto w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
									<Trophy className="h-6 w-6 text-yellow-600" />
								</div>
								<CardTitle>Progress Tracking</CardTitle>
								<CardDescription>
									Monitor your fitness journey with detailed analytics
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
									<Shield className="h-6 w-6 text-red-600" />
								</div>
								<CardTitle>Privacy Controls</CardTitle>
								<CardDescription>
									Control who sees your workouts and expedition progress
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mx-auto w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
									<Star className="h-6 w-6 text-indigo-600" />
								</div>
								<CardTitle>Gamification</CardTitle>
								<CardDescription>
									Level up, earn artifacts, and complete epic challenges
								</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</div>

				{/* Character Classes Preview */}
				<div className="bg-gray-50 py-20">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-16">
							<h2 className="text-4xl font-bold text-gray-900 mb-4">
								Choose Your Fitness Class
							</h2>
							<p className="text-xl text-gray-600 max-w-2xl mx-auto">
								Each class has unique perks and multipliers for different
								workout types
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							<Card className="text-center">
								<CardHeader>
									<Badge className="w-fit mx-auto bg-red-100 text-red-800">
										Warrior
									</Badge>
									<CardTitle>Strength Specialist</CardTitle>
									<CardDescription>
										+20% points for weightlifting, +10% for group training
									</CardDescription>
								</CardHeader>
							</Card>

							<Card className="text-center">
								<CardHeader>
									<Badge className="w-fit mx-auto bg-blue-100 text-blue-800">
										Mage
									</Badge>
									<CardTitle>Endurance Master</CardTitle>
									<CardDescription>
										+15% points for cardio, +25% for group training
									</CardDescription>
								</CardHeader>
							</Card>

							<Card className="text-center">
								<CardHeader>
									<Badge className="w-fit mx-auto bg-green-100 text-green-800">
										Rogue
									</Badge>
									<CardTitle>Flexibility Expert</CardTitle>
									<CardDescription>
										+30% points for solo training, +5% for all workouts
									</CardDescription>
								</CardHeader>
							</Card>
						</div>
					</div>
				</div>

				{/* CTA Section */}
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
					<div className="text-center">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Ready to Start Your Fitness Adventure?
						</h2>
						<p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
							Join thousands of adventurers who have transformed their fitness
							routine
						</p>
						<Button
							size="lg"
							onClick={handleGoogleSignIn}
							className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
						>
							Get Started Free
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
					</div>
				</div>

				{/* Footer */}
				<footer className="bg-gray-900 text-white py-12">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center">
							<div className="flex items-center justify-center mb-4">
								<Dumbbell className="h-8 w-8 text-blue-400 mr-3" />
								<span className="text-2xl font-bold">FitnessExpedition</span>
							</div>
							<p className="text-gray-400 mb-4">
								Turn fitness into adventure. Join the expedition today.
							</p>
							<p className="text-sm text-gray-500">
								© 2024 FitnessExpedition. All rights reserved.
							</p>
						</div>
					</div>
				</footer>
			</div>
		</GuestGuard>
	);
}
