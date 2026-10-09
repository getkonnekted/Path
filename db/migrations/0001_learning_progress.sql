-- PATH learning progress schema.
-- User identity is owned by Neon Auth; this migration intentionally does not
-- create or duplicate authentication tables.
CREATE TABLE IF NOT EXISTS path_journey_progress (
  user_id text NOT NULL,
  journey_id text NOT NULL,
  active_step_id text,
  completed_step_ids text[] NOT NULL DEFAULT '{}',
  latest_score integer,
  quiz_total integer,
  quiz_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, journey_id),
  CONSTRAINT path_progress_score_nonnegative CHECK (latest_score IS NULL OR latest_score >= 0),
  CONSTRAINT path_progress_quiz_total_positive CHECK (quiz_total IS NULL OR quiz_total > 0),
  CONSTRAINT path_progress_score_within_total CHECK (
    latest_score IS NULL OR quiz_total IS NULL OR latest_score <= quiz_total
  ),
  CONSTRAINT path_progress_score_pair CHECK (
    (latest_score IS NULL AND quiz_total IS NULL) OR
    (latest_score IS NOT NULL AND quiz_total IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS path_journey_progress_updated_at_idx
  ON path_journey_progress (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS path_memory_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  journey_id text NOT NULL,
  item_id text NOT NULL,
  response_mode text NOT NULL CHECK (response_mode IN ('recognize', 'recall', 'explain', 'connect')),
  was_correct boolean NOT NULL,
  answered_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS path_memory_attempts_user_journey_time_idx
  ON path_memory_attempts (user_id, journey_id, answered_at DESC);

-- App code must always derive user_id from the verified server-side auth session,
-- never trust a user_id sent in a request body.
