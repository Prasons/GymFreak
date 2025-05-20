-- Add missing columns to training_schedules table
ALTER TABLE training_schedules
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0;

-- Update existing records to set default values
UPDATE training_schedules 
SET 
  title = name,
  start_time = NOW(),
  end_time = NOW() + INTERVAL '1 hour',
  current_participants = 0;

-- Make the new columns NOT NULL after setting default values
ALTER TABLE training_schedules
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN start_time SET NOT NULL,
ALTER COLUMN end_time SET NOT NULL;

-- Add comments for the new columns
COMMENT ON COLUMN training_schedules.title IS 'Title of the training session';
COMMENT ON COLUMN training_schedules.start_time IS 'Scheduled start time of the session';
COMMENT ON COLUMN training_schedules.end_time IS 'Scheduled end time of the session';
COMMENT ON COLUMN training_schedules.current_participants IS 'Current number of registered participants';

-- Create an index for better performance on date-based queries
CREATE INDEX IF NOT EXISTS idx_training_schedules_dates 
ON training_schedules(start_time, end_time);
