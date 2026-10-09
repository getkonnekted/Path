import { neon } from "@neondatabase/serverless";

export function getProgressSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  return neon(connectionString);
}

export const JOURNEY_STEPS: Record<string, readonly string[]> = {
  "life-of-david": ["read", "explore", "remember"]
};

export function isJourneyId(value: string): boolean {
  return Object.prototype.hasOwnProperty.call(JOURNEY_STEPS, value);
}
