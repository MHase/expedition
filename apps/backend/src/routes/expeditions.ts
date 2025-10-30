import { Hono } from "hono";
import type { HonoEnv } from "..";
import { getClient } from "../lib/prisma";

const app = new Hono<HonoEnv>();

// Get all public expeditions
app.get("/public", async (c) => {
	const prisma = getClient(c.env.DB);

	try {
		const expeditions = await prisma.expedition.findMany({
			where: {
				isPublic: true,
				status: "upcoming",
			},
			include: {
				participants: {
					include: {
						userProfile: {
							include: {
								characterClass: true,
							},
						},
					},
				},
				creator: {
					include: {
						characterClass: true,
					},
				},
			},
			orderBy: { startDate: "asc" },
		});

		// Task: Attach userName to userProfile for safe frontend display
		const allIds = new Set<string>();
		for (const e of expeditions) {
			for (const p of e.participants) {
				allIds.add(p.userProfile.userId);
			}
			allIds.add(e.creator.userId);
		}
		const users = await prisma.user.findMany({
			where: { id: { in: Array.from(allIds) } },
			select: { id: true, name: true },
		});
		const idToName = new Map(users.map((u) => [u.id, u.name] as const));
		const withNames = expeditions.map((e) => ({
			...e,
			participants: e.participants.map((p) => ({
				...p,
				userProfile: {
					...p.userProfile,
					userName: idToName.get(p.userProfile.userId) || null,
				},
			})),
			creator: {
				...e.creator,
				userName: idToName.get(e.creator.userId) || null,
			},
		}));

		return c.json(withNames);
	} catch (error) {
		console.error("Error fetching public expeditions:", error);
		return c.json({ error: "Failed to fetch public expeditions" }, 500);
	}
});

// Get expedition by ID
app.get("/:id", async (c) => {
	const prisma = getClient(c.env.DB);
	const id = c.req.param("id");

	try {
		const expedition = await prisma.expedition.findUnique({
			where: { id },
			include: {
				participants: {
					include: {
						userProfile: {
							include: {
								characterClass: true,
							},
						},
					},
				},
				workouts: {
					include: {
						userProfile: {
							include: {
								characterClass: true,
							},
						},
						photos: true,
					},
					orderBy: { workoutDate: "desc" },
				},
				creator: {
					include: {
						characterClass: true,
					},
				},
			},
		});

		if (!expedition) {
			return c.json({ error: "Expedition not found" }, 404);
		}

		// Attach userName to userProfile entries
		const ids = new Set<string>();
		const expAny: any = expedition as any;
		(expAny.participants || []).forEach((p: any) => {
			ids.add(p.userProfile.userId);
		});
		expedition.workouts?.forEach((w) => {
			ids.add(w.userProfile.userId);
		});
		ids.add(expedition.creator.userId);
		const users = await prisma.user.findMany({
			where: { id: { in: Array.from(ids) } },
			select: { id: true, name: true },
		});
		const idToName = new Map(users.map((u) => [u.id, u.name] as const));
		const withNames = {
			...expedition,
			participants: expedition.participants.map((p) => ({
				...p,
				userProfile: {
					...p.userProfile,
					userName: idToName.get(p.userProfile.userId) || null,
				},
			})),
			workouts: expedition.workouts?.map((w) => ({
				...w,
				userProfile: {
					...w.userProfile,
					userName: idToName.get(w.userProfile.userId) || null,
				},
			})),
			creator: {
				...expedition.creator,
				userName: idToName.get(expedition.creator.userId) || null,
			},
		};

		return c.json(withNames);
	} catch (error) {
		console.error("Error fetching expedition:", error);
		return c.json({ error: "Failed to fetch expedition" }, 500);
	}
});

// Get expedition leaderboard
app.get("/:id/leaderboard", async (c) => {
	const prisma = getClient(c.env.DB);
	const id = c.req.param("id");

	try {
		const expedition = await prisma.expedition.findUnique({
			where: { id },
			include: {
				participants: {
					include: {
						userProfile: {
							include: {
								characterClass: true,
							},
						},
					},
				},
			},
		});

		if (!expedition) {
			return c.json({ error: "Expedition not found" }, 404);
		}

		const participants = await prisma.userExpedition.findMany({
			where: { expeditionId: id },
			include: {
				userProfile: {
					include: {
						characterClass: true,
					},
				},
			},
			orderBy: { pointsEarned: "desc" },
		});

		// Attach userName to userProfile entries
		const ids = Array.from(
			new Set(participants.map((p) => p.userProfile.userId)),
		);
		const users = await prisma.user.findMany({
			where: { id: { in: ids } },
			select: { id: true, name: true },
		});
		const idToName = new Map(users.map((u) => [u.id, u.name] as const));
		const withNames = participants.map((p) => ({
			...p,
			userProfile: {
				...p.userProfile,
				userName: idToName.get(p.userProfile.userId) || null,
			},
		}));

		return c.json(withNames);
	} catch (error) {
		console.error("Error fetching expedition leaderboard:", error);
		return c.json({ error: "Failed to fetch expedition leaderboard" }, 500);
	}
});

