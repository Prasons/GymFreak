-- Create diet_plans table
CREATE TABLE IF NOT EXISTS diet_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  calories INTEGER,
  protein INTEGER,
  carbs INTEGER,
  fat INTEGER,
  duration_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add comments
COMMENT ON TABLE diet_plans IS 'Stores diet plans for gym members';
COMMENT ON COLUMN diet_plans.name IS 'Name of the diet plan';
COMMENT ON COLUMN diet_plans.description IS 'Detailed description of the diet plan';
COMMENT ON COLUMN diet_plans.calories IS 'Daily calorie target';
COMMENT ON COLUMN diet_plans.protein IS 'Daily protein target in grams';
COMMENT ON COLUMN diet_plans.carbs IS 'Daily carbs target in grams';
COMMENT ON COLUMN diet_plans.fat IS 'Daily fat target in grams';
COMMENT ON COLUMN diet_plans.duration_days IS 'Duration of the diet plan in days';

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_diet_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_diet_plans_updated_at
BEFORE UPDATE ON diet_plans
FOR EACH ROW
EXECUTE FUNCTION update_diet_plans_updated_at();
