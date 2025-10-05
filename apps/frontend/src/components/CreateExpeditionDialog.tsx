import { useId, useState } from "react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { useCreateExpedition } from "@/lib/hooks/useExpeditions";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

interface CreateExpeditionDialogProps {
	onSuccess?: () => void;
}

export function CreateExpeditionDialog({
	onSuccess,
}: CreateExpeditionDialogProps) {
	const [open, setOpen] = useState(false);
	const nameId = useId();
	const descriptionId = useId();
	const targetPointsId = useId();
	const durationId = useId();
	const startDateId = useId();
	const visibilityId = useId();
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		targetPoints: 1000,
		duration: 7,
		isPublic: true,
		startDate: "",
	});

	const createExpedition = useCreateExpedition();
	const { data: session } = authClient.useSession();
	const { data: userProfile } = useUserProfile(session?.user?.id || "");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!session?.user?.id) {
			console.error("User not authenticated");
			return;
		}

		if (!userProfile) {
			console.error(
				"User profile not found. Please select a character class first.",
			);
			return;
		}

		createExpedition.mutate(
			{
				...formData,
				createdById: session.user.id,
			},
			{
				onSuccess: () => {
					setOpen(false);
					setFormData({
						name: "",
						description: "",
						targetPoints: 1000,
						duration: 7,
						isPublic: true,
						startDate: "",
					});
					onSuccess?.();
				},
			},
		);
	};

	const handleInputChange = (
		field: string,
		value: string | number | boolean,
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	if (!userProfile) {
		return (
			<Button disabled>Create Expedition (Select Character Class First)</Button>
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Create Expedition</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create New Expedition</DialogTitle>
					<DialogDescription>
						Create a new fitness expedition for you and your friends to join.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label htmlFor={nameId} className="text-sm font-medium">
							Expedition Name
						</label>
						<Input
							id={nameId}
							value={formData.name}
							onChange={(e) => handleInputChange("name", e.target.value)}
							placeholder="e.g., Summer Fitness Challenge"
							required
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor={descriptionId} className="text-sm font-medium">
							Description (Optional)
						</label>
						<Textarea
							id={descriptionId}
							value={formData.description}
							onChange={(e) => handleInputChange("description", e.target.value)}
							placeholder="Describe your expedition..."
							rows={3}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<label htmlFor={targetPointsId} className="text-sm font-medium">
								Target Points
							</label>
							<Input
								id={targetPointsId}
								type="number"
								value={formData.targetPoints}
								onChange={(e) =>
									handleInputChange(
										"targetPoints",
										parseInt(e.target.value) || 0,
									)
								}
								min="100"
								step="100"
								required
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor={durationId} className="text-sm font-medium">
								Duration (Days)
							</label>
							<Select
								value={formData.duration.toString()}
								onValueChange={(value) =>
									handleInputChange("duration", parseInt(value))
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="3">3 Days</SelectItem>
									<SelectItem value="7">7 Days</SelectItem>
									<SelectItem value="14">14 Days</SelectItem>
									<SelectItem value="30">30 Days</SelectItem>
									<SelectItem value="60">60 Days</SelectItem>
									<SelectItem value="90">90 Days</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-2">
						<label htmlFor={startDateId} className="text-sm font-medium">
							Start Date
						</label>
						<Input
							id={startDateId}
							type="date"
							value={formData.startDate}
							onChange={(e) => handleInputChange("startDate", e.target.value)}
							min={new Date().toISOString().split("T")[0]}
							required
						/>
					</div>

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
								<SelectItem value="public">Public - Anyone can join</SelectItem>
								<SelectItem value="private">
									Private - Invite code required
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={createExpedition.isPending}>
							{createExpedition.isPending ? "Creating..." : "Create Expedition"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
