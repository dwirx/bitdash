-- Migration: Add role column to users table and set superadmin
-- Run this SQL in your Neon DB console

-- Add role column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Set your desired user as superadmin (replace the email below)
UPDATE users SET role = 'superadmin' WHERE email = 'your-email@example.com';

-- Verify the changes
SELECT id, email, role, created_at FROM users;