// Get expedition progress
app.get("/:id/progress", async (c) => {
	const prisma = getClient(c.env.DB);
	const id = c.req.param("id");

	try {
		const expedition = await prisma.expedition.findUnique({
			where: { id },
			include: {
				participants: {
					include: {
						userProfile: {
							include: {
								characterClass: true,
							},
						},
					},
				},
			},
		});

		if (!expedition) {
			return c.json({ error: "Expedition not found" }, 404);
		}

		// Get total points earned by all participants
		const totalPoints = await prisma.userExpedition.aggregate({
			where: { expeditionId: id },
			_sum: { pointsEarned: true },
		});

		// Get participant count
		const participantCount = await prisma.userExpedition.count({
			where: { expeditionId: id },
		});

		// Calculate progress percentage
		const progressPercentage =
			expedition.targetPoints > 0
				? Math.min(
						((totalPoints._sum.pointsEarned || 0) / expedition.targetPoints) *
							100,
						100,
					)
				: 0;

		// Get recent workouts for this expedition
		const recentWorkouts = await prisma.workout.findMany({
			where: { expeditionId: id },
			include: {
				userProfile: {
					include: {
						characterClass: true,
					},
				},
			},
			orderBy: { workoutDate: "desc" },
			take: 10,
		});

		// Attach userName to related userProfiles
		const ids = new Set<string>();
		const expAny: any = expedition as any;
		for (const p of expAny.participants || []) {
			ids.add(p.userProfile.userId);
		}
		for (const w of recentWorkouts) {
			ids.add(w.userProfile.userId);
		}
		const users = await prisma.user.findMany({
			where: { id: { in: Array.from(ids) } },
			select: { id: true, name: true },
		});
		const idToName = new Map(users.map((u) => [u.id, u.name] as const));
		const expeditionWithParticipantNames = {
			...expedition,
			participants: (expAny.participants || []).map((p: any) => ({
				...p,
				userProfile: {
					...p.userProfile,
					userName: idToName.get(p.userProfile.userId) || null,
				},
			})),
		};
		const recentWithNames = recentWorkouts.map((w) => ({
			...w,
			userProfile: {
				...w.userProfile,
				userName: idToName.get(w.userProfile.userId) || null,
			},
		}));

		return c.json({
			expedition: expeditionWithParticipantNames,
			totalPoints: totalPoints._sum.pointsEarned || 0,
			targetPoints: expedition.targetPoints,
			progressPercentage: Math.round(progressPercentage * 100) / 100,
			participantCount,
			recentWorkouts: recentWithNames,
		});
	} catch (error) {
		console.error("Error fetching expedition progress:", error);
		return c.json({ error: "Failed to fetch expedition progress" }, 500);
	}
});

// Create new expedition
app.post("/", async (c) => {
	const prisma = getClient(c.env.DB);
	const body = await c.req.json();
	const {
		name,
		description,
		targetPoints,
		duration,
		isPublic,
		startDate,
		createdById, // This is actually userId, we need to find the userProfileId
	} = body;

	try {
		// Find the user profile for the creator
		const userProfile = await prisma.userProfile.findUnique({
			where: { userId: createdById },
		});

		if (!userProfile) {
			return c.json(
				{
					error:
						"User profile not found. Please select a character class first.",
				},
				400,
			);
		}

		// Calculate end date
		const start = new Date(startDate);
		const endDate = new Date(start);
		endDate.setDate(start.getDate() + duration);

		// Generate invite code for private expeditions
		const inviteCode = !isPublic ? generateInviteCode() : null;

		const expedition = await prisma.expedition.create({
			data: {
				id: crypto.randomUUID(),
				name,
				description,
				targetPoints,
				duration,
				isPublic,
				inviteCode,
				startDate: start,
				endDate,
				createdById: userProfile.id, // Use userProfile.id instead of userId
				status: "upcoming",
			},
			include: {
				participants: {
					include: {
						userProfile: {
							include: {
								characterClass: true,
							},
						},
					},
				},
				creator: {
					include: {
						characterClass: true,
					},
				},
			},
		});

		// Add creator as first participant
		await prisma.userExpedition.create({
			data: {
				id: crypto.randomUUID(),
				userProfileId: userProfile.id,
				expeditionId: expedition.id,
				pointsEarned: 0,
				isActive: true,
			},
		});

		// Return the expedition with updated participants
		const updatedExpedition = await prisma.expedition.findUnique({
			where: { id: expedition.id },
			include: {
				participants: {
					include: {
						userProfile: {
							include: {
								characterClass: true,
							},
						},
					},
				},
				creator: {
					include: {
						characterClass: true,
					},
				},
			},
		});

		return c.json(updatedExpedition);
	} catch (error) {
		console.error("Error creating expedition:", error);
		return c.json({ error: "Failed to create expedition" }, 500);
	}
});

