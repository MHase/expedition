import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useCharacterClasses } from "@/lib/hooks/useCharacterClasses";

interface CharacterClassSelectionProps {
	onClassSelect: (classId: string) => void;
	selectedClassId?: string;
	onConfirm?: () => void;
	isLoading?: boolean;
}

export function CharacterClassSelection({
	onClassSelect,
	selectedClassId,
	onConfirm,
	isLoading = false,
}: CharacterClassSelectionProps) {
	const {
		data: characterClasses,
		isLoading: loading,
		error,
	} = useCharacterClasses();

	const getMultiplierColor = (multiplier: number) => {
		if (multiplier >= 1.2) return "bg-green-500";
		if (multiplier >= 1.1) return "bg-blue-500";
		if (multiplier >= 1.0) return "bg-gray-500";
		if (multiplier >= 0.8) return "bg-yellow-500";
		return "bg-red-500";
	};

	const getMultiplierText = (multiplier: number) => {
		if (multiplier > 1.0) return `+${Math.round((multiplier - 1) * 100)}%`;
		return `${Math.round(multiplier * 100)}%`;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-lg">Loading character classes...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-red-500">
					Error:{" "}
					{error instanceof Error
						? error.message
						: "Failed to load character classes"}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-3xl font-bold mb-2">Choose Your Character Class</h2>
				<p className="text-gray-600">
					Each class has unique perks and multipliers that affect your point
					earnings
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{characterClasses?.map((characterClass) => (
					<Card
						key={characterClass.id}
						className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
							selectedClassId === characterClass.id
								? "ring-2 ring-blue-500 bg-blue-50"
								: "hover:shadow-md"
						}`}
						onClick={() => onClassSelect(characterClass.id)}
					>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								{characterClass.name}
								{selectedClassId === characterClass.id && (
									<Badge variant="default">Selected</Badge>
								)}
							</CardTitle>
							<CardDescription>{characterClass.description}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<h4 className="font-semibold text-sm">Perks:</h4>
								<ul className="space-y-1">
									{characterClass.perks.map((perk) => (
										<li
											key={perk}
											className="text-sm text-gray-600 flex items-start"
										>
											<span className="text-blue-500 mr-2">•</span>
											{perk}
										</li>
									))}
								</ul>
							</div>

							<div className="flex justify-between items-center pt-4 border-t">
								<div className="text-center">
									<div className="text-xs text-gray-500 mb-1">
										Solo Training
									</div>
									<Badge
										variant="outline"
										className={`${getMultiplierColor(characterClass.soloMultiplier)} text-white`}
									>
										{getMultiplierText(characterClass.soloMultiplier)}
									</Badge>
								</div>
								<div className="text-center">
									<div className="text-xs text-gray-500 mb-1">
										Group Training
									</div>
									<Badge
										variant="outline"
										className={`${getMultiplierColor(characterClass.groupMultiplier)} text-white`}
									>
										{getMultiplierText(characterClass.groupMultiplier)}
									</Badge>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{selectedClassId && onConfirm && (
				<div className="text-center">
					<Button
						onClick={onConfirm}
						disabled={isLoading}
						className="px-8 py-2"
					>
						{isLoading ? "Saving..." : "Confirm Selection"}
					</Button>
				</div>
			)}
		</div>
	);
}
