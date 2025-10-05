import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { CharacterClassSelection } from "@/components/CharacterClassSelection";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useSeedCharacterClasses } from "@/lib/hooks/useCharacterClasses";
import { useCreateOrUpdateUserProfile } from "@/lib/hooks/useUserProfile";

export const Route = createFileRoute("/character-selection")({
	component: CharacterSelection,
});

function CharacterSelection() {
	const [selectedClassId, setSelectedClassId] = useState<string | undefined>();
	const [isConfirmed, setIsConfirmed] = useState(false);

	const seedCharacterClasses = useSeedCharacterClasses();
	const createOrUpdateProfile = useCreateOrUpdateUserProfile();
	const { data: session } = authClient.useSession();

	const handleClassSelect = (classId: string) => {
		setSelectedClassId(classId);
		setIsConfirmed(false);
	};

	const handleConfirmSelection = () => {
		if (selectedClassId && session?.user?.id) {
			createOrUpdateProfile.mutate(
				{
					userId: session.user.id,
					characterClassId: selectedClassId,
				},
				{
					onSuccess: () => {
						setIsConfirmed(true);
					},
					onError: (error) => {
						console.error("Failed to save character class:", error);
						// You could add a toast notification here
					},
				},
			);
		}
	};

	const handleSeedData = () => {
		seedCharacterClasses.mutate();
	};

	if (isConfirmed) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
					<div className="text-green-500 text-6xl mb-4">✓</div>
					<h2 className="text-2xl font-bold mb-2">Character Class Selected!</h2>
					<p className="text-gray-600 mb-6">
						Your character class has been saved. You can now start your fitness
						expedition!
					</p>
					<Button
						onClick={() => {
							window.location.href = "/";
						}}
						className="w-full"
					>
						Continue to Dashboard
					</Button>
				</div>
			</div>
		);
	}

	return (
		<AuthGuard>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-6xl mx-auto px-4">
					{/* Development seed button */}
					<div className="mb-6 text-center">
						<Button
							onClick={handleSeedData}
							disabled={seedCharacterClasses.isPending}
							variant="outline"
							className="mb-4"
						>
							{seedCharacterClasses.isPending
								? "Seeding..."
								: "Seed Character Classes (Dev)"}
						</Button>
						{seedCharacterClasses.isSuccess && (
							<p className="text-green-600 text-sm">
								Successfully seeded {seedCharacterClasses.data?.count} character
								classes!
							</p>
						)}
						{seedCharacterClasses.isError && (
							<p className="text-red-600 text-sm">
								Error: {seedCharacterClasses.error?.message}
							</p>
						)}
					</div>

					<CharacterClassSelection
						onClassSelect={handleClassSelect}
						selectedClassId={selectedClassId}
						onConfirm={handleConfirmSelection}
						isLoading={createOrUpdateProfile.isPending}
					/>
				</div>
			</div>
		</AuthGuard>
	);
}
