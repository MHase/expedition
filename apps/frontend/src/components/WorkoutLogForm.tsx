import { useCallback, useEffect, useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { useExerciseTypes } from "@/lib/hooks/useExerciseTypes";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useCalculatePoints, useCreateWorkout } from "@/lib/hooks/useWorkouts";

interface WorkoutLogFormProps {
	expeditionId?: string;
	onSuccess?: () => void;
}

export function WorkoutLogForm({
	expeditionId,
	onSuccess,
}: WorkoutLogFormProps) {
	const { data: session } = authClient.useSession();
	const { data: userProfile } = useUserProfile(session?.user?.id || "");
	const { data: exerciseTypes, isLoading: exerciseTypesLoading } =
		useExerciseTypes();
	const createWorkout = useCreateWorkout();
	const calculatePoints = useCalculatePoints();

	const exerciseTypeId = useId();
	const durationId = useId();
	const dateId = useId();
	const timeId = useId();
	const notesId = useId();
	const visibilityId = useId();

	// Helper function to get local date in YYYY-MM-DD format
	const getLocalDateString = () => {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const day = String(now.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	// Helper function to get local time in HH:MM format
	const getLocalTimeString = () => {
		const now = new Date();
		const hours = String(now.getHours()).padStart(2, "0");
		const minutes = String(now.getMinutes()).padStart(2, "0");
		return `${hours}:${minutes}`;
	};

	const [formData, setFormData] = useState({
		exerciseType: "",
		duration: 30,
		notes: "",
		isSolo: !expeditionId, // If expeditionId exists, it's a group workout (solo: false)
		isPublic: false,
		workoutDate: getLocalDateString(),
		workoutTime: getLocalTimeString(),
	});

	const [selectedExercise, setSelectedExercise] = useState<{
		metValue: number;
	} | null>(null);
	const [calculatedPoints, setCalculatedPoints] = useState<{
		basePoints: number;
		finalPoints: number;
		multiplier: number;
	} | null>(null);

	// Memoize the calculate points function to prevent infinite loops
	const calculatePointsForWorkout = useCallback(() => {
		if (
			selectedExercise &&
			userProfile?.id &&
			formData.duration > 0
			// !calculatePoints.isPending
		) {
			calculatePoints.mutate(
				{
					userProfileId: userProfile.id,
					metValue: selectedExercise.metValue,
					duration: formData.duration,
					isSolo: formData.isSolo,
				},
				{
					onSuccess: (data) => {
						setCalculatedPoints(data);
					},
				},
			);
		}
	}, [
		selectedExercise,
		formData.duration,
		formData.isSolo,
		userProfile?.id,
		// calculatePoints.isPending,
		// calculatePoints.mutate,
	]);

	// Calculate points when exercise type or duration changes
	useEffect(() => {
		calculatePointsForWorkout();
	}, [calculatePointsForWorkout]);

	const handleInputChange = (
		field: string,
		value: string | number | boolean,
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleExerciseSelect = (exerciseName: string) => {
		const exercise = exerciseTypes?.find((ex) => ex.name === exerciseName);
		setSelectedExercise(exercise ? { metValue: exercise.metValue } : null);
		handleInputChange("exerciseType", exerciseName);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!userProfile?.id || !selectedExercise) {
			console.error("Missing required data");
			return;
		}

		// Create date in local timezone to avoid timezone conversion issues
		const [year, month, day] = formData.workoutDate.split("-").map(Number);
		const [hours, minutes] = formData.workoutTime.split(":").map(Number);
		const workoutDateTime = new Date(year, month - 1, day, hours, minutes);

		createWorkout.mutate(
			{
				userProfileId: userProfile.id,
				expeditionId,
				exerciseType: formData.exerciseType,
				duration: formData.duration,
				metValue: selectedExercise.metValue,
				points: calculatedPoints?.basePoints || 0,
				isSolo: formData.isSolo,
				isPublic: formData.isPublic,
				notes: formData.notes || undefined,
				workoutDate: workoutDateTime.toISOString(),
			},
			{
				onSuccess: () => {
					// Reset form
					setFormData({
						exerciseType: "",
						duration: 30,
						notes: "",
						isSolo: !expeditionId, // Reset based on expedition context
						isPublic: false,
						workoutDate: getLocalDateString(),
						workoutTime: getLocalTimeString(),
					});
					setSelectedExercise(null);
					setCalculatedPoints(null);
					onSuccess?.();
				},
			},
		);
	};

	if (!userProfile) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Log Workout</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center text-gray-500">
						Please select a character class first to log workouts.
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Log New Workout</CardTitle>
				<CardDescription>
					Log your workout to earn points and track your progress.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label htmlFor={exerciseTypeId} className="text-sm font-medium">
								Exercise Type
							</label>
							<Select
								value={formData.exerciseType}
								onValueChange={handleExerciseSelect}
								disabled={exerciseTypesLoading}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select exercise type" />
								</SelectTrigger>
								<SelectContent>
									{exerciseTypes?.map((exercise) => (
										<SelectItem key={exercise.id} value={exercise.name}>
											{exercise.name} (MET: {exercise.metValue})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<label htmlFor={durationId} className="text-sm font-medium">
								Duration (minutes)
							</label>
							<Input
								id={durationId}
								type="number"
								value={formData.duration}
								onChange={(e) =>
									handleInputChange("duration", parseInt(e.target.value) || 0)
								}
								min="1"
								max="300"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label htmlFor={dateId} className="text-sm font-medium">
								Date
							</label>
							<Input
								id={dateId}
								type="date"
								value={formData.workoutDate}
								onChange={(e) =>
									handleInputChange("workoutDate", e.target.value)
								}
								max={new Date().toISOString().split("T")[0]}
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor={timeId} className="text-sm font-medium">
								Time
							</label>
							<Input
								id={timeId}
								type="time"
								value={formData.workoutTime}
								onChange={(e) =>
									handleInputChange("workoutTime", e.target.value)
								}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label htmlFor={notesId} className="text-sm font-medium">
							Notes (Optional)
						</label>
						<Textarea
							id={notesId}
							value={formData.notes}
							onChange={(e) => handleInputChange("notes", e.target.value)}
							placeholder="Add any notes about your workout..."
							rows={3}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* {!expeditionId && (
							<div className="space-y-2">
								<label htmlFor={workoutTypeId} className="text-sm font-medium">
									Workout Type
								</label>
								<Select
									value={formData.isSolo ? "solo" : "group"}
									onValueChange={(value) =>
										handleInputChange("isSolo", value === "solo")
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="solo">Solo Workout</SelectItem>
										<SelectItem value="group">Group Workout</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)} */}

						{expeditionId && (
							<div className="space-y-2">
								<div className="text-sm font-medium">Workout Type</div>
								<div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
									<div className="flex items-center gap-2 text-blue-800">
										<span className="text-sm font-medium">Group Workout</span>
										<span className="text-xs text-blue-600">
											(Part of expedition)
										</span>
									</div>
								</div>
							</div>
						)}

						<div className="space-y-2">
							<label htmlFor={visibilityId} className="text-sm font-medium">
								Visibility
							</label>
							<Select
								value={formData.isPublic ? "public" : "private"}
								onValueChange={(value) =>
									handleInputChange("isPublic", value === "public")
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="private">Private</SelectItem>
									<SelectItem value="public">Public</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{calculatedPoints && (
						<div className="bg-gray-50 p-4 rounded-lg">
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium">Points Calculation</span>
								<Badge variant="outline">
									{formData.isSolo ? "Solo" : "Group"} ×{" "}
									{calculatedPoints.multiplier.toFixed(2)}
								</Badge>
							</div>
							<div className="text-sm text-gray-600">
								Base Points: {calculatedPoints.basePoints.toFixed(1)} → Final
								Points:{" "}
								<span className="font-semibold text-green-600">
									{calculatedPoints.finalPoints.toFixed(1)}
								</span>
							</div>
						</div>
					)}

					<Button
						type="submit"
						disabled={
							createWorkout.isPending || !selectedExercise || !calculatedPoints
						}
						className="w-full"
					>
						{createWorkout.isPending ? "Logging Workout..." : "Log Workout"}
					</Button>

					{createWorkout.isError && (
						<div className="text-red-500 text-sm text-center">
							{createWorkout.error?.message || "Failed to log workout"}
						</div>
					)}
				</form>
			</CardContent>
		</Card>
	);
}
