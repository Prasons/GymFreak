-- Create user_diet_plans junction table
CREATE TABLE IF NOT EXISTS user_diet_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  diet_plan_id INTEGER NOT NULL REFERENCES diet_plans(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, diet_plan_id) -- Ensure a user can't have the same diet plan multiple times
);

-- Add comments
COMMENT ON TABLE user_diet_plans IS 'Junction table for many-to-many relationship between users and diet plans';
COMMENT ON COLUMN user_diet_plans.user_id IS 'Reference to the user';
COMMENT ON COLUMN user_diet_plans.diet_plan_id IS 'Reference to the diet plan';

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_user_diet_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_diet_plans_updated_at
BEFORE UPDATE ON user_diet_plans
FOR EACH ROW
EXECUTE FUNCTION update_user_diet_plans_updated_at();

-- Create an index for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_user_diet_plans_user_id ON user_diet_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_diet_plans_diet_plan_id ON user_diet_plans(diet_plan_id);
