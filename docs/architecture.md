# Gara architecture

## Principles

- Solo-first, collaboration-ready, low-friction, privacy-first.
- PostgreSQL is the durable source of truth.
- Authorization is enforced on the server for every private resource.
- Realtime is a delivery mechanism, not the authority for persisted state.
- Timer clients render from timestamps and reconcile after reconnecting.
- Keep the MVP focused on tasks, solo focus, and small private rooms.

## Application layers

- **App Router UI:** responsive pages and accessible interaction states.
- **Authentication:** Better Auth email/password, verified email, database sessions, password reset, and sign-out.
- **Domain layer:** goals, projects, tasks, focus sessions, groups, rooms, invitations, notes, and discussion.
- **Persistence:** PostgreSQL via Supabase, schema and migrations managed by Drizzle.
- **Email:** Resend for verification, reset, and invitations.
- **Realtime:** provider decision remains open until room requirements and hosting constraints are confirmed.

## Current implemented data

- Better Auth user, session, account, and verification tables.
- Personal goals and projects.
- Tasks with status, priority, due date, project/goal references, and completion timestamps.
- Focus-session history records.
- Authenticated task create/toggle server actions; task operations derive the owner from the verified session and validate input with Zod.

The initial PostgreSQL migration is in `drizzle/0000_gara_foundation.sql`. Use `npm run db:migrate` to apply checked-in migrations. `npm run db:push` is for local development only; do not use schema push as the production migration process.

## Timer state (next implementation)

Persist room timer status, start timestamp, duration, and pause information. Clients derive the countdown from timestamps instead of decrementing an authoritative shared counter. Reconcile state after refresh, reconnect, or a host change. Solo focus sessions should be saved on completion and associated with the authenticated user.

## Security baseline

- Verify authentication and resource ownership server-side.
- Do not trust client-supplied user IDs, room membership, or timer permissions.
- Validate external input at boundaries with Zod.
- Keep secrets in environment variables.
- Avoid revealing whether an account exists during password reset.
- Define deletion, export, and retention behavior before launch.

## Current implementation status

The UI foundation and auth routes are present. The workspace route is session-gated, tasks are loaded from PostgreSQL, and task create/toggle operations persist to the database. Goals/projects have database tables but do not yet have UI CRUD flows. Focus timer state remains client-side; groups, invitations, synchronized rooms, presence, shared notes, and discussion are not wired up yet.