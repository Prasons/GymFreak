-- Table for workout plans
CREATE TABLE IF NOT EXISTS workoutplans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    exercises JSONB
);

-- Table for mapping user to selected workout plans
CREATE TABLE IF NOT EXISTS user_workoutplans (
    user_id INTEGER NOT NULL,
    workoutplan_id INTEGER NOT NULL,
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, workoutplan_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workoutplan_id) REFERENCES workoutplans(id) ON DELETE CASCADE
);
