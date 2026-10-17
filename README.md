# Gara

A calm, premium productivity workspace for focused work alone and together.

> Focus independently. Make progress together.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui conventions
- Better Auth for email/password sessions and verification
- PostgreSQL hosted on Supabase + Drizzle ORM
- node-postgres (pg) for runtime queries
- Resend for transactional email
- Zod for request validation

## Local setup

1. Install Node.js 20 or newer, then run npm install.
2. Copy .env.example to .env.local in PowerShell:

   ~~~powershell
   Copy-Item .env.example .env.local
   ~~~

3. Configure DATABASE_URL, DIRECT_URL, and DATABASE_SSL as described below.
4. Generate BETTER_AUTH_SECRET in PowerShell:

   ~~~powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   ~~~

5. Set BETTER_AUTH_URL=http://localhost:3000.
6. Configure RESEND_API_KEY and EMAIL_FROM for email delivery. In development without Resend, verification/reset emails are logged to the server console only.
7. Apply the checked-in PostgreSQL migrations with npm run db:migrate.
8. Start the app with npm run dev.

Open http://localhost:3000, create an account, and verify the email before signing in. The workspace route requires an authenticated session.

## Supabase connection URLs

Copy the connection strings from the Supabase Dashboard's **Connect** dialog. Do not type the pooler hostname or project reference manually.

- **DATABASE_URL — runtime:** use the **Transaction pooler** URI (port 6543) for a serverless deployment. The runtime uses node-postgres rather than Postgres.js because Supabase documents query-pipelining limitations with Postgres.js on the shared transaction pooler. A small pool and TLS are configured by default.
- **DIRECT_URL — schema operations:** use a direct connection (port 5432) where available, or the **Session pooler** URI (port 5432). The direct endpoint may be IPv6-only; the shared Session pooler supports IPv4.
- **DATABASE_SSL:** leave this set to true for Supabase. Set it to false only for a local PostgreSQL instance that does not use TLS.

Example URL formats only; use your own real values:

~~~dotenv
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@POOLER_HOST:6543/postgres"
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@POOLER_HOST:5432/postgres"
DATABASE_SSL=true
~~~

The transaction-pooler username includes the project reference: postgres.PROJECT_REF. A direct connection normally uses postgres. URL-encode reserved characters in your database password, such as #, &, ?, or spaces. Never put these URLs in a NEXT_PUBLIC_* variable, and never commit your real .env.local.

Drizzle Kit loads .env.local or .env for schema operations and prefers DIRECT_URL; app queries use DATABASE_URL.

## Database commands

- npm run db:generate — generate a migration from schema changes
- npm run db:migrate — apply checked-in migrations to the configured migration database
- npm run db:push — convenient for local development only; review and commit migrations for production
- npm run db:studio — open Drizzle Studio
- npm run typecheck — check TypeScript
- npm run lint — run ESLint
- npm run build — create the production build

The public /api/health endpoint performs a minimal database query and returns a connected/unavailable status without exposing credentials.

## Database

The initial schema includes Better Auth tables plus goals, projects, tasks, focus-session history, groups, group memberships, and invitations. PostgreSQL is the durable source of truth; client-side state is only used for transient UI behavior. Server actions validate input and scope task operations to the authenticated user.

The initial migration is drizzle/0000_gara_foundation.sql, followed by focus-timer recovery and groups/invitations migrations. Use npm run db:migrate to apply checked-in migrations. Use db:push only for early local development, not as the production migration process.

## Build sequence

1. Foundation and design system
2. Authentication and personal workspace
3. Solo focus timer and themes
4. Groups, invitations, and synchronized focus rooms
5. Shared notes, discussion, and launch readiness

## Current scope

Authentication pages, email verification, password reset, session-gated workspace access, the initial Drizzle schema and migrations, persisted focus sessions, task actions, goals/projects CRUD, group creation, membership, and email invitations are implemented. Synchronized focus rooms, presence, shared notes, and discussion are not fully wired up yet.
