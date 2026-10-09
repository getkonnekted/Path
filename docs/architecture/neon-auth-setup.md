# PATH Managed Better Auth setup

PATH uses Managed Better Auth on the dedicated Neon project `path-learning`, default branch `main`.

## Environment

Set these in `apps/web/.env.local` for local development and in the web deployment's production/preview environment settings:

- `DATABASE_URL`: pooled PostgreSQL connection string for the same `path-learning` branch. Keep it server-only; never expose it with a `NEXT_PUBLIC_` prefix.
- `NEON_AUTH_BASE_URL`: the branch-specific Managed Auth URL shown in the Neon console. For the current PATH main branch it is `https://ep-mute-fire-b2h30n59.neonauth.c-6.eu-central-1.aws.neon.tech/neondb/auth`.
- `NEON_AUTH_COOKIE_SECRET`: generate a unique secret with `openssl rand -base64 32`. Never commit the secret or reuse a CI placeholder in a deployed environment.

The app uses the same-origin `/api/auth/*` proxy provided by `@neondatabase/auth/next`. Keep the server SDK and browser SDK paired; do not point the browser directly at the Neon Auth host.

## Current auth routes

- `/auth/sign-in` — sign in with email/password or configured Google OAuth.
- `/auth/sign-up` — create an account.
- `/api/auth/*` — Managed Auth proxy.
- `/account` — server-session check; unauthenticated requests redirect to sign-in.

## Deployment checklist

1. Set both environment variables for production and preview deployments.
2. Add the exact deployed origin (scheme included, no trailing slash) to the trusted domains for the matching Neon branch.
3. Test account creation, sign-in, sign-out, session restoration after reload, and direct unauthenticated access to `/account`.
4. For production email branding/delivery, configure custom SMTP in Neon.
5. Set `DATABASE_URL` to the pooled connection string for the same PATH Neon branch. The API refuses cloud reads/writes if it is missing.
6. Cloud progress uses an explicit first merge from the journey sidebar, then syncs subsequent progress changes and recall attempts. Browser-local progress remains the fallback when offline or when the API is unavailable.
