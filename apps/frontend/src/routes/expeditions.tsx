import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { CreateExpeditionDialog } from "@/components/CreateExpeditionDialog";
import { ExpeditionList } from "@/components/ExpeditionList";
import { JoinPrivateExpeditionDialog } from "@/components/JoinPrivateExpeditionDialog";
import { UserProfileDisplay } from "@/components/UserProfileDisplay";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/expeditions")({
	component: Expeditions,
});

function Expeditions() {
	return (
		<AuthGuard requireCharacterClass>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-6xl mx-auto px-4">
					<div className="flex items-center justify-between mb-8">
						<div>
							<h1 className="text-3xl font-bold">Expeditions</h1>
							<p className="text-gray-600 mt-2">
								Join fitness challenges or create your own expedition
							</p>
						</div>
						<div className="flex items-center gap-4">
							<Link to="/my-expeditions">
								<Button variant="outline">My Expeditions</Button>
							</Link>
							<JoinPrivateExpeditionDialog />
							<CreateExpeditionDialog />
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
						<div className="lg:col-span-3">
							<div className="space-y-6">
								<div>
									<h2 className="text-2xl font-semibold mb-4">
										Available Expeditions
									</h2>
									<ExpeditionList />
								</div>
							</div>
						</div>

						<div className="lg:col-span-1">
							<UserProfileDisplay />
						</div>
					</div>
				</div>
			</div>
		</AuthGuard>
	);
}
