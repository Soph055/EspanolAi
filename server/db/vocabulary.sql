CREATE TABLE IF NOT EXISTS vocabulary (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word VARCHAR(100) NOT NULL,
    translation VARCHAR(100) NOT NULL,
    times_correct INT NOT NULL DEFAULT 0,
    times_incorrect INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vocabulary_user_id ON vocabulary(user_id);