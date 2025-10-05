import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useDeleteWorkout, useUserWorkouts } from "@/lib/hooks/useWorkouts";

interface WorkoutHistoryProps {
	expeditionId?: string;
}

export function WorkoutHistory({ expeditionId }: WorkoutHistoryProps) {
	const { data: session } = authClient.useSession();
	const { data: userProfile } = useUserProfile(session?.user?.id || "");
	const {
		data: workouts,
		isLoading,
		error,
	} = useUserWorkouts(userProfile?.id || "", expeditionId);
	const deleteWorkout = useDeleteWorkout();

	const [deletingId, setDeletingId] = useState<string | null>(null);

	const handleDeleteWorkout = async (workoutId: string) => {
		setDeletingId(workoutId);
		try {
			await deleteWorkout.mutateAsync(workoutId);
		} catch (error) {
			console.error("Failed to delete workout:", error);
		} finally {
			setDeletingId(null);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const canEditWorkout = (workoutDate: string) => {
		const workoutDateTime = new Date(workoutDate);
		const now = new Date();
		const timeDiff = now.getTime() - workoutDateTime.getTime();
		const hoursDiff = timeDiff / (1000 * 60 * 60);
		return hoursDiff <= 24;
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Workout History</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center text-gray-500">Loading workouts...</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Workout History</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center text-red-500">
						Error:{" "}
						{error instanceof Error ? error.message : "Failed to load workouts"}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!workouts || workouts.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Workout History</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center text-gray-500">
						No workouts logged yet. Start your fitness journey!
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Workout History</CardTitle>
				<CardDescription>
					{expeditionId
						? "Your workouts for this expedition"
						: "All your logged workouts"}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{workouts.map((workout) => (
						<div
							key={workout.id}
							className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
						>
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<h4 className="font-semibold">{workout.exerciseType}</h4>
										<Badge variant="outline">{workout.duration} min</Badge>
										<Badge variant={workout.isSolo ? "secondary" : "default"}>
											{workout.isSolo ? "Solo" : "Group"}
										</Badge>
										{!workout.isPublic && (
											<Badge variant="outline">Private</Badge>
										)}
									</div>

									<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
										<div>
											<span className="font-medium">Points:</span>{" "}
											<span className="text-green-600 font-semibold">
												{workout.points.toFixed(1)}
											</span>
										</div>
										<div>
											<span className="font-medium">MET:</span>{" "}
											{workout.metValue}
										</div>
										<div>
											<span className="font-medium">Date:</span>{" "}
											{formatDate(workout.workoutDate)}
										</div>
										{workout.expedition && (
											<div>
												<span className="font-medium">Expedition:</span>{" "}
												{workout.expedition.name}
											</div>
										)}
									</div>

									{workout.notes && (
										<div className="mt-2 text-sm text-gray-600">
											<span className="font-medium">Notes:</span>{" "}
											{workout.notes}
										</div>
									)}

									{workout.photos.length > 0 && (
										<div className="mt-2">
											<span className="text-sm font-medium text-gray-600">
												Photos: {workout.photos.length}
											</span>
										</div>
									)}
								</div>

								{canEditWorkout(workout.workoutDate) && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleDeleteWorkout(workout.id)}
										disabled={deletingId === workout.id}
									>
										{deletingId === workout.id ? "Deleting..." : "Delete"}
									</Button>
								)}
							</div>

							{!canEditWorkout(workout.workoutDate) && (
								<div className="mt-2 text-xs text-gray-500">
									Workout can only be edited within 24 hours
								</div>
							)}
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
