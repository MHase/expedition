import { Key, Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useJoinExpeditionByCode } from "@/lib/hooks/useExpeditions";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

interface JoinPrivateExpeditionDialogProps {
	onSuccess?: () => void;
}

export function JoinPrivateExpeditionDialog({
	onSuccess,
}: JoinPrivateExpeditionDialogProps) {
	const [open, setOpen] = useState(false);
	const [inviteCode, setInviteCode] = useState("");
	const [isJoining, setIsJoining] = useState(false);
	const inviteCodeId = useId();

	const { data: session } = authClient.useSession();
	const { data: userProfile } = useUserProfile(session?.user?.id || "");
	const joinExpedition = useJoinExpeditionByCode();

	const handleJoin = async () => {
		if (!userProfile?.id || !inviteCode.trim()) {
			return;
		}

		setIsJoining(true);
		try {
			await joinExpedition.mutateAsync({
				userProfileId: userProfile.id,
				inviteCode: inviteCode.trim(),
			});

			// Reset form and close dialog
			setInviteCode("");
			setOpen(false);
			toast.success("Successfully joined expedition!");
			onSuccess?.();
		} catch (error: unknown) {
			console.error("Failed to join expedition:", error);
			const errorMessage =
				(error as any)?.response?.data?.error ||
				(error as any)?.message ||
				"Failed to join expedition";
			if (errorMessage.includes("Already participating")) {
				toast.error("You're already part of this expedition!");
			} else if (errorMessage.includes("Invalid invite code")) {
				toast.error("Invalid invite code. Please check and try again.");
			} else {
				toast.error(errorMessage);
			}
		} finally {
			setIsJoining(false);
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (!newOpen) {
			setInviteCode("");
			setIsJoining(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline" className="flex items-center gap-2">
					<Key className="h-4 w-4" />
					Join with Code
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Join Private Expedition</DialogTitle>
					<DialogDescription>
						Enter the invite code to join a private expedition.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor={inviteCodeId} className="text-right">
							Invite Code
						</Label>
						<Input
							id={inviteCodeId}
							value={inviteCode}
							onChange={(e) => setInviteCode(e.target.value)}
							placeholder="Enter expedition invite code"
							className="col-span-3"
							onKeyDown={(e) => {
								if (e.key === "Enter" && inviteCode.trim()) {
									handleJoin();
								}
							}}
						/>
					</div>
				</div>

				{joinExpedition.isError && (
					<div className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-md">
						{joinExpedition.error?.message || "Failed to join expedition"}
					</div>
				)}

				<DialogFooter>
					<Button
						onClick={handleJoin}
						disabled={
							!inviteCode.trim() || isJoining || joinExpedition.isPending
						}
						className="w-full"
					>
						{isJoining || joinExpedition.isPending ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Joining...
							</>
						) : (
							"Join Expedition"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
