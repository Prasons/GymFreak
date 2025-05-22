-- Add is_popular column to membership_plans table
ALTER TABLE membership_plans 
ADD COLUMN is_popular BOOLEAN DEFAULT FALSE;

-- Add comment for the new column
COMMENT ON COLUMN membership_plans.is_popular IS 'Indicates if this plan should be highlighted as a popular choice';

-- Create an index for better query performance
CREATE INDEX idx_membership_plans_popular ON membership_plans(is_popular);

-- Update the trigger to include the new column in updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
