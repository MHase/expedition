import { Hono } from "hono";
import type { HonoEnv } from "..";
import { getClient } from "../lib/prisma";

const app = new Hono<HonoEnv>();

// Get user's workouts
app.get("/user/:userProfileId", async (c) => {
	const prisma = getClient(c.env.DB);
	const userProfileId = c.req.param("userProfileId");
	const expeditionId = c.req.query("expeditionId");

	try {
		const whereClause: any = { userProfileId };
		if (expeditionId) {
			whereClause.expeditionId = expeditionId;
		}

		const workouts = await prisma.workout.findMany({
			where: whereClause,
			include: {
				photos: true,
				expedition: true,
			},
			orderBy: { workoutDate: "desc" },
		});

		return c.json(workouts);
	} catch (error) {
		console.error("Error fetching workouts:", error);
		return c.json({ error: "Failed to fetch workouts" }, 500);
	}
});

// Create new workout
app.post("/", async (c) => {
	const prisma = getClient(c.env.DB);
	const body = await c.req.json();
	const {
		userProfileId,
		expeditionId,
		exerciseType,
		duration,
		metValue,
		points,
		isSolo,
		isPublic,
		notes,
		workoutDate,
	} = body;

	try {
		// Validate 24-hour window
		const workoutDateTime = new Date(workoutDate);
		const now = new Date();
		const timeDiff = now.getTime() - workoutDateTime.getTime();
		const hoursDiff = timeDiff / (1000 * 60 * 60);

		if (hoursDiff > 24) {
			return c.json(
				{
					error: "Workout must be logged within 24 hours of completion",
				},
				400,
			);
		}

		// Get user profile to check character class
		const userProfile = await prisma.userProfile.findUnique({
			where: { id: userProfileId },
			include: { characterClass: true },
		});

		if (!userProfile) {
			return c.json({ error: "User profile not found" }, 404);
		}

		// Calculate points with character class multipliers
		let calculatedPoints = points;
		if (userProfile.characterClass) {
			const multiplier = isSolo
				? userProfile.characterClass.soloMultiplier
				: userProfile.characterClass.groupMultiplier;
			calculatedPoints = points * multiplier;
		}

		const workout = await prisma.workout.create({
			data: {
				id: crypto.randomUUID(),
				userProfileId,
				expeditionId: expeditionId || null,
				exerciseType,
				duration,
				metValue,
				points: calculatedPoints,
				isSolo,
				isPublic,
				notes,
				workoutDate: workoutDateTime,
			},
			include: {
				photos: true,
				expedition: true,
			},
		});

		// Update user's total points
		await prisma.userProfile.update({
			where: { id: userProfileId },
			data: {
				totalPoints: {
					increment: calculatedPoints,
				},
			},
		});

		// Update expedition participant points if part of an expedition
		if (expeditionId) {
			await prisma.userExpedition.updateMany({
				where: {
					userProfileId,
					expeditionId,
				},
				data: {
					pointsEarned: {
						increment: calculatedPoints,
					},
				},
			});
		}

		return c.json(workout);
	} catch (error) {
		console.error("Error creating workout:", error);
		return c.json({ error: "Failed to create workout" }, 500);
	}
});

