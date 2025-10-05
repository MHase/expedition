import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { WorkoutHistory } from "@/components/WorkoutHistory";
import { WorkoutLogForm } from "@/components/WorkoutLogForm";
import { useSeedExerciseTypes } from "@/lib/hooks/useExerciseTypes";

export const Route = createFileRoute("/workouts")({
	component: Workouts,
});

function Workouts() {
	const seedExerciseTypes = useSeedExerciseTypes();

	return (
		<AuthGuard requireCharacterClass>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-6xl mx-auto px-4">
					<div className="flex items-center justify-between mb-8">
						<div>
							<h1 className="text-3xl font-bold">Workouts</h1>
							<p className="text-gray-600 mt-2">
								Log your workouts and track your fitness progress
							</p>
						</div>
						<button
							type="button"
							onClick={() => seedExerciseTypes.mutate()}
							disabled={seedExerciseTypes.isPending}
							className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
						>
							{seedExerciseTypes.isPending
								? "Seeding..."
								: "Seed Exercise Types (Dev)"}
						</button>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<div>
							<WorkoutLogForm />
						</div>
						<div>
							<WorkoutHistory />
						</div>
					</div>
				</div>
			</div>
		</AuthGuard>
	);
}
