-- Create membership_plans table
CREATE TABLE IF NOT EXISTS membership_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_days INTEGER NOT NULL,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for better query performance
CREATE INDEX idx_membership_plans_active ON membership_plans(is_active);

-- Add comment for the table
COMMENT ON TABLE membership_plans IS 'Stores information about different membership plans offered by the gym';

-- Add comments for columns
COMMENT ON COLUMN membership_plans.name IS 'Name of the membership plan (e.g., Basic, Premium)';
COMMENT ON COLUMN membership_plans.description IS 'Detailed description of the membership plan';
COMMENT ON COLUMN membership_plans.price IS 'Price of the membership plan';
COMMENT ON COLUMN membership_plans.duration_days IS 'Duration of the membership in days';
COMMENT ON COLUMN membership_plans.features IS 'JSON array of features included in this plan';
COMMENT ON COLUMN membership_plans.is_active IS 'Whether the membership plan is currently active';

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_membership_plans_updated_at
BEFORE UPDATE ON membership_plans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
