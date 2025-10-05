import { Hono } from "hono";
import type { HonoEnv } from "..";
import { getClient } from "../lib/prisma";
import { authMiddleware } from "../middlewares";

const app = new Hono<HonoEnv>();

// Delete user and all related data
app.delete("/", authMiddleware, async (c) => {
	const prisma = getClient(c.env.DB);
	const { userId } = await c.req.json();

	if (!userId) {
		return c.json({ error: "userId is required" }, 400);
	}

	try {
		// Start a transaction to ensure data consistency
		await prisma.$transaction(async (tx) => {
			// 1. Get user profile to find all related data
			const userProfile = await tx.userProfile.findUnique({
				where: { userId },
				include: {
					workouts: true,
					artifacts: true,
					expeditions: true,
					createdExpeditions: true,
				},
			});

			if (!userProfile) {
				throw new Error("User profile not found");
			}

			// 2. Delete workout photos first (foreign key constraint)
			const workoutIds = userProfile.workouts.map((workout) => workout.id);
			if (workoutIds.length > 0) {
				await tx.workoutPhoto.deleteMany({
					where: { workoutId: { in: workoutIds } },
				});
			}

			// 3. Delete user's workouts
			await tx.workout.deleteMany({
				where: { userProfileId: userProfile.id },
			});

			// 4. Delete user's artifacts
			await tx.userArtifact.deleteMany({
				where: { userProfileId: userProfile.id },
			});

			// 5. Remove user from expeditions (but keep expeditions if others joined)
			await tx.userExpedition.deleteMany({
				where: { userProfileId: userProfile.id },
			});

			// 6. Handle expeditions created by this user
			for (const expedition of userProfile.createdExpeditions) {
				// Check if expedition has other participants
				const participantCount = await tx.userExpedition.count({
					where: { expeditionId: expedition.id },
				});

				if (participantCount === 0) {
					// No other participants, safe to delete the expedition
					await tx.workoutPhoto.deleteMany({
						where: {
							workout: { expeditionId: expedition.id },
						},
					});
					await tx.workout.deleteMany({
						where: { expeditionId: expedition.id },
					});
					await tx.userExpedition.deleteMany({
						where: { expeditionId: expedition.id },
					});
					await tx.expedition.delete({
						where: { id: expedition.id },
					});
				} else {
					// Expedition has other participants, transfer ownership to first participant
					const firstParticipant = await tx.userExpedition.findFirst({
						where: { expeditionId: expedition.id },
						include: { userProfile: true },
					});

					if (firstParticipant) {
						await tx.expedition.update({
							where: { id: expedition.id },
							data: { createdById: firstParticipant.userProfile.id },
						});
					}
				}
			}

			// 7. Delete user profile
			await tx.userProfile.delete({
				where: { id: userProfile.id },
			});

			// 8. Delete user from Better Auth (this will be handled by Better Auth)
			// We don't need to delete the user from the user table as Better Auth handles this
		});

		return c.json({
			message: "User and all related data deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting user:", error);
		return c.json({ error: "Failed to delete user data" }, 500);
	}
});

export { app as userDeletionRoutes };
