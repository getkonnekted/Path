# PATH progress persistence

## Identity and ownership

Neon Auth is the intended identity provider. PATH does not create a second users table.
All progress writes must derive `user_id` from the verified server-side session. Never accept
the owner ID from client input, and never expose a database credential to the browser.

## Data model

- `path_journey_progress`: one current summary per user and journey, including visited steps,
  current step, and the latest quiz result.
- `path_memory_attempts`: append-only recall attempts for later mastery and spaced-review logic.
- `journey_id` and step/item IDs are application-owned identifiers, not user-controlled SQL.

## Migration

The initial schema is in `db/migrations/0001_learning_progress.sql`. Review and apply it to a
dedicated PATH Neon project/branch after confirming the target project. Do not run this migration
against unrelated projects.

## Migration from browser storage

The web prototype currently stores anonymous progress in localStorage. When account support is
introduced, offer an explicit one-time import after sign-in. Merge visited step IDs, preserve the
most recent quiz result by timestamp, and do not silently overwrite server progress. Local storage
must remain a fallback when offline or when the server is unavailable.

## Required API behavior

- Read/write progress only after session verification.
- Validate journey IDs, step IDs, score bounds, and attempt response modes server-side.
- Use parameterized SQL.
- Return a useful offline/unauthenticated response without losing local progress.
- Never treat opening a lesson as proof of mastery; mastery should be derived from recall history.
