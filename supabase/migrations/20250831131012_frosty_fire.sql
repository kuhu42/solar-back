/*
  # Update Authentication Schema

  1. New Tables
    - `user_profiles` - Extended user information linked to auth.users
    - Updated existing tables to work with Supabase Auth

  2. Security
    - Enable RLS on all tables
    - Update policies to work with auth.uid()
    - Add proper user profile management

  3. Functions
    - Auto-create user profile on signup
    - Generate customer reference numbers
*/

-- Create user_profiles table to extend auth.users
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['company'::text, 'agent'::text, 'freelancer'::text, 'installer'::text, 'technician'::text, 'customer'::text])),
  status text NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY['active'::text, 'pending'::text, 'rejected'::text])),
  phone text,
  location text,
  avatar text,
  customer_ref_number text UNIQUE,
  education text,
  address text,
  bank_details text,
  payment_status text DEFAULT 'pending' CHECK (payment_status = ANY (ARRAY['pending'::text, 'processing'::text, 'paid'::text])),
  profile_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Company can manage all profiles"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'company'
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'customer') = 'customer' THEN 'active'
      ELSE 'pending'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to generate customer reference numbers
CREATE OR REPLACE FUNCTION generate_customer_ref_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'customer' AND NEW.customer_ref_number IS NULL THEN
    NEW.customer_ref_number := 'CUST-' || EXTRACT(YEAR FROM NOW()) || '-' || 
      LPAD((
        SELECT COALESCE(MAX(CAST(SPLIT_PART(customer_ref_number, '-', 3) AS INTEGER)), 0) + 1
        FROM user_profiles 
        WHERE customer_ref_number LIKE 'CUST-' || EXTRACT(YEAR FROM NOW()) || '-%'
      )::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for customer reference number generation
DROP TRIGGER IF EXISTS generate_customer_ref ON user_profiles;
CREATE TRIGGER generate_customer_ref
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION generate_customer_ref_number();

-- Update existing tables to reference user_profiles instead of users
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_customer_id_fkey;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_assigned_to_fkey;
ALTER TABLE projects ADD CONSTRAINT projects_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES user_profiles(id);
ALTER TABLE projects ADD CONSTRAINT projects_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES user_profiles(id);

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES user_profiles(id);

ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_customer_id_fkey;
ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_assigned_to_fkey;
ALTER TABLE complaints ADD CONSTRAINT complaints_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES user_profiles(id);
ALTER TABLE complaints ADD CONSTRAINT complaints_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES user_profiles(id);

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_customer_id_fkey;
ALTER TABLE invoices ADD CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES user_profiles(id);

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_assigned_to_fkey;
ALTER TABLE leads ADD CONSTRAINT leads_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES user_profiles(id);

ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_user_id_fkey;
ALTER TABLE attendance ADD CONSTRAINT attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id);

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id);

-- Update RLS policies for other tables to work with user_profiles
DROP POLICY IF EXISTS "Company can manage all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Update projects policies
DROP POLICY IF EXISTS "Company and agents can manage projects" ON projects;
DROP POLICY IF EXISTS "Users can read relevant projects" ON projects;

CREATE POLICY "Company and agents can manage projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = ANY (ARRAY['company', 'agent'])
    )
  );

CREATE POLICY "Users can read relevant projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid() OR 
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = ANY (ARRAY['company', 'agent'])
    )
  );

-- Update other table policies similarly
DROP POLICY IF EXISTS "Assigned users can update tasks" ON tasks;
DROP POLICY IF EXISTS "Users can read relevant tasks" ON tasks;

CREATE POLICY "Assigned users can update tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = ANY (ARRAY['company', 'agent'])
    )
  );

CREATE POLICY "Users can read relevant tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = ANY (ARRAY['company', 'agent'])
    ) OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id AND projects.customer_id = auth.uid()
    )
  );