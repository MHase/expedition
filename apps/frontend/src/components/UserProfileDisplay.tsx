import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

export function UserProfileDisplay() {
	const { data: session } = authClient.useSession();
	const {
		data: userProfile,
		isLoading,
		error,
	} = useUserProfile(session?.user?.id || "");

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Your Profile</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-sm text-gray-500">Loading...</div>
				</CardContent>
			</Card>
		);
	}

	if (error || !userProfile) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Your Profile</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-sm text-gray-500">
						No character class selected.
						<a
							href="/character-selection"
							className="text-blue-500 hover:underline ml-1"
						>
							Select one here
						</a>
					</div>
				</CardContent>
			</Card>
		);
	}

	const characterClass = userProfile.characterClass;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Your Profile</CardTitle>
				<CardDescription>
					Welcome back, {session?.user?.name || "Adventurer"}!
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<div className="text-sm text-gray-500">Character Class</div>
						<div className="font-semibold text-lg">
							{characterClass?.name || "No Class Selected"}
						</div>
					</div>
					{characterClass && (
						<Badge variant="outline" className="bg-blue-100 text-blue-800">
							{characterClass.name}
						</Badge>
					)}
				</div>

				{characterClass && (
					<div className="space-y-2">
						<div className="text-sm text-gray-500">Class Description</div>
						<div className="text-sm text-gray-700">
							{characterClass.description}
						</div>
					</div>
				)}

				<div className="grid grid-cols-2 gap-4 pt-2 border-t">
					<div>
						<div className="text-sm text-gray-500">Total Points</div>
						<div className="font-semibold text-lg">
							{userProfile.totalPoints.toLocaleString()}
						</div>
					</div>
					<div>
						<div className="text-sm text-gray-500">Level</div>
						<div className="font-semibold text-lg">{userProfile.level}</div>
					</div>
				</div>

				{characterClass?.perks && Array.isArray(characterClass.perks) && (
					<div className="space-y-2">
						<div className="text-sm text-gray-500">Class Perks</div>
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
				)}

				{characterClass && (
					<div className="flex justify-between items-center pt-2 border-t">
						<div className="text-center">
							<div className="text-xs text-gray-500 mb-1">Solo Training</div>
							<Badge
								variant="outline"
								className={`${
									characterClass.soloMultiplier >= 1.0
										? "bg-green-100 text-green-800"
										: characterClass.soloMultiplier >= 0.8
											? "bg-yellow-100 text-yellow-800"
											: "bg-red-100 text-red-800"
								}`}
							>
								{characterClass.soloMultiplier > 1.0
									? `+${Math.round((characterClass.soloMultiplier - 1) * 100)}%`
									: `${Math.round(characterClass.soloMultiplier * 100)}%`}
							</Badge>
						</div>
						<div className="text-center">
							<div className="text-xs text-gray-500 mb-1">Group Training</div>
							<Badge
								variant="outline"
								className={`${
									characterClass.groupMultiplier >= 1.2
										? "bg-green-100 text-green-800"
										: characterClass.groupMultiplier >= 1.1
											? "bg-blue-100 text-blue-800"
											: "bg-gray-100 text-gray-800"
								}`}
							>
								{characterClass.groupMultiplier > 1.0
									? `+${Math.round((characterClass.groupMultiplier - 1) * 100)}%`
									: `${Math.round(characterClass.groupMultiplier * 100)}%`}
							</Badge>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
