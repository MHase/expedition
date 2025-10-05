import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { ExpeditionDashboard } from "@/components/ExpeditionDashboard";
import { ExpeditionLeaderboard } from "@/components/ExpeditionLeaderboard";
import { Button } from "@/components/ui/button";
import { WorkoutHistory } from "@/components/WorkoutHistory";
import { WorkoutLogForm } from "@/components/WorkoutLogForm";
import { authClient } from "@/lib/auth-client";
import { useExpedition } from "@/lib/hooks/useExpeditions";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

export const Route = createFileRoute("/expedition/$id")({
	component: ExpeditionDetail,
});

function ExpeditionDetail() {
	const { id } = Route.useParams();
	const { data: session } = authClient.useSession();
	const {
		data: expedition,
		isLoading: expeditionLoading,
		error: expeditionError,
	} = useExpedition(id);
	const { data: userProfile } = useUserProfile(session?.user?.id || "");

	if (expeditionLoading) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-6xl mx-auto px-4">
					<div className="text-center text-gray-500">Loading expedition...</div>
				</div>
			</div>
		);
	}

	if (expeditionError || !expedition) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-6xl mx-auto px-4">
					<div className="text-center">
						<h1 className="text-2xl font-bold mb-2">Expedition Not Found</h1>
						<p className="text-gray-600 mb-6">
							The expedition you're looking for doesn't exist or you don't have
							access to it.
						</p>
						<Button onClick={() => window.history.back()}>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Go Back
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const isParticipant = expedition.participants.some(
		(p) => p.userProfile.userId === session?.user?.id,
	);

	return (
		<AuthGuard requireCharacterClass>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-6xl mx-auto px-4">
					<div className="mb-6">
						<Button
							variant="outline"
							onClick={() => window.history.back()}
							className="mb-4"
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Expeditions
						</Button>
						<h1 className="text-3xl font-bold">{expedition.name}</h1>
						<p className="text-gray-600 mt-2">{expedition.description}</p>

						{/* Owner Information */}
						<div className="mt-4 p-4 bg-gray-50 rounded-lg">
							<div className="text-sm text-gray-500 mb-2">
								Expedition Creator
							</div>
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2">
									<span className="font-medium text-lg">
										{expedition.creator.characterClass?.name || "No Class"}
									</span>
									<span className="text-sm text-gray-500">
										Level {expedition.creator.level}
									</span>
								</div>
								<div className="text-sm text-gray-600">
									{expedition.creator.totalPoints.toLocaleString()} total points
								</div>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Main Content */}
						<div className="lg:col-span-2 space-y-6">
							<ExpeditionDashboard expeditionId={id} />

							{isParticipant && userProfile && (
								<>
									<WorkoutLogForm expeditionId={id} />
									<WorkoutHistory expeditionId={id} />
								</>
							)}
						</div>

						{/* Sidebar */}
						<div className="lg:col-span-1 space-y-6">
							<ExpeditionLeaderboard expeditionId={id} />
						</div>
					</div>
				</div>
			</div>
		</AuthGuard>
	);
}
