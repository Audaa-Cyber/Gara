# Gara

A calm, premium productivity workspace for focused work alone and together.

> Focus independently. Make progress together.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui conventions
- Better Auth for email/password sessions and verification
- PostgreSQL hosted on Supabase + Drizzle ORM
- Resend for transactional email
- Zod for request validation

## Local setup

1. Install Node.js 20 or newer.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Set `DATABASE_URL` to your Supabase PostgreSQL connection string.
5. Generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32`.
6. Set `BETTER_AUTH_URL=http://localhost:3000`.
7. Configure `RESEND_API_KEY` and `EMAIL_FROM` to deliver verification and password-reset email. In development without Resend, email links are logged to the server console only.
8. Apply the initial database migration with `npm run db:migrate`.
9. Start the app with `npm run dev`.

Open `http://localhost:3000`, create an account, and verify the email before signing in. The workspace route requires an authenticated session.

## Database

The initial schema includes Better Auth tables plus goals, projects, tasks, and focus-session history. PostgreSQL is the durable source of truth; client-side state is only used for transient UI behavior. Server actions validate input and scope task operations to the authenticated user.

## Build sequence

1. Foundation and design system
2. Authentication and personal workspace
3. Solo focus timer and themes
4. Groups, invitations, and synchronized focus rooms
5. Shared notes, discussion, and launch readiness

## Current scope

Authentication pages, email verification, password reset, session-gated workspace access, the initial Drizzle schema, and migration are in place. Focus timer state is still client-side; goals/projects UI and shared rooms are next.