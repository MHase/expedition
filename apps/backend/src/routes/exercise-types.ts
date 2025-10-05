import { Hono } from "hono";
import type { HonoEnv } from "..";
import { getClient } from "../lib/prisma";

const app = new Hono<HonoEnv>();

// Get all exercise types
app.get("/", async (c) => {
	const prisma = getClient(c.env.DB);

	try {
		const exerciseTypes = await prisma.exerciseType.findMany({
			orderBy: { name: "asc" },
		});

		return c.json(exerciseTypes);
	} catch (error) {
		console.error("Error fetching exercise types:", error);
		return c.json({ error: "Failed to fetch exercise types" }, 500);
	}
});

// Seed exercise types (for development)
app.post("/seed", async (c) => {
	const prisma = getClient(c.env.DB);

	try {
		// Check if exercise types already exist
		const existingTypes = await prisma.exerciseType.count();
		if (existingTypes > 0) {
			return c.json({ message: "Exercise types already seeded" });
		}

		const exerciseTypes = [
			// Cardio
			{ name: "Running (6 mph)", metValue: 9.8, category: "cardio" },
			{ name: "Running (7 mph)", metValue: 11.0, category: "cardio" },
			{ name: "Running (8 mph)", metValue: 11.8, category: "cardio" },
			{ name: "Cycling (moderate)", metValue: 8.0, category: "cardio" },
			{ name: "Cycling (vigorous)", metValue: 12.0, category: "cardio" },
			{ name: "Swimming (moderate)", metValue: 5.8, category: "cardio" },
			{ name: "Swimming (vigorous)", metValue: 9.8, category: "cardio" },
			{ name: "Rowing (moderate)", metValue: 7.0, category: "cardio" },
			{ name: "Rowing (vigorous)", metValue: 12.0, category: "cardio" },
			{ name: "Elliptical", metValue: 5.0, category: "cardio" },
			{ name: "Stair climbing", metValue: 8.0, category: "cardio" },
			{ name: "Jump rope", metValue: 12.3, category: "cardio" },
			{ name: "Hiking", metValue: 6.0, category: "cardio" },
			{ name: "Walking (3 mph)", metValue: 3.5, category: "cardio" },
			{ name: "Walking (4 mph)", metValue: 5.0, category: "cardio" },

			// Strength Training
			{ name: "Weightlifting (moderate)", metValue: 5.0, category: "strength" },
			{ name: "Weightlifting (vigorous)", metValue: 6.0, category: "strength" },
			{ name: "Bodyweight exercises", metValue: 4.0, category: "strength" },
			{ name: "CrossFit", metValue: 8.0, category: "strength" },
			{ name: "Circuit training", metValue: 8.0, category: "strength" },
			{ name: "Calisthenics", metValue: 4.0, category: "strength" },
			{ name: "Powerlifting", metValue: 6.0, category: "strength" },

			// HIIT & Interval Training
			{ name: "HIIT", metValue: 8.0, category: "hiit" },
			{ name: "Tabata", metValue: 12.0, category: "hiit" },
			{ name: "Interval running", metValue: 10.0, category: "hiit" },
			{ name: "Interval cycling", metValue: 9.0, category: "hiit" },

			// Flexibility & Mind-Body
			{ name: "Yoga (Hatha)", metValue: 2.5, category: "flexibility" },
			{ name: "Yoga (Vinyasa)", metValue: 4.0, category: "flexibility" },
			{ name: "Yoga (Power)", metValue: 4.0, category: "flexibility" },
			{ name: "Pilates", metValue: 3.0, category: "flexibility" },
			{ name: "Stretching", metValue: 2.5, category: "flexibility" },
			{ name: "Meditation", metValue: 1.0, category: "mind-body" },
			{ name: "Tai Chi", metValue: 4.0, category: "mind-body" },

			// Sports
			{ name: "Basketball", metValue: 6.5, category: "sports" },
			{ name: "Soccer", metValue: 7.0, category: "sports" },
			{ name: "Tennis", metValue: 7.3, category: "sports" },
			{ name: "Volleyball", metValue: 3.0, category: "sports" },
			{ name: "Badminton", metValue: 5.5, category: "sports" },
			{ name: "Squash", metValue: 12.0, category: "sports" },
			{ name: "Rock climbing", metValue: 8.0, category: "sports" },

			// Dance
			{ name: "Dancing (moderate)", metValue: 4.8, category: "dance" },
			{ name: "Dancing (vigorous)", metValue: 7.0, category: "dance" },
			{ name: "Zumba", metValue: 5.0, category: "dance" },
			{ name: "Aerobics", metValue: 6.5, category: "dance" },

			// Martial Arts
			{ name: "Karate", metValue: 10.0, category: "martial-arts" },
			{ name: "Judo", metValue: 10.0, category: "martial-arts" },
			{ name: "Boxing", metValue: 12.0, category: "martial-arts" },
			{ name: "Muay Thai", metValue: 12.0, category: "martial-arts" },
		];

		await prisma.exerciseType.createMany({
			data: exerciseTypes.map((type) => ({
				id: crypto.randomUUID(),
				...type,
			})),
		});

		return c.json({
			message: "Exercise types seeded successfully",
			count: exerciseTypes.length,
		});
	} catch (error) {
		console.error("Error seeding exercise types:", error);
		return c.json({ error: "Failed to seed exercise types" }, 500);
	}
});

export { app as exerciseTypeRoutes };
