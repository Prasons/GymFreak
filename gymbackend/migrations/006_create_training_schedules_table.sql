-- Create training_schedules table
CREATE TABLE IF NOT EXISTS training_schedules (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  trainer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_status CHECK (status IN ('scheduled', 'completed', 'cancelled'))
);

-- Create a junction table for users and training_schedules many-to-many relationship
CREATE TABLE IF NOT EXISTS user_training_schedules (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  training_schedule_id INTEGER REFERENCES training_schedules(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'registered',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, training_schedule_id),
  CONSTRAINT chk_attendance_status CHECK (status IN ('registered', 'attended', 'absent'))
);

-- Add comments
COMMENT ON TABLE training_schedules IS 'Stores training schedules and sessions';
COMMENT ON COLUMN training_schedules.title IS 'Title of the training session';
COMMENT ON COLUMN training_schedules.description IS 'Detailed description of the training session';
COMMENT ON COLUMN training_schedules.trainer_id IS 'ID of the trainer conducting the session';
COMMENT ON COLUMN training_schedules.start_time IS 'Scheduled start time of the session';
COMMENT ON COLUMN training_schedules.end_time IS 'Scheduled end time of the session';
COMMENT ON COLUMN training_schedules.max_participants IS 'Maximum number of participants allowed';
COMMENT ON COLUMN training_schedules.current_participants IS 'Current number of registered participants';
COMMENT ON COLUMN training_schedules.status IS 'Current status of the session';

-- Create a trigger to update the updated_at column for training_schedules
CREATE OR REPLACE FUNCTION update_training_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_training_schedules_updated_at
BEFORE UPDATE ON training_schedules
FOR EACH ROW
EXECUTE FUNCTION update_training_schedules_updated_at();

-- Create a trigger to update the updated_at column for user_training_schedules
CREATE OR REPLACE FUNCTION update_user_training_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_training_schedules_updated_at
BEFORE UPDATE ON user_training_schedules
FOR EACH ROW
EXECUTE FUNCTION update_user_training_schedules_updated_at();

-- Create an index for better performance on date-based queries
CREATE INDEX idx_training_schedules_dates ON training_schedules(start_time, end_time);
