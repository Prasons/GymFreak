-- Add referral_code to users table (if not exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(16) UNIQUE;

-- Table to track referrals
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    referred_email VARCHAR(120),
    status VARCHAR(20) DEFAULT 'pending', -- pending, success
    reward_given BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_referral_code ON users(referral_code);
