import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Settings, Trash2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { useCharacterClasses } from "@/lib/hooks/useCharacterClasses";
import { useUserExpeditions } from "@/lib/hooks/useExpeditions";
import { useDeleteUser } from "@/lib/hooks/useUserDeletion";
import {
	useCreateOrUpdateUserProfile,
	useUserProfile,
} from "@/lib/hooks/useUserProfile";

export const Route = createFileRoute("/profile")({
	component: Profile,
});

function Profile() {
	const { data: session } = authClient.useSession();
	const { data: userProfile } = useUserProfile(session?.user?.id || "");
	const { data: characterClasses } = useCharacterClasses();
	const { data: userExpeditions } = useUserExpeditions(userProfile?.id || "");
	const updateProfile = useCreateOrUpdateUserProfile();
	const deleteUser = useDeleteUser();

	const [isChangingClass, setIsChangingClass] = useState(false);
	const [isDeletingAccount, setIsDeletingAccount] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const isInActiveExpedition = userExpeditions?.some(
		(expedition) =>
			expedition.expedition.status === "active" && expedition.isActive,
	);

	const handleClassChange = async (newClassId: string) => {
		if (!userProfile?.id || !session?.user?.id) return;

		setIsChangingClass(true);
		try {
			await updateProfile.mutateAsync({
				userId: session.user.id,
				characterClassId: newClassId,
			});
			toast.success("Character class updated successfully!");
		} catch (error) {
			console.error("Failed to update character class:", error);
			toast.error("Failed to update character class");
		} finally {
			setIsChangingClass(false);
		}
	};

	const handleDeleteAccount = async () => {
		if (!session?.user?.id) return;

		setIsDeletingAccount(true);
		try {
			// First delete all user data from our database
			await deleteUser.mutateAsync({ userId: session.user.id });

			// Then delete the user account from Better Auth
			await authClient.deleteUser();
			toast.success("Account and all data deleted successfully");
			// Redirect will happen automatically via Better Auth
		} catch (error) {
			console.error("Failed to delete account:", error);
			toast.error("Failed to delete account");
		} finally {
			setIsDeletingAccount(false);
			setShowDeleteDialog(false);
		}
	};

	if (!userProfile) {
		return (
			<AuthGuard>
				<div className="min-h-screen bg-gray-50 py-8">
					<div className="max-w-4xl mx-auto px-4">
						<div className="text-center text-gray-500">Loading profile...</div>
					</div>
				</div>
			</AuthGuard>
		);
	}

	return (
		<AuthGuard requireCharacterClass>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4">
					<div className="mb-8">
						<h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
						<p className="text-gray-600">
							Manage your account settings and character class
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Account Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<User className="h-5 w-5" />
									Account Information
								</CardTitle>
								<CardDescription>
									Your account details and authentication info
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<div className="text-sm font-medium text-gray-500">Name</div>
									<p className="text-lg">
										{session?.user?.name || "Not provided"}
									</p>
								</div>
								<div>
									<div className="text-sm font-medium text-gray-500">Email</div>
									<p className="text-lg">{session?.user?.email}</p>
								</div>
								<div>
									<div className="text-sm font-medium text-gray-500">
										User ID
									</div>
									<p className="text-sm font-mono text-gray-600">
										{session?.user?.id}
									</p>
								</div>
								<div>
									<div className="text-sm font-medium text-gray-500">
										Member Since
									</div>
									<p className="text-lg">
										{new Date(userProfile.createdAt).toLocaleDateString(
											"en-US",
											{
												year: "numeric",
												month: "long",
												day: "numeric",
											},
										)}
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Character Class Settings */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Settings className="h-5 w-5" />
									Character Class
								</CardTitle>
								<CardDescription>
									Change your character class and view your stats
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{userProfile.characterClass && (
									<div>
										<div className="text-sm font-medium text-gray-500">
											Current Class
										</div>
										<div className="mt-2">
											<Badge variant="outline" className="text-lg px-3 py-1">
												{userProfile.characterClass.name}
											</Badge>
										</div>
										<p className="text-sm text-gray-600 mt-2">
											{userProfile.characterClass.description}
										</p>
									</div>
								)}

								<div>
									<div className="text-sm font-medium text-gray-500">
										Total Points
									</div>
									<p className="text-2xl font-bold text-green-600">
										{userProfile.totalPoints.toLocaleString()}
									</p>
								</div>

								<div>
									<div className="text-sm font-medium text-gray-500">Level</div>
									<p className="text-2xl font-bold text-blue-600">
										{userProfile.level}
									</p>
								</div>

								<Separator />

								<div>
									<div className="text-sm font-medium text-gray-500 mb-2">
										Change Character Class
									</div>
									{isInActiveExpedition ? (
										<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
											<div className="flex items-center gap-2 text-yellow-800">
												<AlertTriangle className="h-4 w-4" />
												<span className="text-sm font-medium">
													Cannot change class while in active expedition
												</span>
											</div>
											<p className="text-sm text-yellow-700 mt-1">
												You must complete or leave your current expedition
												before changing your character class.
											</p>
										</div>
									) : (
										<Select
											value={userProfile.characterClassId || ""}
											onValueChange={handleClassChange}
											disabled={isChangingClass}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select a character class" />
											</SelectTrigger>
											<SelectContent>
												{characterClasses?.map((characterClass) => (
													<SelectItem
														key={characterClass.id}
														value={characterClass.id}
													>
														<div className="flex flex-col">
															<span className="font-medium">
																{characterClass.name}
															</span>
															<span className="text-sm text-gray-500">
																{characterClass.description}
															</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Danger Zone */}
					<Card className="mt-6 border-red-200">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-red-600">
								<Trash2 className="h-5 w-5" />
								Danger Zone
							</CardTitle>
							<CardDescription>
								Irreversible and destructive actions
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-between">
								<div>
									<h4 className="font-medium text-red-600">Delete Account</h4>
									<p className="text-sm text-gray-600 mt-1">
										Permanently delete your account and all associated data.
										This action cannot be undone.
									</p>
								</div>
								<Dialog
									open={showDeleteDialog}
									onOpenChange={setShowDeleteDialog}
								>
									<DialogTrigger asChild>
										<Button variant="destructive">Delete Account</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Delete Account</DialogTitle>
											<DialogDescription>
												Are you sure you want to delete your account? This
												action cannot be undone. All your data, including
												expeditions, workouts, and progress will be permanently
												deleted.
											</DialogDescription>
										</DialogHeader>
										<DialogFooter>
											<Button
												variant="outline"
												onClick={() => setShowDeleteDialog(false)}
												disabled={isDeletingAccount}
											>
												Cancel
											</Button>
											<Button
												variant="destructive"
												onClick={handleDeleteAccount}
												disabled={isDeletingAccount}
											>
												{isDeletingAccount ? "Deleting..." : "Delete Account"}
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</AuthGuard>
	);
}
