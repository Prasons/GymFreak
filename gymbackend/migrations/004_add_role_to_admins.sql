-- Add role column to admins table
ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'admin';

-- Add comment for the role column
COMMENT ON COLUMN admins.role IS 'Role of the admin (e.g., super_admin, admin, manager)';

-- Update existing records to have a role if they don't have one
UPDATE admins SET role = 'admin' WHERE role IS NULL;
