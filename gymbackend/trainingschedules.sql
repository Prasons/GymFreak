-- Table for training schedules
CREATE TABLE IF NOT EXISTS trainingschedules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    days TEXT[], -- e.g., ['Monday','Wednesday','Friday']
    time VARCHAR(50), -- e.g., '07:00-08:00 AM'
    activities JSONB, -- list of activities or exercises
    trainer VARCHAR(100)
);

-- Table for mapping user to enrolled training schedules
CREATE TABLE IF NOT EXISTS user_trainingschedules (
    user_id INTEGER NOT NULL,
    schedule_id INTEGER NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, schedule_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES trainingschedules(id) ON DELETE CASCADE
);
