import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useExpeditionProgress } from "@/lib/hooks/useExpeditions";

interface ExpeditionDashboardProps {
	expeditionId: string;
}

export function ExpeditionDashboard({
	expeditionId,
}: ExpeditionDashboardProps) {
	const {
		data: progress,
		isLoading,
		error,
	} = useExpeditionProgress(expeditionId);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Expedition Progress</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center text-gray-500">Loading...</div>
				</CardContent>
			</Card>
		);
	}

	if (error || !progress) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Expedition Progress</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center text-red-500">
						Error:{" "}
						{error instanceof Error ? error.message : "Failed to load progress"}
					</div>
				</CardContent>
			</Card>
		);
	}

	const {
		expedition,
		totalPoints,
		targetPoints,
		progressPercentage,
		participantCount,
		recentWorkouts,
	} = progress;

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const formatWorkoutDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="space-y-6">
			{/* Expedition Overview */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						{expedition.name}
						<Badge
							variant={
								expedition.status === "active"
									? "default"
									: expedition.status === "completed"
										? "secondary"
										: expedition.status === "failed"
											? "destructive"
											: "outline"
							}
						>
							{expedition.status.charAt(0).toUpperCase() +
								expedition.status.slice(1)}
						</Badge>
					</CardTitle>
					<CardDescription>{expedition.description}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
						<div className="text-center">
							<div className="text-2xl font-bold text-blue-600">
								{totalPoints.toLocaleString()}
							</div>
							<div className="text-sm text-gray-500">Points Earned</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-green-600">
								{targetPoints.toLocaleString()}
							</div>
							<div className="text-sm text-gray-500">Target Points</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-purple-600">
								{participantCount}
							</div>
							<div className="text-sm text-gray-500">Participants</div>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span>Progress</span>
							<span>{progressPercentage.toFixed(1)}%</span>
						</div>
						<Progress value={progressPercentage} className="h-2" />
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
						<div>
							<span className="font-medium">Start Date:</span>{" "}
							{formatDate(expedition.startDate)}
						</div>
						<div>
							<span className="font-medium">End Date:</span>{" "}
							{formatDate(expedition.endDate)}
						</div>
						<div>
							<span className="font-medium">Duration:</span>{" "}
							{expedition.duration} days
						</div>
						<div>
							<span className="font-medium">Visibility:</span>{" "}
							<Badge variant="outline" className="ml-1">
								{expedition.isPublic ? "Public" : "Private"}
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Recent Activity */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
					<CardDescription>
						Latest workouts logged for this expedition
					</CardDescription>
				</CardHeader>
				<CardContent>
					{recentWorkouts.length === 0 ? (
						<div className="text-center text-gray-500 py-4">
							No workouts logged yet. Be the first to start!
						</div>
					) : (
						<div className="space-y-3">
							{recentWorkouts.map((workout) => (
								<div
									key={workout.id}
									className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
								>
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<span className="font-medium">
												{workout.exerciseType}
											</span>
											<Badge variant="outline" className="text-xs">
												{workout.duration} min
											</Badge>
											{workout.userProfile.characterClass && (
												<Badge variant="secondary" className="text-xs">
													{workout.userProfile.characterClass.name}
												</Badge>
											)}
										</div>
										<div className="text-sm text-gray-500">
											{formatWorkoutDate(workout.workoutDate)}
										</div>
									</div>
									<div className="text-right">
										<div className="font-semibold text-green-600">
											+{workout.points.toFixed(1)} pts
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
