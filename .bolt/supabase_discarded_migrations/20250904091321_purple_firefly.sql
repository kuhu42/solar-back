/*
  # Complete GreenSolar Backend Setup

  1. Database Schema
    - User profiles with role-based access
    - Projects with pipeline tracking
    - Tasks with assignment workflow
    - Leads with conversion tracking
    - Complaints with resolution process
    - Attendance with GPS tracking
    - Inventory with serial number management
    - Invoices with automatic numbering
    - Commissions with automatic calculation
    - Notifications with real-time updates
    - Documents with secure file storage
    - Analytics events for tracking

  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Role-based access policies
    - Admin override capabilities
    - Secure file upload policies

  3. Automation
    - Auto-generated reference numbers
    - Commission calculation triggers
    - Notification triggers
    - Updated timestamp triggers

  4. Storage
    - Document storage bucket
    - Photo storage bucket
    - Public avatar storage bucket
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS trigger_set_customer_ref_number ON users;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS set_customer_ref_number();
DROP FUNCTION IF EXISTS generate_customer_ref();
DROP FUNCTION IF EXISTS generate_invoice_number();
DROP FUNCTION IF EXISTS set_invoice_number();
DROP FUNCTION IF EXISTS calculate_commission(uuid, uuid, uuid, text);
DROP FUNCTION IF EXISTS handle_lead_conversion();
DROP FUNCTION IF EXISTS handle_project_completion();
DROP FUNCTION IF EXISTS create_notification(uuid, text, text, text, text);
DROP FUNCTION IF EXISTS notify_task_assignment();
DROP FUNCTION IF EXISTS notify_complaint_assignment();
DROP FUNCTION IF EXISTS get_user_role(uuid);
DROP FUNCTION IF EXISTS is_admin(uuid);

-- Drop existing types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS complaint_status CASCADE;
DROP TYPE IF EXISTS lead_status CASCADE;
DROP TYPE IF EXISTS invoice_status CASCADE;
DROP TYPE IF EXISTS priority_level CASCADE;
DROP TYPE IF EXISTS project_type CASCADE;
DROP TYPE IF EXISTS inventory_type CASCADE;
DROP TYPE IF EXISTS inventory_status CASCADE;
DROP TYPE IF EXISTS pipeline_stage CASCADE;

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'freelancer', 'installer', 'technician', 'customer');
CREATE TYPE user_status AS ENUM ('active', 'pending', 'rejected', 'suspended');
CREATE TYPE project_status AS ENUM ('pending', 'approved', 'in_progress', 'completed', 'cancelled');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE complaint_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'quoted', 'converted', 'lost');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE project_type AS ENUM ('solar', 'wind', 'hybrid');
CREATE TYPE inventory_type AS ENUM ('solar_panel', 'wind_turbine', 'inverter', 'battery', 'mounting', 'cable');
CREATE TYPE inventory_status AS ENUM ('in_stock', 'assigned', 'installed', 'maintenance', 'decommissioned');
CREATE TYPE pipeline_stage AS ENUM ('lead_generated', 'quotation_sent', 'bank_process', 'meter_applied', 'ready_for_installation', 'installation_complete', 'commissioned', 'active');

-- User Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text UNIQUE NOT NULL,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  status user_status NOT NULL DEFAULT 'pending',
  location text,
  avatar_url text,
  customer_ref_number text UNIQUE,
  education text,
  address text,
  bank_details jsonb DEFAULT '{}',
  payment_status text DEFAULT 'pending',
  otp_verified boolean DEFAULT false,
  last_login timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Sessions for OTP tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  phone text NOT NULL,
  otp_code text NOT NULL,
  otp_expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_ref_number text NOT NULL,
  title text NOT NULL,
  customer_id uuid REFERENCES user_profiles(id),
  customer_name text NOT NULL,
  customer_details jsonb DEFAULT '{}',
  status project_status DEFAULT 'pending',
  pipeline_stage pipeline_stage DEFAULT 'lead_generated',
  installation_approved boolean DEFAULT false,
  type project_type NOT NULL,
  location text NOT NULL,
  coordinates jsonb DEFAULT '{}',
  assigned_to uuid REFERENCES user_profiles(id),
  assigned_to_name text,
  serial_numbers text[] DEFAULT '{}',
  start_date date,
  end_date date,
  value numeric DEFAULT 0,
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_ref_number text NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES user_profiles(id),
  assigned_to_name text,
  status task_status DEFAULT 'pending',
  type text NOT NULL,
  priority priority_level DEFAULT 'medium',
  due_date date,
  serial_number text,
  photos text[] DEFAULT '{}',
  notes text,
  completion_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  location text NOT NULL,
  type project_type NOT NULL,
  status lead_status DEFAULT 'new',
  assigned_to uuid REFERENCES user_profiles(id),
  assigned_to_name text,
  estimated_value numeric DEFAULT 0,
  notes text,
  source text DEFAULT 'direct',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_ref_number text NOT NULL,
  customer_id uuid REFERENCES user_profiles(id),
  customer_name text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  status complaint_status DEFAULT 'open',
  priority priority_level DEFAULT 'medium',
  assigned_to uuid REFERENCES user_profiles(id),
  assigned_to_name text,
  serial_number text,
  resolution_notes text,
  photos text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES user_profiles(id) NOT NULL,
  user_name text NOT NULL,
  date date NOT NULL,
  check_in time,
  check_out time,
  location text,
  coordinates jsonb DEFAULT '{}',
  total_hours numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  serial_number text UNIQUE NOT NULL,
  type inventory_type NOT NULL,
  model text NOT NULL,
  status inventory_status DEFAULT 'in_stock',
  location text NOT NULL,
  assigned_to text,
  project_id uuid REFERENCES projects(id),
  install_date date,
  warranty_expiry date NOT NULL,
  purchase_date date,
  cost numeric DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_ref_number text NOT NULL,
  project_id uuid REFERENCES projects(id),
  customer_id uuid REFERENCES user_profiles(id) NOT NULL,
  customer_name text NOT NULL,
  invoice_number text UNIQUE NOT NULL,
  amount numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  status invoice_status DEFAULT 'draft',
  due_date date,
  paid_date date,
  payment_method text,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity integer DEFAULT 1,
  unit_price numeric DEFAULT 0,
  total numeric DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Commissions Table
CREATE TABLE IF NOT EXISTS commissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id uuid REFERENCES user_profiles(id) NOT NULL,
  freelancer_name text NOT NULL,
  lead_id uuid REFERENCES leads(id),
  project_id uuid REFERENCES projects(id),
  commission_type text NOT NULL,
  base_amount numeric NOT NULL,
  commission_rate numeric NOT NULL,
  commission_amount numeric NOT NULL,
  status text DEFAULT 'pending',
  paid_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES user_profiles(id) NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  read boolean DEFAULT false,
  action_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  mime_type text,
  uploaded_by uuid REFERENCES user_profiles(id),
  project_id uuid REFERENCES projects(id),
  customer_id uuid REFERENCES user_profiles(id),
  is_public boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES user_profiles(id),
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  session_id text,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_customer_ref ON user_profiles(customer_ref_number);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_assigned_to ON projects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_pipeline_stage ON projects(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_complaints_customer_id ON complaints(customer_id);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON complaints(assigned_to);
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, date);
CREATE INDEX IF NOT EXISTS idx_inventory_serial ON inventory(serial_number);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid uuid)
RETURNS user_role AS $$
BEGIN
  RETURN (SELECT role FROM user_profiles WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN (SELECT role = 'admin' FROM user_profiles WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
  ON user_profiles FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Public registration"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_sessions
CREATE POLICY "Users can manage own sessions"
  ON user_sessions FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for projects
CREATE POLICY "Users can view related projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid() OR 
    assigned_to = auth.uid() OR 
    is_admin(auth.uid())
  );

CREATE POLICY "Admin and agents can manage projects"
  ON projects FOR ALL
  TO authenticated
  USING (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) = 'agent'
  );

-- RLS Policies for tasks
CREATE POLICY "Users can view assigned tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid() OR 
    is_admin(auth.uid()) OR
    EXISTS (SELECT 1 FROM projects WHERE projects.id = tasks.project_id AND projects.customer_id = auth.uid())
  );

CREATE POLICY "Assigned users can update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid() OR 
    is_admin(auth.uid())
  );

CREATE POLICY "Admin can manage all tasks"
  ON tasks FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for leads
CREATE POLICY "Users can view assigned leads"
  ON leads FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid() OR 
    is_admin(auth.uid()) OR
    get_user_role(auth.uid()) IN ('agent', 'freelancer')
  );

CREATE POLICY "Freelancers and agents can create leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('freelancer', 'agent') OR
    is_admin(auth.uid())
  );

CREATE POLICY "Assigned users can update leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid() OR 
    is_admin(auth.uid())
  );

-- RLS Policies for complaints
CREATE POLICY "Users can view related complaints"
  ON complaints FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid() OR 
    assigned_to = auth.uid() OR 
    is_admin(auth.uid())
  );

CREATE POLICY "Customers can create complaints"
  ON complaints FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Assigned technicians can update complaints"
  ON complaints FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid() OR 
    is_admin(auth.uid())
  );

-- RLS Policies for attendance
CREATE POLICY "Users can manage own attendance"
  ON attendance FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin can view all attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for inventory
CREATE POLICY "All authenticated users can view inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage inventory"
  ON inventory FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for invoices
CREATE POLICY "Users can view related invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid() OR 
    is_admin(auth.uid())
  );

CREATE POLICY "Admin can manage invoices"
  ON invoices FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for invoice_items
CREATE POLICY "Users can view invoice items"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND (invoices.customer_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

-- RLS Policies for commissions
CREATE POLICY "Freelancers can view own commissions"
  ON commissions FOR SELECT
  TO authenticated
  USING (
    freelancer_id = auth.uid() OR 
    is_admin(auth.uid())
  );

CREATE POLICY "Admin can manage commissions"
  ON commissions FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for documents
CREATE POLICY "Users can view related documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    uploaded_by = auth.uid() OR
    customer_id = auth.uid() OR
    is_public = true OR
    is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = documents.project_id 
      AND (projects.customer_id = auth.uid() OR projects.assigned_to = auth.uid())
    )
  );

CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

-- RLS Policies for analytics_events
CREATE POLICY "Users can create own analytics events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can view all analytics"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate customer reference numbers
CREATE OR REPLACE FUNCTION generate_customer_ref()
RETURNS text AS $$
DECLARE
  year_part text := EXTRACT(YEAR FROM now())::text;
  sequence_num integer;
  ref_number text;
BEGIN
  SELECT COALESCE(MAX(
    CASE 
      WHEN customer_ref_number ~ ('^CUST-' || year_part || '-[0-9]+$')
      THEN CAST(SPLIT_PART(customer_ref_number, '-', 3) AS integer)
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM user_profiles
  WHERE customer_ref_number IS NOT NULL;
  
  ref_number := 'CUST-' || year_part || '-' || LPAD(sequence_num::text, 3, '0');
  RETURN ref_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  year_part text := EXTRACT(YEAR FROM now())::text;
  month_part text := LPAD(EXTRACT(MONTH FROM now())::text, 2, '0');
  sequence_num integer;
  invoice_num text;
BEGIN
  SELECT COALESCE(MAX(
    CASE 
      WHEN invoice_number ~ ('^INV-' || year_part || month_part || '-[0-9]+$')
      THEN CAST(SPLIT_PART(invoice_number, '-', 2) AS integer)
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM invoices
  WHERE invoice_number IS NOT NULL;
  
  invoice_num := 'INV-' || year_part || month_part || '-' || LPAD(sequence_num::text, 4, '0');
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate customer reference numbers
CREATE OR REPLACE FUNCTION set_customer_ref_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'customer' AND NEW.customer_ref_number IS NULL THEN
    NEW.customer_ref_number := generate_customer_ref();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_customer_ref_number
  BEFORE INSERT ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION set_customer_ref_number();

-- Trigger to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION set_invoice_number();

-- Function to calculate commission
CREATE OR REPLACE FUNCTION calculate_commission(
  freelancer_uuid uuid,
  lead_uuid uuid DEFAULT NULL,
  project_uuid uuid DEFAULT NULL,
  commission_type_param text DEFAULT 'lead_conversion'
)
RETURNS void AS $$
DECLARE
  base_amount_val numeric := 0;
  commission_rate_val numeric := 0.10;
  commission_amount_val numeric;
  freelancer_name_val text;
BEGIN
  SELECT name INTO freelancer_name_val 
  FROM user_profiles 
  WHERE id = freelancer_uuid;
  
  IF commission_type_param = 'lead_conversion' AND lead_uuid IS NOT NULL THEN
    SELECT estimated_value INTO base_amount_val 
    FROM leads 
    WHERE id = lead_uuid;
  ELSIF commission_type_param = 'project_completion' AND project_uuid IS NOT NULL THEN
    SELECT value INTO base_amount_val 
    FROM projects 
    WHERE id = project_uuid;
    commission_rate_val := 0.05;
  END IF;
  
  commission_amount_val := base_amount_val * commission_rate_val;
  
  INSERT INTO commissions (
    freelancer_id,
    freelancer_name,
    lead_id,
    project_id,
    commission_type,
    base_amount,
    commission_rate,
    commission_amount
  ) VALUES (
    freelancer_uuid,
    freelancer_name_val,
    lead_uuid,
    project_uuid,
    commission_type_param,
    base_amount_val,
    commission_rate_val,
    commission_amount_val
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create commission when lead is converted
CREATE OR REPLACE FUNCTION handle_lead_conversion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'converted' AND OLD.status != 'converted' AND NEW.assigned_to IS NOT NULL THEN
    PERFORM calculate_commission(NEW.assigned_to, NEW.id, NULL, 'lead_conversion');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_lead_conversion
  AFTER UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION handle_lead_conversion();

-- Trigger to create commission when project is completed
CREATE OR REPLACE FUNCTION handle_project_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.assigned_to IS NOT NULL THEN
    IF (SELECT role FROM user_profiles WHERE id = NEW.assigned_to) = 'freelancer' THEN
      PERFORM calculate_commission(NEW.assigned_to, NULL, NEW.id, 'project_completion');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_project_completion
  AFTER UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION handle_project_completion();

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  user_uuid uuid,
  title_param text,
  message_param text,
  type_param text DEFAULT 'info',
  action_url_param text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, action_url)
  VALUES (user_uuid, title_param, message_param, type_param, action_url_param)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to notify on task assignment
CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
    PERFORM create_notification(
      NEW.assigned_to,
      'New Task Assigned',
      'You have been assigned a new task: ' || NEW.title,
      'info'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_task_assignment
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION notify_task_assignment();

-- Trigger to notify on complaint assignment
CREATE OR REPLACE FUNCTION notify_complaint_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
    PERFORM create_notification(
      NEW.assigned_to,
      'New Complaint Assigned',
      'You have been assigned a complaint: ' || NEW.title,
      'warning'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_complaint_assignment
  AFTER INSERT OR UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION notify_complaint_assignment();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('documents', 'documents', false),
  ('photos', 'photos', false),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('documents', 'photos', 'avatars') AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id IN ('documents', 'photos', 'avatars') AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public avatars"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');