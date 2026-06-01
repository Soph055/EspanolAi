-- Stores every sentence correction made by users
CREATE TABLE IF NOT EXISTS corrections (
    -- unique id for this correction
    id SERIAL PRIMARY KEY,

    -- which user owns this correction; if user is deleted, their corrections go too
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_sentence TEXT NOT NULL,
    corrected_sentence TEXT NOT NULL,
    explanation TEXT,
    was_correct BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Speeds up queries that fetch all corrections for a given user
CREATE INDEX IF NOT EXISTS idx_corrections_user_id ON corrections(user_id);