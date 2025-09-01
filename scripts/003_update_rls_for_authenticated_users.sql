-- Update RLS policies to work with authenticated users
-- This replaces the anonymous access policies with proper user-based policies

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous read access" ON asset_categories;
DROP POLICY IF EXISTS "Allow anonymous write access" ON asset_categories;
DROP POLICY IF EXISTS "Allow anonymous read access" ON assets;
DROP POLICY IF EXISTS "Allow anonymous write access" ON assets;
DROP POLICY IF EXISTS "Allow anonymous read access" ON profiles;
DROP POLICY IF EXISTS "Allow anonymous write access" ON profiles;

-- Asset Categories policies
CREATE POLICY "Users can view their own categories" ON asset_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON asset_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON asset_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON asset_categories
  FOR DELETE USING (auth.uid() = user_id);

-- Assets policies
CREATE POLICY "Users can view their own assets" ON assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assets" ON assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets" ON assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets" ON assets
  FOR DELETE USING (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile (for new user registration)
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
