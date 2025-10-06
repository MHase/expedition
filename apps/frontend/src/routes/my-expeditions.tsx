import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy, Eye, EyeOff, Trophy } from "lucide-react";
import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { JoinPrivateExpeditionDialog } from "@/components/JoinPrivateExpeditionDialog";
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
import { useUserExpeditions } from "@/lib/hooks/useExpeditions";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

export const Route = createFileRoute("/my-expeditions")({
	component: MyExpeditions,
});

function MyExpeditions() {
	const { data: session } = authClient.useSession();
	const { data: userProfile } = useUserProfile(session?.user?.id || "");
	const {
		data: userExpeditions,
		isLoading,
		error,
	} = useUserExpeditions(userProfile?.id || "");
	const [copiedCodes, setCopiedCodes] = useState<Set<string>>(new Set());

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800";
			case "completed":
				return "bg-blue-100 text-blue-800";
			case "failed":
				return "bg-red-100 text-red-800";
			case "upcoming":
				return "bg-yellow-100 text-yellow-800";
			default:
				return "bg-gray-100 text-gray-800";
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
			<AuthGuard requireCharacterClass>
				<div className="min-h-screen bg-gray-50 py-8">
					<div className="max-w-6xl mx-auto px-4">
						<div className="text-center text-gray-500">
							Loading your expeditions...
						</div>
					</div>
				</div>
			</AuthGuard>
		);
	}

	if (error) {
		return (
			<AuthGuard requireCharacterClass>
				<div className="min-h-screen bg-gray-50 py-8">
					<div className="max-w-6xl mx-auto px-4">
						<div className="text-center text-red-500">
							Error:{" "}
							{error instanceof Error
								? error.message
								: "Failed to load expeditions"}
						</div>
					</div>
				</div>
			</AuthGuard>
		);
	}

	return (
		<AuthGuard requireCharacterClass>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-6xl mx-auto px-4">
					<div className="mb-8">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-3xl font-bold mb-2">My Expeditions</h1>
								<p className="text-gray-600">
									Manage your expeditions and track your progress
								</p>
							</div>
							<div className="flex items-center gap-4">
								<JoinPrivateExpeditionDialog />
								<Link to="/expeditions">
									<Button variant="outline">Browse All</Button>
								</Link>
							</div>
						</div>
					</div>

					{!userExpeditions || userExpeditions.length === 0 ? (
						<Card>
							<CardContent className="text-center py-12">
								<Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									No Expeditions Yet
								</h3>
								<p className="text-gray-600 mb-6">
									You haven't joined any expeditions yet. Start your fitness
									adventure!
								</p>
								<Link to="/expeditions">
									<Button>Browse Expeditions</Button>
								</Link>
							</CardContent>
						</Card>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{userExpeditions.map((userExpedition) => {
								console.log(userExpedition);
								const expedition = userExpedition.expedition;

								return (
									<Card
										key={userExpedition.id}
										className="hover:shadow-lg transition-shadow"
									>
										<CardHeader>
											<div className="flex items-start justify-between">
												<div className="space-y-1">
													<CardTitle className="text-xl">
														{expedition.name}
													</CardTitle>
													<CardDescription>
														{expedition.description ||
															"No description provided"}
													</CardDescription>
												</div>
												<div className="flex items-center gap-2">
													<Badge className={getStatusColor(expedition.status)}>
														{expedition.status}
													</Badge>
													{!expedition.isPublic && (
														<Badge
															variant="outline"
															className="flex items-center gap-1"
														>
															<EyeOff className="h-3 w-3" />
															Private
														</Badge>
													)}
													{expedition.isPublic && (
														<Badge
															variant="outline"
															className="flex items-center gap-1"
														>
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
													<div className="text-sm text-gray-500">
														Target Points
													</div>
													<div className="font-semibold">
														{expedition.targetPoints.toLocaleString()}
													</div>
												</div>
												<div>
													<div className="text-sm text-gray-500">Duration</div>
													<div className="font-semibold">
														{expedition.duration} days
													</div>
												</div>
												<div>
													<div className="text-sm text-gray-500">
														Start Date
													</div>
													<div className="font-semibold">
														{formatDate(expedition.startDate)}
													</div>
												</div>
												<div>
													<div className="text-sm text-gray-500">
														Your Points
													</div>
													<div className="font-semibold text-green-600">
														{userExpedition.pointsEarned.toFixed(1)}
													</div>
												</div>
											</div>

											{/* Progress Bar */}
											<div className="mb-4">
												<div className="flex justify-between text-sm mb-1">
													<span>Progress</span>
													<span>
														{(
															(userExpedition.pointsEarned /
																expedition.targetPoints) *
															100
														).toFixed(1)}
														%
													</span>
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2">
													<div
														className="bg-blue-600 h-2 rounded-full transition-all duration-300"
														style={{
															width: `${Math.min(
																(userExpedition.pointsEarned /
																	expedition.targetPoints) *
																	100,
																100,
															)}%`,
														}}
													></div>
												</div>
											</div>

											{/* Invite Code for Private Expeditions */}
											{!expedition.isPublic && expedition.inviteCode && (
												<div className="mb-4 p-3 bg-gray-50 rounded-lg">
													<div className="flex items-center justify-between">
														<div>
															<div className="text-sm font-medium text-gray-700">
																Invite Code
															</div>
															<div className="text-lg font-mono text-gray-900">
																{expedition.inviteCode}
															</div>
														</div>
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																copyInviteCode(expedition.inviteCode || "")
															}
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
												<div className="text-sm text-gray-500">
													Joined: {formatDate(userExpedition.joinedAt)}
												</div>
												<div className="flex gap-2">
													<Link to={`/expedition/${expedition.id}` as any}>
														<Button variant="outline" size="sm">
															View Details
														</Button>
													</Link>
													{!userExpedition.isActive && (
														<Badge variant="destructive" className="text-xs">
															Inactive
														</Badge>
													)}
												</div>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</AuthGuard>
	);
}
