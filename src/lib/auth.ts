import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "@/lib/schema";
import { sendMagicLinkEmail } from "@/lib/email";

// Better Auth needs interactive transactions — the neon-http driver does NOT
// support them. Auth gets its own WebSocket-based pool; the rest of the app
// uses the lighter neon-http driver (src/lib/db.ts).
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const authDb = drizzle(pool, { schema });

export const auth = betterAuth({
  database: drizzleAdapter(authDb, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      rateLimit: schema.rateLimit,
    },
  }),
  rateLimit: {
    enabled: true,
    storage: "database",
    modelName: "rateLimit",
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/magic-link": { window: 300, max: 5 },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: false },
  // Expose the writer's timezone on the session user (we set it ourselves from
  // the browser, so it's not user-settable input).
  user: {
    additionalFields: {
      timezone: {
        type: "string",
        required: false,
        defaultValue: "UTC",
        input: false,
      },
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail(email, url);
      },
    }),
  ],
});
