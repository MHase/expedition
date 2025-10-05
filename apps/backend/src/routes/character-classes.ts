import { Hono } from "hono";
import type { HonoEnv } from "..";
import { getClient } from "../lib/prisma";

const app = new Hono<HonoEnv>();

// Get all character classes
app.get("/", async (c) => {
	const prisma = getClient(c.env.DB);

	try {
		const characterClasses = await prisma.characterClass.findMany({
			orderBy: { name: "asc" },
		});

		return c.json(characterClasses);
	} catch (error) {
		console.error("Error fetching character classes:", error);
		return c.json({ error: "Failed to fetch character classes" }, 500);
	}
});

// Get character class by ID
app.get("/:id", async (c) => {
	const prisma = getClient(c.env.DB);
	const id = c.req.param("id");

	try {
		const characterClass = await prisma.characterClass.findUnique({
			where: { id },
		});

		if (!characterClass) {
			return c.json({ error: "Character class not found" }, 404);
		}

		return c.json(characterClass);
	} catch (error) {
		console.error("Error fetching character class:", error);
		return c.json({ error: "Failed to fetch character class" }, 500);
	}
});

// Seed character classes (for development)
app.post("/seed", async (c) => {
	const prisma = getClient(c.env.DB);

	try {
		// Check if character classes already exist
		const existingClasses = await prisma.characterClass.count();
		if (existingClasses > 0) {
			return c.json({ message: "Character classes already seeded" });
		}

		const characterClasses = [
			{
				id: "warrior",
				name: "Warrior",
				description:
					"A fierce fighter who excels in strength training and endurance challenges. Warriors gain bonus points for weightlifting and high-intensity workouts.",
				perks: JSON.stringify([
					"Strength training bonus: +20% points for weightlifting",
					"Endurance boost: +15% points for cardio over 30 minutes",
					"Battle cry: +10% points for group workouts",
				]),
				soloMultiplier: 0.6, // Higher penalty for solo
				groupMultiplier: 1.2, // Higher bonus for group
			},
			{
				id: "mage",
				name: "Mage",
				description:
					"A wise scholar who focuses on flexibility and mind-body connection. Mages excel at yoga, pilates, and meditation-based exercises.",
				perks: JSON.stringify([
					"Flexibility mastery: +25% points for yoga and pilates",
					"Mind-body connection: +15% points for meditation and breathing exercises",
					"Arcane focus: +10% points for solo workouts",
				]),
				soloMultiplier: 0.9, // Lower penalty for solo
				groupMultiplier: 1.1, // Lower bonus for group
			},
			{
				id: "rogue",
				name: "Rogue",
				description:
					"A nimble adventurer who thrives on agility and speed. Rogues are masters of quick, intense workouts and outdoor activities.",
				perks: JSON.stringify([
					"Agility training: +20% points for HIIT and interval training",
					"Outdoor mastery: +25% points for running and cycling",
					"Stealth mode: +15% points for early morning workouts",
				]),
				soloMultiplier: 0.8, // Medium penalty for solo
				groupMultiplier: 1.15, // Medium bonus for group
			},
			{
				id: "paladin",
				name: "Paladin",
				description:
					"A noble protector who balances strength and endurance. Paladins excel at functional fitness and team-based activities.",
				perks: JSON.stringify([
					"Functional fitness: +20% points for crossfit and functional training",
					"Team leadership: +25% points for group workouts",
					"Divine endurance: +15% points for long-duration activities",
				]),
				soloMultiplier: 0.7, // Medium penalty for solo
				groupMultiplier: 1.25, // Highest bonus for group
			},
			{
				id: "ranger",
				name: "Ranger",
				description:
					"A nature-loving explorer who excels at outdoor activities and endurance challenges. Rangers are masters of hiking, swimming, and outdoor sports.",
				perks: JSON.stringify([
					"Nature's blessing: +30% points for outdoor activities",
					"Endurance mastery: +20% points for activities over 45 minutes",
					"Wilderness survival: +15% points for early morning workouts",
				]),
				soloMultiplier: 0.75, // Medium penalty for solo
				groupMultiplier: 1.1, // Lower bonus for group
			},
		];

		await prisma.characterClass.createMany({
			data: characterClasses,
		});

		return c.json({
			message: "Character classes seeded successfully",
			count: characterClasses.length,
		});
	} catch (error) {
		console.error("Error seeding character classes:", error);
		return c.json({ error: "Failed to seed character classes" }, 500);
	}
});

export { app as characterClassRoutes };
