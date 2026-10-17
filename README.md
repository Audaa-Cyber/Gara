# Gara

A calm, premium productivity workspace for focused work alone and together.

> Focus independently. Make progress together.

## Current foundation

- Next.js App Router, React, and TypeScript
- Better Auth with database-backed sessions, email verification, sign-in, sign-up, and password reset
- Supabase PostgreSQL, Drizzle ORM, and node-postgres
- Resend for verification and password-reset emails
- Initial schemas for users, workspaces, projects, tasks, goals, and focus sessions
- Database health check at /api/health

## Requirements

- Node.js 20.9 or newer; Node.js 22 is recommended
- A Supabase project
- A Resend account and a verified sender domain for production email

## 1. Install

~~~powershell
npm install
Copy-Item .env.example .env
~~~

Use cp .env.example .env on macOS or Linux.

## 2. Configure Supabase PostgreSQL

In your Supabase project, open **Connect** and copy the **Transaction pooler** connection string into DATABASE_URL. Transaction mode uses port 6543. Its shared-pooler username includes the project reference, for example postgres.PROJECT_REF.

~~~dotenv
DATABASE_URL="postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres"
~~~

Use the exact host and username that Supabase provides. If the database password contains URL-reserved characters, URL-encode them in the connection string.

For schema changes and migrations, set DIRECT_URL to the **Session pooler** connection string (port 5432) or a reachable direct connection. The shared session pooler is IPv4 accessible and is often the easiest migration connection on local networks.

~~~dotenv
DIRECT_URL="postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"
DATABASE_SSL=true
~~~

The runtime client uses node-postgres and a small shared connection pool, with TLS on by default. DATABASE_URL is a server-only secret; never put it in a NEXT_PUBLIC_ variable or use it from browser code.

## 3. Configure Better Auth

Generate a unique secret in PowerShell:

~~~powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
~~~

Set the output in .env:

~~~dotenv
BETTER_AUTH_SECRET="paste-the-generated-value-here"
BETTER_AUTH_URL="http://localhost:3000"
~~~

The secret must be at least 32 characters. BETTER_AUTH_URL must match the local origin. After deployment, change it to Gara's canonical HTTPS URL.

## 4. Configure Resend

Create an API key in Resend, verify your sending domain, and set:

~~~dotenv
RESEND_API_KEY="re_your_actual_key"
EMAIL_FROM="Gara <auth@yourdomain.com>"
~~~

Email verification is required before sign-in. Verification and password-reset emails are sent through Resend, so configure both values before testing those flows.

## 5. Create database tables

Run the Drizzle schema push with DIRECT_URL configured when possible:

~~~powershell
npm run db:push
~~~

For production, prefer generating and reviewing SQL migrations, committing them, and applying them with npm run db:migrate. db:push is convenient during early development but should not replace migration review for production changes.

## 6. Run Gara

~~~powershell
npm run dev
~~~

Open http://localhost:3000. The /api/health endpoint checks whether the app can reach PostgreSQL.

## Useful commands

- npm run typecheck — check TypeScript
- npm run build — create a production build
- npm run db:generate — generate migrations from the Drizzle schema
- npm run db:migrate — apply committed migrations
- npm run db:push — sync schema during early development
- npm run db:studio — open Drizzle Studio

## Environment variables

| Variable | Purpose |
| --- | --- |
| DATABASE_URL | Supabase transaction pooler URL for application queries |
| DIRECT_URL | Direct or session-pooler URL for schema changes and migrations |
| DATABASE_SSL | TLS switch; keep true for Supabase |
| BETTER_AUTH_SECRET | Private secret for Better Auth |
| BETTER_AUTH_URL | Canonical base URL used by Better Auth |
| RESEND_API_KEY | Server-side Resend API credential |
| EMAIL_FROM | Verified sender for authentication emails |

Never commit .env, credentials, Supabase service-role keys, or real Resend API keys.

## Product roadmap

1. Foundation and design system
2. Authentication and personal workspace
3. Solo focus timer and themes
4. Groups, invitations, and synchronized focus rooms
5. Shared notes, discussion, and launch readiness
