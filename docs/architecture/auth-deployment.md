# PATH authentication and cloud progress deployment

Managed Better Auth is enabled on the dedicated `path-learning` Neon project. The web app uses
`@neondatabase/auth` with a same-origin Next.js auth route; account progress is written only
through server routes that verify the session.

## Vercel environment variables

Set these for Development, Preview, and Production on the Vercel project that deploys
`apps/web`:

- `NEON_AUTH_BASE_URL`: the Managed Auth base URL for the PATH Neon branch. Use the value
  from the Neon Auth branch configuration; it currently ends in `/neondb/auth`.
- `NEON_AUTH_COOKIE_SECRET`: a unique random secret of at least 32 characters. Generate a
  separate value for each environment; never commit it or reuse the CI placeholder.
- `DATABASE_URL`: the connection string for the same PATH Neon project/branch/database.
  Keep it server-only (no `NEXT_PUBLIC_` prefix). Do not paste it into source code, client
  components, issues, or logs.

After setting variables, trigger a new deployment so the build/runtime receive them.

## Trusted domains

Add the exact deployed web origin to the trusted-domain list for the same Neon Auth branch,
including its scheme and without a trailing slash (for example, `https://your-app.example`).
Register each real preview origin separately if previews should support sign-in. Do not add
a guessed production domain.

## Verification checklist

- [ ] Email sign-up succeeds.
- [ ] Email sign-in succeeds.
- [ ] Session survives page reload.
- [ ] Sign-out clears the browser session.
- [ ] Unauthenticated requests to both progress endpoints return HTTP 401.
- [ ] Authenticated users can read and save only their own progress.
- [ ] A recall attempt is appended to `path_memory_attempts`.
- [ ] Local progress still works when offline or when cloud sync fails.
- [ ] Production email delivery is configured with custom SMTP before public launch.

The Vercel project and its environment variables must be configured before these flows can be
verified against the deployed site. Never use the CI-only cookie-secret placeholder in Vercel.
