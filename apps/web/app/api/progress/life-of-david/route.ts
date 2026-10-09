import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STEP_IDS = new Set(["read", "explore", "remember"]);
const JOURNEY_ID = "life-of-david";

function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

async function currentUser() {
  const { data, error } = await auth.getSession();
  if (error || !data?.user?.id) return null;
  return data.user;
}

export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in to access account progress." }, { status: 401 });

  try {
    const sql = database();
    const rows = await sql`
      SELECT active_step_id, completed_step_ids, latest_score, quiz_total, quiz_completed_at, updated_at
      FROM path_journey_progress
      WHERE user_id = ${user.id} AND journey_id = ${JOURNEY_ID}
      LIMIT 1
    `;
    return Response.json({ progress: rows[0] ?? null }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Cloud progress is temporarily unavailable. Your device progress remains saved." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in to save account progress." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid progress payload." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const activeStepId = input.activeStepId;
  const completedStepIds = input.completedStepIds;
  const latestScore = input.latestScore;
  const quizTotal = input.quizTotal;

  if (activeStepId !== null && (typeof activeStepId !== "string" || !STEP_IDS.has(activeStepId))) {
    return Response.json({ error: "Unknown active lesson." }, { status: 400 });
  }
  if (!Array.isArray(completedStepIds) ||
      completedStepIds.some((step) => typeof step !== "string" || !STEP_IDS.has(step))) {
    return Response.json({ error: "Completed lessons must contain valid lesson IDs." }, { status: 400 });
  }
  if ((latestScore === null) !== (quizTotal === null) ||
      (latestScore !== null && (!Number.isInteger(latestScore) || !Number.isInteger(quizTotal) ||
        (latestScore as number) < 0 || (latestScore as number) > (quizTotal as number) ||
        (quizTotal as number) !== 3))) {
    return Response.json({ error: "Quiz score must be between 0 and 3, with a total of 3." }, { status: 400 });
  }

  try {
    const sql = database();
    const rows = await sql`
      INSERT INTO path_journey_progress
        (user_id, journey_id, active_step_id, completed_step_ids, latest_score, quiz_total, quiz_completed_at, updated_at)
      VALUES
        (${user.id}, ${JOURNEY_ID}, ${activeStepId}, ${Array.from(new Set(completedStepIds as string[]))},
         ${latestScore}, ${quizTotal}, CASE WHEN ${latestScore}::integer IS NULL THEN NULL ELSE now() END, now())
      ON CONFLICT (user_id, journey_id) DO UPDATE SET
        active_step_id = EXCLUDED.active_step_id,
        completed_step_ids = ARRAY(
          SELECT DISTINCT step_id
          FROM unnest(path_journey_progress.completed_step_ids || EXCLUDED.completed_step_ids) AS step_id
        ),
        latest_score = COALESCE(EXCLUDED.latest_score, path_journey_progress.latest_score),
        quiz_total = COALESCE(EXCLUDED.quiz_total, path_journey_progress.quiz_total),
        quiz_completed_at = CASE
          WHEN EXCLUDED.latest_score IS NOT NULL THEN now()
          ELSE path_journey_progress.quiz_completed_at
        END,
        updated_at = now()
      RETURNING active_step_id, completed_step_ids, latest_score, quiz_total, quiz_completed_at, updated_at
    `;
    return Response.json({ progress: rows[0] ?? null }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Cloud progress is temporarily unavailable. Your device progress remains saved." }, { status: 503 });
  }
}
