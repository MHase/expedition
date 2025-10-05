import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import type { HonoEnv } from "..";
import { getClient } from "./prisma";

const config = (env: HonoEnv["Bindings"]) => ({
	telemetry: {
		enabled: false,
	},
	baseURL: env.BETTER_AUTH_URL,
	trustedOrigins: ["http://localhost:5173"],
	/**
	 * Base path for the better auth. This is typically
	 * the path where the
	 * better auth routes are mounted.
	 *
	 * @default "/api/auth"
	 */
	// basePath?: string;
	account: {
		accountLinking: {
			enabled: true,
		},
	},
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
	user: {
		deleteUser: {
			enabled: true,
		},
	},
};

// ? uncomment only when generating better-auth schema via `bunx @better-auth/cli generate`

// import { PrismaClient } from "../generated/prisma";

// const prisma = new PrismaClient();
// export const auth = betterAuth({
// 	database: prismaAdapter(prisma, {
// 		provider: "sqlite",
// 	}),
// 	...config,
// });

export const getAuth = (db: D1Database, env: HonoEnv["Bindings"]) => {
	const prisma = getClient(db);

	return betterAuth({
		database: prismaAdapter(prisma, {
			provider: "sqlite",
		}),
		...config(env),
	});
};
