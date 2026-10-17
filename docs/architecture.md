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
- **Domain layer:** goals, projects, tasks, focus sessions, groups, rooms, invitations, notes, and discussion.
- **Persistence:** PostgreSQL via Supabase, schema and migrations managed by Drizzle.
- **Authentication:** Better Auth with verified email and secure sessions.
- **Email:** Resend for verification, reset, and invitations.
- **Realtime:** provider decision remains open until room requirements and hosting constraints are confirmed.

## Timer state

Persist room timer status, start timestamp, duration, and pause information. Clients derive the countdown from timestamps instead of decrementing an authoritative shared counter. Reconcile state after refresh, reconnect, or a host change.

## Security baseline

- Verify authentication and resource membership server-side.
- Do not trust client-supplied user IDs, room membership, or timer permissions.
- Validate external input at boundaries with Zod.
- Keep secrets in environment variables.
- Define deletion, export, and retention behavior before launch.

## Current implementation status

The first foundation commit establishes the UI shell and interactive local dashboard. The dashboard data is currently local client state only; authentication, database persistence, and shared realtime behavior are not yet wired up.