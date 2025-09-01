-- Update RLS policies for asset_categories to allow authenticated users to perform CRUD operations
-- Since categories don't have user_id, we'll allow all authenticated users to manage categories

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "asset_categories_select_policy" ON asset_categories;
DROP POLICY IF EXISTS "asset_categories_insert_policy" ON asset_categories;
DROP POLICY IF EXISTS "asset_categories_update_policy" ON asset_categories;
DROP POLICY IF EXISTS "asset_categories_delete_policy" ON asset_categories;

-- Create new policies that allow all authenticated users to manage categories
CREATE POLICY "asset_categories_select_policy" ON asset_categories
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "asset_categories_insert_policy" ON asset_categories
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "asset_categories_update_policy" ON asset_categories
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "asset_categories_delete_policy" ON asset_categories
  FOR DELETE USING (auth.uid() IS NOT NULL);
