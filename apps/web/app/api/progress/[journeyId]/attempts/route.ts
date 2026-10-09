import { auth } from "@/lib/auth/server";
import { getProgressSql, isJourneyId } from "@/lib/progress-db";

type RouteContext = { params: Promise<{ journeyId: string }> };
const responseModes = ["recognize", "recall", "explain", "connect"] as const;

export async function POST(request: Request, context: RouteContext) {
  const { data, error } = await auth.getSession();
  if (error || !data?.user) {
    return Response.json({ error: "Sign in to save recall attempts." }, { status: 401 });
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
    return Response.json({ error: "Attempt payload is required." }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  if (typeof payload.itemId !== "string" ||
      !/^david-quiz-[1-3]$/.test(payload.itemId) ||
      !responseModes.includes(payload.responseMode as typeof responseModes[number]) ||
      typeof payload.wasCorrect !== "boolean") {
    return Response.json({ error: "Invalid recall attempt." }, { status: 400 });
  }

  const sql = getProgressSql();
  if (!sql) {
    return Response.json({ error: "Cloud progress is not configured yet." }, { status: 503 });
  }

  try {
    await sql`
      INSERT INTO path_memory_attempts
        (user_id, journey_id, item_id, response_mode, was_correct)
      VALUES (
        ${data.user.id},
        ${journeyId},
        ${payload.itemId},
        ${payload.responseMode},
        ${payload.wasCorrect}
      )
    `;
    return Response.json({ saved: true }, { status: 201 });
  } catch {
    return Response.json({ error: "Could not save recall attempt." }, { status: 500 });
  }
}
