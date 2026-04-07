-- Supabase Auth holds credentials; public.User is app profile linked by auth user id.
ALTER TABLE "User" DROP COLUMN IF EXISTS "password";
