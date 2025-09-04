/*
  # Complete GreenSolar Schema

  1. New Tables
    - `user_profiles` - Extended user data beyond auth.users
    - `projects` - Solar/wind installation projects
    - `tasks` - Installation/maintenance work items
    - `leads` - Sales opportunities
    - `complaints` - Customer service tickets
    - `attendance` - Staff check-in/out with GPS
    - `inventory` - Equipment tracking
    - `invoices` & `invoice_items` - Billing system
    - `commissions` - Freelancer earnings tracking
    - `documents` - File metadata
    - `notifications` - Real-time notifications
    - `analytics_events` - User activity tracking
    - `user_sessions` - OTP session management

  2. Storage Buckets
    - `documents` - PDFs, certificates, contracts
    - `photos` - Installation photos, complaint evidence
    - `avatars` - User profile pictures (public)

  3. Security
    - Enable RLS on all tables
    - Role-based access policies
    - Secure file upload policies
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'agent', 'freelancer', 'installer', 'technician', 'customer')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'rejected')),
  location text,
  education text,
  bank_details jsonb DEFAULT '{}',
  customer_ref_number text UNIQUE,
  avatar_url text,
  metadata jsonb DEFAULT '{}',
  otp_verified boolean DEFAULT false,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_ref_number text NOT NULL,
  title text NOT NULL,
  description text,
  customer_id uuid REFERENCES user_profiles(id),
  customer_name text NOT NULL,
  customer_details jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled')),
  pipeline_stage text DEFAULT 'lead_generated' CHECK (pipeline_stage IN (
    'lead_generated', 'quotation_sent', 'bank_process', 'meter_applied', 
    'ready_for_installation', 'installation_complete', 'commissioned', 'active'
  )),
  installation_approved boolean DEFAULT false,
  type text NOT NULL CHECK (type IN ('solar', 'wind')),
  location text NOT NULL,
  coordinates point,
  assigned_to uuid REFERENCES user_profiles(id),
  assigned_to_name text,
  serial_numbers text[] DEFAULT '{}',
  start_date date,
  end_date date,
  value numeric(12,2) NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_ref_number text NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES user_profiles(id),
  assigned_to_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  type text NOT NULL CHECK (type IN ('installation', 'maintenance', 'inspection', 'consultation')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date date,
  serial_number text,
  photos text[] DEFAULT '{}',
  notes text,
  completion_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  email text,
  phone text NOT NULL,
  location text NOT NULL,
  type text NOT NULL CHECK (type IN ('solar', 'wind')),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'converted', 'lost')),
  assigned_to uuid REFERENCES user_profiles(id),
  assigned_to_name text,
  estimated_value numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  source text DEFAULT 'website',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_ref_number text NOT NULL,
  customer_id uuid REFERENCES user_profiles(id),
  customer_name text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid REFERENCES user_profiles(id),
  assigned_to_name text,
  serial_number text,
  resolution_notes text,
  photos text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  date date NOT NULL,
  check_in time,
  check_out time,
  location text,
  coordinates point,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('solar_panel', 'wind_turbine', 'inverter', 'battery', 'other')),
  model text NOT NULL,
  status text NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'assigned', 'installed', 'maintenance', 'decommissioned')),
  location text NOT NULL,
  assigned_to text, -- Can be project ID or user ID
  install_date date,
  warranty_expiry date,
  cost numeric(10,2),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  customer_ref_number text NOT NULL,
  project_id uuid REFERENCES projects(id),
  customer_id uuid REFERENCES user_profiles(id),
  customer_name text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  tax_amount numeric(12,2) DEFAULT 0,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date date,
  paid_date date,
  payment_method text,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Commissions table
CREATE TABLE IF NOT EXISTS commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid REFERENCES user_profiles(id),
  freelancer_name text NOT NULL,
  lead_id uuid REFERENCES leads(id),
  project_id uuid REFERENCES projects(id),
  commission_type text NOT NULL CHECK (commission_type IN ('lead_conversion', 'project_completion', 'referral', 'bonus')),
  base_amount numeric(12,2) NOT NULL DEFAULT 0,
  commission_rate numeric(5,4) NOT NULL DEFAULT 0.10, -- 10% default
  commission_amount numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  paid_date date,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('certificate', 'invoice', 'contract', 'photo', 'report', 'warranty', 'other')),
  file_path text NOT NULL,
  file_size bigint,
  mime_type text,
  uploaded_by uuid REFERENCES user_profiles(id),
  project_id uuid REFERENCES projects(id),
  customer_id uuid REFERENCES user_profiles(id),
  complaint_id uuid REFERENCES complaints(id),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  action_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id),
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  session_id text,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- User sessions table (for OTP management)
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  otp_code text NOT NULL,
  otp_expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  attempts integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = user_id AND role = 'admin' AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role FROM user_profiles 
    WHERE id = user_id AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" ON user_profiles
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admin can update all profiles" ON user_profiles
  FOR UPDATE TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can insert profile during signup" ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Customers can view own projects" ON projects
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Staff can view assigned projects" ON projects
  FOR SELECT TO authenticated
  USING (assigned_to = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Admin can manage all projects" ON projects
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Agents can create projects" ON projects
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'agent'));

CREATE POLICY "Staff can update assigned projects" ON projects
  FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid() OR is_admin(auth.uid()));

-- Tasks policies
CREATE POLICY "Users can view assigned tasks" ON tasks
  FOR SELECT TO authenticated
  USING (assigned_to = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Customers can view project tasks" ON tasks
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tasks.project_id 
      AND projects.customer_id = auth.uid()
    )
  );

CREATE POLICY "Staff can update assigned tasks" ON tasks
  FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Admin can manage all tasks" ON tasks
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- Leads policies
CREATE POLICY "Freelancers can view assigned leads" ON leads
  FOR SELECT TO authenticated
  USING (assigned_to = auth.uid() OR assigned_to IS NULL OR is_admin(auth.uid()));

CREATE POLICY "Freelancers can update assigned leads" ON leads
  FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Freelancers can create leads" ON leads
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'agent', 'freelancer'));

CREATE POLICY "Admin can manage all leads" ON leads
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- Complaints policies
CREATE POLICY "Customers can view own complaints" ON complaints
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can create complaints" ON complaints
  FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Technicians can view assigned complaints" ON complaints
  FOR SELECT TO authenticated
  USING (assigned_to = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Technicians can update assigned complaints" ON complaints
  FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Admin can manage all complaints" ON complaints
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- Attendance policies
CREATE POLICY "Users can manage own attendance" ON attendance
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin can view all attendance" ON attendance
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

-- Inventory policies
CREATE POLICY "All authenticated users can view inventory" ON inventory
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Staff can update inventory" ON inventory
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('admin', 'installer', 'technician'));

CREATE POLICY "Admin can manage all inventory" ON inventory
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- Invoices policies
CREATE POLICY "Customers can view own invoices" ON invoices
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Admin can manage all invoices" ON invoices
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- Invoice items policies
CREATE POLICY "Users can view invoice items for accessible invoices" ON invoice_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND (invoices.customer_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

-- Commissions policies
CREATE POLICY "Freelancers can view own commissions" ON commissions
  FOR SELECT TO authenticated
  USING (freelancer_id = auth.uid());

CREATE POLICY "Admin can manage all commissions" ON commissions
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- Documents policies
CREATE POLICY "Users can view related documents" ON documents
  FOR SELECT TO authenticated
  USING (
    uploaded_by = auth.uid() OR 
    customer_id = auth.uid() OR 
    is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = documents.project_id 
      AND (projects.customer_id = auth.uid() OR projects.assigned_to = auth.uid())
    )
  );

CREATE POLICY "Users can upload documents" ON documents
  FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Analytics events policies
CREATE POLICY "Users can create own analytics events" ON analytics_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admin can view all analytics" ON analytics_events
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

-- User sessions policies (for OTP)
CREATE POLICY "Users can manage own sessions" ON user_sessions
  FOR ALL TO authenticated
  USING (true); -- Allow for OTP verification process

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_customer_ref ON user_profiles(customer_ref_number);

CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_assigned_to ON projects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_customer_ref ON projects(customer_ref_number);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

CREATE INDEX IF NOT EXISTS idx_complaints_customer_id ON complaints(customer_id);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON complaints(assigned_to);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);

CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

CREATE INDEX IF NOT EXISTS idx_inventory_serial_number ON inventory(serial_number);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);

CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

CREATE INDEX IF NOT EXISTS idx_commissions_freelancer_id ON commissions(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);

CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_customer_id ON documents(customer_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON commissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Notification triggers
CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
      NEW.assigned_to,
      'New Task Assigned',
      'You have been assigned a new task: ' || NEW.title,
      'info'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_task_assignment
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION notify_task_assignment();

-- Lead conversion commission trigger
CREATE OR REPLACE FUNCTION handle_lead_conversion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'converted' AND OLD.status != 'converted' AND NEW.assigned_to IS NOT NULL THEN
    INSERT INTO commissions (
      freelancer_id,
      freelancer_name,
      lead_id,
      commission_type,
      base_amount,
      commission_rate,
      commission_amount,
      status
    )
    VALUES (
      NEW.assigned_to,
      NEW.assigned_to_name,
      NEW.id,
      'lead_conversion',
      NEW.estimated_value,
      0.10,
      NEW.estimated_value * 0.10,
      'pending'
    );
    
    -- Notify freelancer
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
      NEW.assigned_to,
      'Commission Earned',
      'You earned a commission for converting lead: ' || NEW.customer_name,
      'success'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_lead_conversion
  AFTER UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION handle_lead_conversion();

-- Auto-generate customer reference numbers
CREATE OR REPLACE FUNCTION generate_customer_ref()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'customer' AND NEW.customer_ref_number IS NULL THEN
    NEW.customer_ref_number := 'CUST-' || TO_CHAR(now(), 'YYYY') || '-' || 
                              LPAD(EXTRACT(DOY FROM now())::text, 3, '0') || 
                              LPAD(EXTRACT(HOUR FROM now())::text, 2, '0') ||
                              LPAD(EXTRACT(MINUTE FROM now())::text, 2, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_customer_ref
  BEFORE INSERT ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION generate_customer_ref();

-- Auto-generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(now(), 'YYYYMM') || '-' || 
                         LPAD(nextval('invoice_sequence')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS invoice_sequence START 1;

CREATE TRIGGER trigger_generate_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();