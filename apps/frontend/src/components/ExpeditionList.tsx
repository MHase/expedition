import { Link } from "@tanstack/react-router";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { authClient } from "@/lib/auth-client";
import {
	useJoinExpedition,
	usePublicExpeditions,
} from "@/lib/hooks/useExpeditions";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

export function ExpeditionList() {
	const { data: expeditions, isLoading, error } = usePublicExpeditions();
	const joinExpedition = useJoinExpedition();
	const { data: session } = authClient.useSession();
	const { data: userProfile } = useUserProfile(session?.user?.id || "");

	const [inviteCode, setInviteCode] = useState("");
	const [copiedCodes, setCopiedCodes] = useState<Set<string>>(new Set());

	const isUserParticipating = (expedition: {
		participants: Array<{ userProfile: { userId: string } }>;
	}) => {
		if (!userProfile?.id) return false;
		return expedition.participants.some(
			(participant) => participant.userProfile.userId === userProfile.userId,
		);
	};

	const handleJoinExpedition = (expeditionId: string, isPrivate: boolean) => {
		if (!userProfile?.id) {
			console.error("User profile not found");
			return;
		}

		const data = {
			userProfileId: userProfile.id,
			...(isPrivate && { inviteCode }),
		};

		joinExpedition.mutate(
			{ id: expeditionId, data },
			{
				onSuccess: () => {
					setInviteCode("");
					toast.success("Successfully joined expedition!");
				},
				onError: (error: unknown) => {
					const errorMessage =
						(error as any)?.response?.data?.error ||
						(error as any)?.message ||
						"Failed to join expedition";
					if (errorMessage.includes("Already participating")) {
						toast.error("You're already part of this expedition!");
					} else {
						toast.error(errorMessage);
					}
				},
			},
		);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "upcoming":
				return "bg-blue-500";
			case "active":
				return "bg-green-500";
			case "completed":
				return "bg-gray-500";
			case "failed":
				return "bg-red-500";
			default:
				return "bg-gray-500";
		}
	};

	const copyInviteCode = async (inviteCode: string) => {
		try {
			await navigator.clipboard.writeText(inviteCode);
			setCopiedCodes((prev) => new Set(prev).add(inviteCode));
			setTimeout(() => {
				setCopiedCodes((prev) => {
					const newSet = new Set(prev);
					newSet.delete(inviteCode);
					return newSet;
				});
			}, 2000);
		} catch (error) {
			console.error("Failed to copy invite code:", error);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-lg">Loading expeditions...</div>
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
						: "Failed to load expeditions"}
				</div>
			</div>
		);
	}

	if (!expeditions || expeditions.length === 0) {
		return (
			<div className="text-center py-8">
				<h3 className="text-lg font-semibold mb-2">No expeditions available</h3>
				<p className="text-gray-600">Be the first to create an expedition!</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{expeditions.map((expedition) => (
				<Card key={expedition.id} className="hover:shadow-md transition-shadow">
					<CardHeader>
						<div className="flex items-start justify-between">
							<div className="space-y-1">
								<CardTitle className="text-xl">{expedition.name}</CardTitle>
								<CardDescription>
									{expedition.description || "No description provided"}
								</CardDescription>
							</div>
							<div className="flex items-center gap-2">
								<Badge className={getStatusColor(expedition.status)}>
									{expedition.status}
								</Badge>
								{!expedition.isPublic ? (
									<Badge variant="outline" className="flex items-center gap-1">
										<EyeOff className="h-3 w-3" />
										Private
									</Badge>
								) : (
									<Badge variant="outline" className="flex items-center gap-1">
										<Eye className="h-3 w-3" />
										Public
									</Badge>
								)}
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
							<div>
								<div className="text-sm text-gray-500">Target Points</div>
								<div className="font-semibold">
									{expedition.targetPoints.toLocaleString()}
								</div>
							</div>
							<div>
								<div className="text-sm text-gray-500">Duration</div>
								<div className="font-semibold">{expedition.duration} days</div>
							</div>
							<div>
								<div className="text-sm text-gray-500">Start Date</div>
								<div className="font-semibold">
									{formatDate(expedition.startDate)}
								</div>
							</div>
							<div>
								<div className="text-sm text-gray-500">Participants</div>
								<div className="font-semibold">
									{expedition.participants.length}
								</div>
							</div>
						</div>

						{/* Owner Information */}
						<div className="mb-4">
							<div className="text-sm text-gray-500 mb-2">Created by</div>
							<div className="flex items-center gap-2">
								<Badge variant="outline" className="px-3 py-1">
									{expedition.creator.characterClass?.name || "No Class"} -
									Level {expedition.creator.level}
								</Badge>
								<span className="text-sm text-gray-600">
									{expedition.creator.totalPoints.toLocaleString()} total points
								</span>
							</div>
						</div>

						{expedition.participants.length > 0 && (
							<div className="mb-4">
								<div className="text-sm text-gray-500 mb-2">Participants</div>
								<div className="flex flex-wrap gap-2">
									{expedition.participants.map((participant) => (
										<Badge key={participant.id} variant="secondary">
											{participant.userProfile.characterClass?.name ||
												"No Class"}{" "}
											- {participant.pointsEarned} pts
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* Invite Code Display for Private Expeditions */}
						{!expedition.isPublic && expedition.inviteCode && (
							<div className="mb-4 p-3 bg-gray-50 rounded-lg">
								<div className="flex items-center justify-between">
									<div>
										<div className="text-sm font-medium text-gray-700 mb-1">
											Invite Code
										</div>
										<div className="text-lg font-mono text-gray-900">
											{expedition.inviteCode}
										</div>
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => copyInviteCode(expedition.inviteCode || "")}
									>
										{copiedCodes.has(expedition.inviteCode || "") ? (
											<Check className="h-4 w-4" />
										) : (
											<Copy className="h-4 w-4" />
										)}
									</Button>
								</div>
							</div>
						)}

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								{isUserParticipating(expedition) ? (
									<Badge variant="secondary" className="px-3 py-1">
										✓ Already Joined
									</Badge>
								) : expedition.isPublic ? (
									<Button
										onClick={() => handleJoinExpedition(expedition.id, false)}
										disabled={joinExpedition.isPending}
										size="sm"
									>
										{joinExpedition.isPending
											? "Joining..."
											: "Join Expedition"}
									</Button>
								) : (
									<>
										<Input
											placeholder="Enter invite code"
											value={inviteCode}
											onChange={(e) => setInviteCode(e.target.value)}
											className="max-w-xs"
										/>
										<Button
											onClick={() => handleJoinExpedition(expedition.id, true)}
											disabled={joinExpedition.isPending || !inviteCode.trim()}
											size="sm"
										>
											{joinExpedition.isPending
												? "Joining..."
												: "Join with Code"}
										</Button>
									</>
								)}
							</div>
							<Link to={`/expedition/${expedition.id}` as any}>
								<Button variant="outline" size="sm">
									View Details
								</Button>
							</Link>
						</div>

						{joinExpedition.isError && (
							<div className="text-red-500 text-sm mt-2">
								{joinExpedition.error?.message || "Failed to join expedition"}
							</div>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
