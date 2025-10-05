import { Hono } from "hono";
import type { HonoEnv } from "..";
import { getAuth } from "../lib/auth";

const app = new Hono<HonoEnv>();

app.on(["POST", "GET"], "/*", (c) => {
	return getAuth(c.env.DB, c.env).handler(c.req.raw);
});

export { app as authRoutes };
