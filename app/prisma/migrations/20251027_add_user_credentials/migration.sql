-- Add username and password fields to User table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password" TEXT;

-- Create unique index on username
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");
