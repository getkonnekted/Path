import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth/server";

export const runtime = "nodejs";

const JOURNEY_ID = "life-of-david";
const RESPONSE_MODES = new Set(["recognize", "recall", "explain", "connect"]);

export async function POST(request: Request) {
  const { data, error } = await auth.getSession();
  const user = !error ? data?.user : null;
  if (!user?.id) return Response.json({ error: "Sign in to save recall attempts." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid recall attempt." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  if (typeof input.itemId !== "string" || !/^david-quiz-[1-3]$/.test(input.itemId) ||
      typeof input.responseMode !== "string" || !RESPONSE_MODES.has(input.responseMode) ||
      typeof input.wasCorrect !== "boolean") {
    return Response.json({ error: "Recall attempt contains invalid fields." }, { status: 400 });
  }

  const url = process.env.DATABASE_URL;
  if (!url) return Response.json({ error: "Cloud progress is not configured." }, { status: 503 });

  try {
    const sql = neon(url);
    await sql`
      INSERT INTO path_memory_attempts (user_id, journey_id, item_id, response_mode, was_correct)
      VALUES (${user.id}, ${JOURNEY_ID}, ${input.itemId}, ${input.responseMode}, ${input.wasCorrect})
    `;
    return Response.json({ saved: true }, { status: 201 });
  } catch {
    return Response.json({ error: "Could not sync this attempt. Your local quiz still works." }, { status: 503 });
  }
}
