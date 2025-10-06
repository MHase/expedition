import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { getClient } from "./lib/prisma";
import { authRoutes } from "./routes/auth";
import { characterClassRoutes } from "./routes/character-classes";
import { exerciseTypeRoutes } from "./routes/exercise-types";
import { expeditionRoutes } from "./routes/expeditions";
import { userDeletionRoutes } from "./routes/user-deletion";
import { userProfileRoutes } from "./routes/user-profiles";
import { workoutRoutes } from "./routes/workouts";

export type HonoEnv = {
	Bindings: {
		DB: D1Database;
		BETTER_AUTH_URL: string;
		BETTER_AUTH_SECRET: string;
		GOOGLE_CLIENT_ID: string;
		GOOGLE_CLIENT_SECRET: string;
	};
	Variables: {
		// --- auth variables
		// user: typeof auth.$Infer.Session.user | null;
		// session: typeof auth.$Infer.Session.session | null;
		user: { id: string; email: string } | null;
	};
};

const app = new Hono<HonoEnv>().basePath("/api");

app.use(secureHeaders());

// https://www.better-auth.com/docs/integrations/hono#cors
app.use(
	cors({
		origin: [
			"http://localhost:5173",
			"https://expedition-frontend.sykula.workers.dev",
		], // replace with your origin
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

app.get("/all", async (c) => {
	const prisma = getClient(c.env.DB);
	const users = await prisma.user.findMany();

	return c.json(users);
});

app.route("/auth", authRoutes);
app.route("/character-classes", characterClassRoutes);
app.route("/user-profiles", userProfileRoutes);
app.route("/expeditions", expeditionRoutes);
app.route("/exercise-types", exerciseTypeRoutes);
app.route("/workouts", workoutRoutes);
app.route("/user-deletion", userDeletionRoutes);

export default app;