// Join expedition
app.post("/:id/join", async (c) => {
	const prisma = getClient(c.env.DB);
	const id = c.req.param("id");
	const body = await c.req.json();
	const { userProfileId, inviteCode } = body;

	try {
		const expedition = await prisma.expedition.findUnique({
			where: { id },
		});

		if (!expedition) {
			return c.json({ error: "Expedition not found" }, 404);
		}

		// Check if expedition is still joinable
		if (expedition.status !== "upcoming") {
			return c.json({ error: "Expedition is no longer joinable" }, 400);
		}

		// Check invite code for private expeditions
		if (!expedition.isPublic && expedition.inviteCode !== inviteCode) {
			return c.json({ error: "Invalid invite code" }, 400);
		}

		// Check if user is already a participant
		const existingParticipation = await prisma.userExpedition.findUnique({
			where: {
				userProfileId_expeditionId: {
					userProfileId,
					expeditionId: id,
				},
			},
		});

		if (existingParticipation) {
			return c.json({ error: "Already participating in this expedition" }, 400);
		}

		// Add user to expedition
		const participation = await prisma.userExpedition.create({
			data: {
				id: crypto.randomUUID(),
				userProfileId,
				expeditionId: id,
				pointsEarned: 0,
				isActive: true,
			},
			include: {
				userProfile: {
					include: {
						characterClass: true,
					},
				},
				expedition: true,
			},
		});

		return c.json(participation);
	} catch (error) {
		console.error("Error joining expedition:", error);
		return c.json({ error: "Failed to join expedition" }, 500);
	}
});

// Join expedition by invite code
app.post("/join-by-code", async (c) => {
	const prisma = getClient(c.env.DB);
	const body = await c.req.json();
	const { userProfileId, inviteCode } = body;

	if (!userProfileId || !inviteCode) {
		return c.json({ error: "userProfileId and inviteCode are required" }, 400);
	}

	try {
		// Find expedition by invite code
		const expedition = await prisma.expedition.findFirst({
			where: {
				inviteCode,
				isPublic: false,
			},
		});

		if (!expedition) {
			return c.json({ error: "Invalid invite code" }, 404);
		}

		// Check if expedition is still joinable
		if (expedition.status !== "upcoming") {
			return c.json({ error: "Expedition is no longer joinable" }, 400);
		}

		// Check if user is already a participant
		const existingParticipation = await prisma.userExpedition.findUnique({
			where: {
				userProfileId_expeditionId: {
					userProfileId,
					expeditionId: expedition.id,
				},
			},
		});

		if (existingParticipation) {
			return c.json({ error: "Already participating in this expedition" }, 400);
		}

		// Add user to expedition
		const participation = await prisma.userExpedition.create({
			data: {
				id: crypto.randomUUID(),
				userProfileId,
				expeditionId: expedition.id,
				pointsEarned: 0,
				isActive: true,
			},
			include: {
				userProfile: {
					include: {
						characterClass: true,
					},
				},
				expedition: true,
			},
		});

		return c.json(participation);
	} catch (error) {
		console.error("Error joining expedition by code:", error);
		return c.json({ error: "Failed to join expedition" }, 500);
	}
});

// Leave expedition
app.delete("/:id/leave", async (c) => {
	const prisma = getClient(c.env.DB);
	const id = c.req.param("id");
	const body = await c.req.json();
	const { userProfileId } = body;

	try {
		const participation = await prisma.userExpedition.findUnique({
			where: {
				userProfileId_expeditionId: {
					userProfileId,
					expeditionId: id,
				},
			},
		});

		if (!participation) {
			return c.json({ error: "Not participating in this expedition" }, 404);
		}

		// Don't allow leaving if expedition has started
		const expedition = await prisma.expedition.findUnique({
			where: { id },
		});

		if (expedition && expedition.status === "active") {
			return c.json({ error: "Cannot leave active expedition" }, 400);
		}

		await prisma.userExpedition.delete({
			where: {
				userProfileId_expeditionId: {
					userProfileId,
					expeditionId: id,
				},
			},
		});

		return c.json({ message: "Successfully left expedition" });
	} catch (error) {
		console.error("Error leaving expedition:", error);
		return c.json({ error: "Failed to leave expedition" }, 500);
	}
});

// Get user's expeditions
app.get("/user/:userProfileId", async (c) => {
	const prisma = getClient(c.env.DB);
	const userProfileId = c.req.param("userProfileId");

	try {
		const participations = await prisma.userExpedition.findMany({
			where: { userProfileId },
			include: {
				expedition: {
					include: {
						participants: {
							include: {
								userProfile: {
									include: {
										characterClass: true,
									},
								},
							},
						},
					},
				},
			},
			orderBy: { joinedAt: "desc" },
		});

		return c.json(participations);
	} catch (error) {
		console.error("Error fetching user expeditions:", error);
		return c.json({ error: "Failed to fetch user expeditions" }, 500);
	}
});

// Helper function to generate invite code
function generateInviteCode(): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let result = "";
	for (let i = 0; i < 8; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

export { app as expeditionRoutes };
