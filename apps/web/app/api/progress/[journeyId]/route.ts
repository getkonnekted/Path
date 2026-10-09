import { auth } from "@/lib/auth/server";
import { getProgressSql, isJourneyId, JOURNEY_STEPS } from "@/lib/progress-db";

type RouteContext = { params: Promise<{ journeyId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { data, error } = await auth.getSession();
  if (error || !data?.user) {
    return Response.json({ error: "Sign in to access saved progress." }, { status: 401 });
  }

  const { journeyId } = await context.params;
  if (!isJourneyId(journeyId)) {
    return Response.json({ error: "Unknown learning journey." }, { status: 404 });
  }

  const sql = getProgressSql();
  if (!sql) {
    return Response.json({ error: "Cloud progress is not configured yet." }, { status: 503 });
  }

  try {
    const rows = await sql`
      SELECT journey_id, active_step_id, completed_step_ids, latest_score,
             quiz_total, quiz_completed_at, updated_at
      FROM path_journey_progress
      WHERE user_id = ${data.user.id} AND journey_id = ${journeyId}
      LIMIT 1
    `;
    return Response.json({ progress: rows[0] ?? null });
  } catch {
    return Response.json({ error: "Could not load cloud progress." }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { data, error } = await auth.getSession();
  if (error || !data?.user) {
    return Response.json({ error: "Sign in to save progress." }, { status: 401 });
  }

  const { journeyId } = await context.params;
  if (!isJourneyId(journeyId)) {
    return Response.json({ error: "Unknown learning journey." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Progress payload is required." }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const allowedSteps = JOURNEY_STEPS[journeyId]!;
  const activeStepId = payload.activeStepId;
  const completedStepIds = payload.completedStepIds;
  const latestScore = payload.latestScore;
  const quizTotal = payload.quizTotal;

  if (typeof activeStepId !== "string" || !allowedSteps.includes(activeStepId)) {
    return Response.json({ error: "Invalid active step." }, { status: 400 });
  }
  if (!Array.isArray(completedStepIds) ||
      completedStepIds.length > allowedSteps.length ||
      completedStepIds.some((step) => typeof step !== "string" || !allowedSteps.includes(step))) {
    return Response.json({ error: "Invalid completed steps." }, { status: 400 });
  }

  const hasScore = latestScore !== null && latestScore !== undefined;
  if (hasScore && (!Number.isInteger(latestScore) || !Number.isInteger(quizTotal) ||
      (latestScore as number) < 0 || (quizTotal as number) !== 3 ||
      (latestScore as number) > (quizTotal as number))) {
    return Response.json({ error: "Invalid quiz score." }, { status: 400 });
  }
  if (!hasScore && quizTotal !== null && quizTotal !== undefined) {
    return Response.json({ error: "Quiz total requires a score." }, { status: 400 });
  }

  const sql = getProgressSql();
  if (!sql) {
    return Response.json({ error: "Cloud progress is not configured yet." }, { status: 503 });
  }

  try {
    const rows = await sql`
      INSERT INTO path_journey_progress
        (user_id, journey_id, active_step_id, completed_step_ids, latest_score, quiz_total, quiz_completed_at, updated_at)
      VALUES (
        ${data.user.id},
        ${journeyId},
        ${activeStepId},
        ${completedStepIds as string[]},
        ${hasScore ? latestScore as number : null},
        ${hasScore ? quizTotal as number : null},
        ${hasScore ? new Date().toISOString() : null},
        now()
      )
      ON CONFLICT (user_id, journey_id) DO UPDATE SET
        active_step_id = EXCLUDED.active_step_id,
        completed_step_ids = ARRAY(
          SELECT DISTINCT unnest(path_journey_progress.completed_step_ids || EXCLUDED.completed_step_ids)
        ),
        latest_score = CASE
          WHEN EXCLUDED.quiz_completed_at IS NOT NULL
            AND (path_journey_progress.quiz_completed_at IS NULL OR EXCLUDED.quiz_completed_at >= path_journey_progress.quiz_completed_at)
          THEN EXCLUDED.latest_score ELSE path_journey_progress.latest_score END,
        quiz_total = CASE
          WHEN EXCLUDED.quiz_completed_at IS NOT NULL
            AND (path_journey_progress.quiz_completed_at IS NULL OR EXCLUDED.quiz_completed_at >= path_journey_progress.quiz_completed_at)
          THEN EXCLUDED.quiz_total ELSE path_journey_progress.quiz_total END,
        quiz_completed_at = CASE
          WHEN EXCLUDED.quiz_completed_at IS NOT NULL
            AND (path_journey_progress.quiz_completed_at IS NULL OR EXCLUDED.quiz_completed_at >= path_journey_progress.quiz_completed_at)
          THEN EXCLUDED.quiz_completed_at ELSE path_journey_progress.quiz_completed_at END,
        updated_at = now()
      RETURNING journey_id, active_step_id, completed_step_ids, latest_score, quiz_total, quiz_completed_at, updated_at
    `;
    return Response.json({ progress: rows[0] ?? null });
  } catch {
    return Response.json({ error: "Could not save cloud progress." }, { status: 500 });
  }
}