// Update workout
app.patch("/:id", async (c) => {
	const prisma = getClient(c.env.DB);
	const id = c.req.param("id");
	const body = await c.req.json();
	const { duration, metValue, points, notes, isPublic } = body;

	try {
		const existingWorkout = await prisma.workout.findUnique({
			where: { id },
		});

		if (!existingWorkout) {
			return c.json({ error: "Workout not found" }, 404);
		}

		// Validate 24-hour window for updates
		const workoutDateTime = new Date(existingWorkout.workoutDate);
		const now = new Date();
		const timeDiff = now.getTime() - workoutDateTime.getTime();
		const hoursDiff = timeDiff / (1000 * 60 * 60);

		if (hoursDiff > 24) {
			return c.json(
				{
					error: "Workout can only be updated within 24 hours of completion",
				},
				400,
			);
		}

		// Get user profile for multiplier calculation
		const userProfile = await prisma.userProfile.findUnique({
			where: { id: existingWorkout.userProfileId },
			include: { characterClass: true },
		});

		let calculatedPoints = points;
		if (userProfile?.characterClass) {
			const multiplier = existingWorkout.isSolo
				? userProfile.characterClass.soloMultiplier
				: userProfile.characterClass.groupMultiplier;
			calculatedPoints = points * multiplier;
		}

		const pointsDifference = calculatedPoints - existingWorkout.points;

		const workout = await prisma.workout.update({
			where: { id },
			data: {
				duration,
				metValue,
				points: calculatedPoints,
				notes,
				isPublic,
			},
			include: {
				photos: true,
				expedition: true,
			},
		});

		// Update user's total points
		if (pointsDifference !== 0) {
			await prisma.userProfile.update({
				where: { id: existingWorkout.userProfileId },
				data: {
					totalPoints: {
						increment: pointsDifference,
					},
				},
			});

			// Update expedition participant points if part of an expedition
			if (existingWorkout.expeditionId) {
				await prisma.userExpedition.updateMany({
					where: {
						userProfileId: existingWorkout.userProfileId,
						expeditionId: existingWorkout.expeditionId,
					},
					data: {
						pointsEarned: {
							increment: pointsDifference,
						},
					},
				});
			}
		}

		return c.json(workout);
	} catch (error) {
		console.error("Error updating workout:", error);
		return c.json({ error: "Failed to update workout" }, 500);
	}
});

// Delete workout
app.delete("/:id", async (c) => {
	const prisma = getClient(c.env.DB);
	const id = c.req.param("id");

	try {
		const existingWorkout = await prisma.workout.findUnique({
			where: { id },
		});

		if (!existingWorkout) {
			return c.json({ error: "Workout not found" }, 404);
		}

		// Validate 24-hour window for deletion
		const workoutDateTime = new Date(existingWorkout.workoutDate);
		const now = new Date();
		const timeDiff = now.getTime() - workoutDateTime.getTime();
		const hoursDiff = timeDiff / (1000 * 60 * 60);

		if (hoursDiff > 24) {
			return c.json(
				{
					error: "Workout can only be deleted within 24 hours of completion",
				},
				400,
			);
		}

		// Remove points from user's total
		await prisma.userProfile.update({
			where: { id: existingWorkout.userProfileId },
			data: {
				totalPoints: {
					decrement: existingWorkout.points,
				},
			},
		});

		// Remove points from expedition participant if part of an expedition
		if (existingWorkout.expeditionId) {
			await prisma.userExpedition.updateMany({
				where: {
					userProfileId: existingWorkout.userProfileId,
					expeditionId: existingWorkout.expeditionId,
				},
				data: {
					pointsEarned: {
						decrement: existingWorkout.points,
					},
				},
			});
		}

		await prisma.workout.delete({
			where: { id },
		});

		return c.json({ message: "Workout deleted successfully" });
	} catch (error) {
		console.error("Error deleting workout:", error);
		return c.json({ error: "Failed to delete workout" }, 500);
	}
});

// Calculate points for a workout
app.post("/calculate-points", async (c) => {
	const body = await c.req.json();
	const { duration, metValue, userProfileId, isSolo } = body;

	try {
		// Get user profile for multiplier calculation
		const prisma = getClient(c.env.DB);
		const userProfile = await prisma.userProfile.findUnique({
			where: { id: userProfileId },
			include: { characterClass: true },
		});

		if (!userProfile) {
			return c.json({ error: "User profile not found" }, 404);
		}

		// Calculate base points using MET formula: Points = minutes × MET × 0.1
		const basePoints = duration * metValue * 0.1;

		// Apply character class multiplier
		let finalPoints = basePoints;
		if (userProfile.characterClass) {
			const multiplier = isSolo
				? userProfile.characterClass.soloMultiplier
				: userProfile.characterClass.groupMultiplier;
			finalPoints = basePoints * multiplier;
		}

		return c.json({
			basePoints: Math.round(basePoints * 100) / 100,
			finalPoints: Math.round(finalPoints * 100) / 100,
			multiplier: userProfile.characterClass
				? isSolo
					? userProfile.characterClass.soloMultiplier
					: userProfile.characterClass.groupMultiplier
				: 1.0,
		});
	} catch (error) {
		console.error("Error calculating points:", error);
		return c.json({ error: "Failed to calculate points" }, 500);
	}
});

export { app as workoutRoutes };
