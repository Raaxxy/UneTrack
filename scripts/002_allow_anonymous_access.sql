-- Temporarily allow anonymous access for testing by updating RLS policies

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own categories" ON asset_categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON asset_categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON asset_categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON asset_categories;

DROP POLICY IF EXISTS "Users can view their own assets" ON assets;
DROP POLICY IF EXISTS "Users can insert their own assets" ON assets;
DROP POLICY IF EXISTS "Users can update their own assets" ON assets;
DROP POLICY IF EXISTS "Users can delete their own assets" ON assets;

DROP POLICY IF EXISTS "Users can view their own maintenance schedules" ON maintenance_schedules;
DROP POLICY IF EXISTS "Users can insert their own maintenance schedules" ON maintenance_schedules;
DROP POLICY IF EXISTS "Users can update their own maintenance schedules" ON maintenance_schedules;
DROP POLICY IF EXISTS "Users can delete their own maintenance schedules" ON maintenance_schedules;

DROP POLICY IF EXISTS "Users can view their own SOPs" ON maintenance_sops;
DROP POLICY IF EXISTS "Users can insert their own SOPs" ON maintenance_sops;
DROP POLICY IF EXISTS "Users can update their own SOPs" ON maintenance_sops;
DROP POLICY IF EXISTS "Users can delete their own SOPs" ON maintenance_sops;

-- Create new policies that allow anonymous access for testing
CREATE POLICY "Allow anonymous access to categories" ON asset_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous access to assets" ON assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous access to maintenance schedules" ON maintenance_schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous access to SOPs" ON maintenance_sops FOR ALL USING (true) WITH CHECK (true);

-- Also allow anonymous access to profiles for consistency
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Allow anonymous access to profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
