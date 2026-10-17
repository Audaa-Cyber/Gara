import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { accounts, sessions, users, verifications } from "@/db/schema";
import { db } from "@/db";
import { sendTransactionalEmail } from "@/lib/email";
import { env } from "@/lib/env";

export const auth = betterAuth({
  appName: "Gara",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.BETTER_AUTH_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user: users, session: sessions, account: accounts, verification: verifications },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendTransactionalEmail({
        to: user.email,
        subject: "Reset your Gara password",
        text: "Use this link to reset your Gara password: " + url + "\n\nIf you did not request this, ignore this email.",
        html: '<p>Use the link below to reset your Gara password.</p><p><a href="' + url + '">Reset password</a></p><p>If you did not request this, ignore this email.</p>',
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendTransactionalEmail({
        to: user.email,
        subject: "Verify your Gara email",
        text: "Welcome to Gara. Verify your email address: " + url,
        html: '<p>Welcome to Gara.</p><p><a href="' + url + '">Verify your email address</a></p>',
      });
    },
  },
  plugins: [nextCookies()],
});
