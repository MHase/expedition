import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useExpeditionLeaderboard } from "@/lib/hooks/useExpeditions";
import { userStringToColorHex } from "@/lib/utils";

interface ExpeditionLeaderboardProps {
	expeditionId: string;
}

export function ExpeditionLeaderboard({
	expeditionId,
}: ExpeditionLeaderboardProps) {
	const { data: session } = authClient.useSession();
	const {
		data: leaderboard,
		isLoading,
		error,
	} = useExpeditionLeaderboard(expeditionId);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Leaderboard</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center text-gray-500">Loading...</div>
				</CardContent>
			</Card>
		);
	}

	if (error || !leaderboard) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Leaderboard</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center text-red-500">
						Error:{" "}
						{error instanceof Error
							? error.message
							: "Failed to load leaderboard"}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (leaderboard.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Leaderboard</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center text-gray-500">
						No participants yet. Join the expedition to get started!
					</div>
				</CardContent>
			</Card>
		);
	}

	const getRankIcon = (index: number) => {
		switch (index) {
			case 0:
				return "🥇";
			case 1:
				return "🥈";
			case 2:
				return "🥉";
			default:
				return `#${index + 1}`;
		}
	};

	const getRankColor = (index: number) => {
		switch (index) {
			case 0:
				return "bg-yellow-50 border-yellow-200";
			case 1:
				return "bg-gray-50 border-gray-200";
			case 2:
				return "bg-orange-50 border-orange-200";
			default:
				return "bg-white border-gray-200";
		}
	};

	const isCurrentUser = (userProfileId: string) => {
		return session?.user?.id === userProfileId;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Leaderboard</CardTitle>
				<CardDescription>
					Rankings based on points earned in this expedition
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{leaderboard.map((participant, index) => (
						<div
							key={participant.id}
							className={`flex items-center justify-between p-4 rounded-lg border ${getRankColor(
								index,
							)} ${
								isCurrentUser(participant.userProfile.userId)
									? "ring-2 ring-blue-500 ring-opacity-50"
									: ""
							}`}
						>
							<div className="flex items-center gap-3">
								<div className="text-2xl font-bold text-gray-600 min-w-[2rem]">
									{getRankIcon(index)}
								</div>
								<div className="flex-1">
									<div className="flex items-center gap-2">
										{/* Task: Leaderboard - show names instead of generic labels */}
										{(() => {
											const you = isCurrentUser(participant.userProfile.userId);
											const displayName =
												(you && session?.user?.name) ||
												participant.userProfile.userName ||
												`User ${participant.userProfile.userId.slice(0, 6)}`;
											const color = userStringToColorHex(
												(you && session?.user?.name) ||
													participant.userProfile.userName ||
													`user-${participant.userProfile.userId}`,
											);
											return (
												<>
													<span
														className="inline-block w-3 h-3 rounded-sm"
														style={{ backgroundColor: color }}
													/>
													<span className="font-semibold">{displayName}</span>
												</>
											);
										})()}
										{/* {participant.userProfile.characterClass && (
											<Badge variant="outline" className="text-xs">
												{participant.userProfile.characterClass.name}
											</Badge>
										)} */}
										{!participant.isActive && (
											<Badge variant="destructive" className="text-xs">
												Inactive
											</Badge>
										)}
									</div>
									<div className="text-sm text-gray-500">
										Level {participant.userProfile.level} • Total:{" "}
										{participant.userProfile.totalPoints.toLocaleString()} pts
									</div>
								</div>
							</div>
							<div className="text-right">
								<div className="text-xl font-bold text-green-600">
									{participant.pointsEarned.toFixed(1)}
								</div>
								<div className="text-sm text-gray-500">points</div>
							</div>
						</div>
					))}
				</div>

				{leaderboard.length > 0 && (
					<div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
						<div className="flex justify-between">
							<span>Total participants:</span>
							<span className="font-semibold">{leaderboard.length}</span>
						</div>
						<div className="flex justify-between">
							<span>Total points earned:</span>
							<span className="font-semibold">
								{leaderboard
									.reduce((sum, p) => sum + p.pointsEarned, 0)
									.toLocaleString()}
							</span>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
