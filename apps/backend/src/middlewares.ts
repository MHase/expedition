import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import type { HonoEnv } from ".";
import { getAuth } from "./lib/auth";

export const authMiddleware = async (c: Context<HonoEnv>, next: Next) => {
	// Get session from Better Auth
	const session = await getAuth(c.env.DB, c.env).api.getSession({
		headers: c.req.raw.headers,
	});

	// If no session exists, return unauthorized response
	if (!session) {
		throw new HTTPException(401);
	}

	// Set user and session in context for use in routes
	c.set("user", session.user);
	// c.set("session", session.session);

	// Continue to the next middleware/route handler
	await next();
};
