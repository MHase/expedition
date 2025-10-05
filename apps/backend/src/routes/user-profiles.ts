import { Hono } from "hono";
import type { HonoEnv } from "..";
import { getClient } from "../lib/prisma";

const app = new Hono<HonoEnv>();

// Get user profile by user ID
app.get("/:userId", async (c) => {
	const prisma = getClient(c.env.DB);
	const userId = c.req.param("userId");

	try {
		const userProfile = await prisma.userProfile.findUnique({
			where: { userId },
			include: {
				characterClass: true,
				expeditions: {
					include: {
						expedition: true,
					},
				},
				workouts: {
					orderBy: { createdAt: "desc" },
					take: 10, // Last 10 workouts
				},
				artifacts: {
					include: {
						artifact: true,
					},
					orderBy: { earnedAt: "desc" },
				},
			},
		});

		if (!userProfile) {
			return c.json({ error: "User profile not found" }, 404);
		}

		return c.json(userProfile);
	} catch (error) {
		console.error("Error fetching user profile:", error);
		return c.json({ error: "Failed to fetch user profile" }, 500);
	}
});

// Create or update user profile
app.post("/", async (c) => {
	const prisma = getClient(c.env.DB);
	const body = await c.req.json();
	const { userId, characterClassId } = body;

	try {
		// Check if user profile already exists
		const existingProfile = await prisma.userProfile.findUnique({
			where: { userId },
		});

		if (existingProfile) {
			// Update existing profile
			const updatedProfile = await prisma.userProfile.update({
				where: { userId },
				data: {
					characterClassId,
					updatedAt: new Date(),
				},
				include: {
					characterClass: true,
				},
			});

			return c.json(updatedProfile);
		} else {
			// Create new profile
			const newProfile = await prisma.userProfile.create({
				data: {
					id: crypto.randomUUID(),
					userId,
					characterClassId,
					totalPoints: 0,
					level: 1,
				},
				include: {
					characterClass: true,
				},
			});

			return c.json(newProfile);
		}
	} catch (error) {
		console.error("Error creating/updating user profile:", error);
		return c.json({ error: "Failed to create/update user profile" }, 500);
	}
});

// Update user profile (points, level, etc.)
app.patch("/:userId", async (c) => {
	const prisma = getClient(c.env.DB);
	const userId = c.req.param("userId");
	const body = await c.req.json();
	const { totalPoints, level, characterClassId } = body;

	try {
		const updatedProfile = await prisma.userProfile.update({
			where: { userId },
			data: {
				...(totalPoints !== undefined && { totalPoints }),
				...(level !== undefined && { level }),
				...(characterClassId !== undefined && { characterClassId }),
				updatedAt: new Date(),
			},
			include: {
				characterClass: true,
			},
		});

		return c.json(updatedProfile);
	} catch (error) {
		console.error("Error updating user profile:", error);
		return c.json({ error: "Failed to update user profile" }, 500);
	}
});

export { app as userProfileRoutes };
