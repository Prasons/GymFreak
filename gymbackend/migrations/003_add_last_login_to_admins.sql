-- Add lastLogin column to admins table
ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "lastLoginIp" VARCHAR(45);

-- Update existing rows to have a default value
UPDATE admins SET "lastLogin" = CURRENT_TIMESTAMP WHERE "lastLogin" IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN admins."lastLogin" IS 'Timestamp of the last successful login';
COMMENT ON COLUMN admins."lastLoginIp" IS 'IP address from the last login';

-- Create index for faster lookups on lastLogin
CREATE INDEX IF NOT EXISTS idx_admins_last_login ON admins ("lastLogin");
