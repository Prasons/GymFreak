-- Create workoutplans table
CREATE TABLE IF NOT EXISTS workoutplans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    exercises JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add some sample data
INSERT INTO workoutplans (name, category, description, exercises) VALUES
('Beginner Full Body Workout', 'Full Body', 'A great full-body workout for beginners', 
  '[
    {"name": "Push-ups", "sets": 3, "reps": "10-12", "rest": "60s"},
    {"name": "Bodyweight Squats", "sets": 3, "reps": "12-15", "rest": "60s"},
    {"name": "Dumbbell Rows", "sets": 3, "reps": "10-12", "rest": "60s"},
    {"name": "Plank", "sets": 3, "duration": "30s", "rest": "45s"}
  ]'
),
('Intermediate Push Day', 'Upper Body', 'Push day workout for intermediate lifters',
  '[
    {"name": "Bench Press", "sets": 4, "reps": "8-10", "rest": "90s"},
    {"name": "Overhead Press", "sets": 3, "reps": "8-10", "rest": "90s"},
    {"name": "Incline Dumbbell Press", "sets": 3, "reps": "10-12", "rest": "75s"},
    {"name": "Tricep Dips", "sets": 3, "reps": "10-12", "rest": "60s"}
  ]'
);

-- Create user_workout_plans table for tracking user's selected workout plans
CREATE TABLE IF NOT EXISTS user_workout_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workoutplan_id INTEGER NOT NULL REFERENCES workoutplans(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, workoutplan_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_workout_plans_user_id ON user_workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_plans_workoutplan_id ON user_workout_plans(workoutplan_id);
