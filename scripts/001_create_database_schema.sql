-- Create asset categories table
CREATE TABLE IF NOT EXISTS public.asset_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assets table with all digital signage fields
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.asset_categories(id) ON DELETE SET NULL,
  asset_location TEXT,
  google_location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  manufacturer TEXT,
  model_number TEXT,
  screen_size TEXT,
  custom_screen_size TEXT,
  resolution TEXT,
  custom_resolution TEXT,
  power_consumption TEXT,
  operating_system TEXT,
  description TEXT,
  purchase_date DATE,
  installation_date DATE,
  warranty_start_date DATE,
  warranty_period_months INTEGER,
  mac_address TEXT,
  content_management_system TEXT,
  display_orientation TEXT,
  operating_hours TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance schedules table
CREATE TABLE IF NOT EXISTS public.maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL,
  next_due_date DATE,
  last_completed_date DATE,
  estimated_duration INTEGER,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance SOPs table
CREATE TABLE IF NOT EXISTS public.maintenance_sops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.asset_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL DEFAULT '[]',
  frequency TEXT NOT NULL,
  estimated_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for asset_categories (public read, authenticated write)
CREATE POLICY "asset_categories_select_all" ON public.asset_categories FOR SELECT USING (true);
CREATE POLICY "asset_categories_insert_authenticated" ON public.asset_categories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "asset_categories_update_authenticated" ON public.asset_categories FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "asset_categories_delete_authenticated" ON public.asset_categories FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for assets (public read, authenticated write)
CREATE POLICY "assets_select_all" ON public.assets FOR SELECT USING (true);
CREATE POLICY "assets_insert_authenticated" ON public.assets FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "assets_update_authenticated" ON public.assets FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "assets_delete_authenticated" ON public.assets FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for maintenance_schedules (public read, authenticated write)
CREATE POLICY "maintenance_schedules_select_all" ON public.maintenance_schedules FOR SELECT USING (true);
CREATE POLICY "maintenance_schedules_insert_authenticated" ON public.maintenance_schedules FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "maintenance_schedules_update_authenticated" ON public.maintenance_schedules FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "maintenance_schedules_delete_authenticated" ON public.maintenance_schedules FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for maintenance_sops (public read, authenticated write)
CREATE POLICY "maintenance_sops_select_all" ON public.maintenance_sops FOR SELECT USING (true);
CREATE POLICY "maintenance_sops_insert_authenticated" ON public.maintenance_sops FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "maintenance_sops_update_authenticated" ON public.maintenance_sops FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "maintenance_sops_delete_authenticated" ON public.maintenance_sops FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for profiles (users can only access their own profile)
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers to all tables
CREATE TRIGGER asset_categories_updated_at BEFORE UPDATE ON public.asset_categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER maintenance_schedules_updated_at BEFORE UPDATE ON public.maintenance_schedules FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER maintenance_sops_updated_at BEFORE UPDATE ON public.maintenance_sops FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
