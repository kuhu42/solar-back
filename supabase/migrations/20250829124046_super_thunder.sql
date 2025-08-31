/*
  # GreenSolar Database Schema

  1. New Tables
    - `users` - All system users (customers, agents, freelancers, installers, technicians, company)
    - `projects` - Solar/wind installation projects
    - `tasks` - Installation and maintenance tasks
    - `attendance` - Staff attendance tracking
    - `inventory` - Equipment inventory management
    - `leads` - Sales leads and prospects
    - `complaints` - Customer complaints and issues
    - `invoices` - Billing and invoicing
    - `invoice_items` - Invoice line items
    - `notifications` - System notifications

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure customer data access

  3. Features
    - Customer reference number generation
    - Automatic timestamps
    - Proper foreign key relationships
    - Role-based data access
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (all system users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('company', 'agent', 'freelancer', 'installer', 'technician', 'customer')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'rejected')),
  phone text,
  location text,
  avatar text,
  customer_ref_number text UNIQUE,
  education text,
  address text,
  bank_details text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_ref_number text NOT NULL,
  title text NOT NULL,
  customer_id uuid REFERENCES users(id),
  customer_name text NOT NULL,
  customer_details jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled')),
  pipeline_stage text DEFAULT 'lead_generated' CHECK (pipeline_stage IN ('lead_generated', 'quotation_sent', 'bank_process', 'meter_applied', 'ready_for_installation', 'installation_complete', 'commissioned', 'active')),
  installation_approved boolean DEFAULT false,
  type text NOT NULL CHECK (type IN ('solar', 'wind')),
  location text NOT NULL,
  assigned_to uuid REFERENCES users(id),
  assigned_to_name text,
  serial_numbers text[] DEFAULT '{}',
  start_date date,
  end_date date,
  value numeric NOT NULL DEFAULT 0,
  description text,
  coordinates jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_ref_number text NOT NULL,
  project_id uuid REFERENCES projects(id),
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES users(id),
  assigned_to_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  type text NOT NULL CHECK (type IN ('installation', 'maintenance', 'inspection')),
  due_date date,
  serial_number text,
  photos text[] DEFAULT '{}',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) NOT NULL,
  user_name text NOT NULL,
  date date NOT NULL,
  check_in time,
  check_out time,
  location text,
  coordinates jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  serial_number text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('solar_panel', 'wind_turbine', 'inverter', 'battery')),
  model text NOT NULL,
  status text NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'assigned', 'installed', 'maintenance', 'decommissioned')),
  location text NOT NULL,
  assigned_to text,
  install_date date,
  warranty_expiry date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  location text NOT NULL,
  type text NOT NULL CHECK (type IN ('solar', 'wind')),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'converted', 'lost')),
  assigned_to uuid REFERENCES users(id),
  assigned_to_name text,
  estimated_value numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_ref_number text NOT NULL,
  customer_id uuid REFERENCES users(id) NOT NULL,
  customer_name text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid REFERENCES users(id),
  assigned_to_name text,
  serial_number text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_ref_number text NOT NULL,
  project_id uuid REFERENCES projects(id),
  customer_id uuid REFERENCES users(id) NOT NULL,
  customer_name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid()::text = id::text OR EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'company'
  ));

CREATE POLICY "Company can manage all users" ON users
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'company'
  ));

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = id::text);

-- Projects policies
CREATE POLICY "Users can read relevant projects" ON projects
  FOR SELECT TO authenticated
  USING (
    customer_id::text = auth.uid()::text OR
    assigned_to::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('company', 'agent'))
  );

CREATE POLICY "Company and agents can manage projects" ON projects
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('company', 'agent')
  ));

-- Tasks policies
CREATE POLICY "Users can read relevant tasks" ON tasks
  FOR SELECT TO authenticated
  USING (
    assigned_to::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('company', 'agent')) OR
    EXISTS (SELECT 1 FROM projects WHERE id = tasks.project_id AND customer_id::text = auth.uid()::text)
  );

CREATE POLICY "Assigned users can update tasks" ON tasks
  FOR UPDATE TO authenticated
  USING (
    assigned_to::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('company', 'agent'))
  );

-- Attendance policies
CREATE POLICY "Users can read own attendance" ON attendance
  FOR SELECT TO authenticated
  USING (
    user_id::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'company')
  );

CREATE POLICY "Users can manage own attendance" ON attendance
  FOR ALL TO authenticated
  USING (user_id::text = auth.uid()::text);

-- Inventory policies
CREATE POLICY "All authenticated users can read inventory" ON inventory
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Company can manage inventory" ON inventory
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'company'
  ));

-- Leads policies
CREATE POLICY "Users can read relevant leads" ON leads
  FOR SELECT TO authenticated
  USING (
    assigned_to::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('company', 'agent', 'freelancer'))
  );

CREATE POLICY "Freelancers and agents can manage leads" ON leads
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('company', 'agent', 'freelancer')
  ));

-- Complaints policies
CREATE POLICY "Users can read relevant complaints" ON complaints
  FOR SELECT TO authenticated
  USING (
    customer_id::text = auth.uid()::text OR
    assigned_to::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('company', 'agent', 'technician'))
  );

CREATE POLICY "Customers can create complaints" ON complaints
  FOR INSERT TO authenticated
  WITH CHECK (customer_id::text = auth.uid()::text);

CREATE POLICY "Technicians can update complaints" ON complaints
  FOR UPDATE TO authenticated
  USING (
    assigned_to::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('company', 'agent'))
  );

-- Invoices policies
CREATE POLICY "Users can read relevant invoices" ON invoices
  FOR SELECT TO authenticated
  USING (
    customer_id::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('company', 'agent', 'technician'))
  );

CREATE POLICY "Company can manage invoices" ON invoices
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('company', 'agent')
  ));

-- Invoice items policies
CREATE POLICY "Users can read invoice items" ON invoice_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM invoices 
    WHERE id = invoice_items.invoice_id 
    AND (customer_id::text = auth.uid()::text OR 
         EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('company', 'agent')))
  ));

-- Notifications policies
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id::text = auth.uid()::text);

-- Functions for customer reference number generation
CREATE OR REPLACE FUNCTION generate_customer_ref_number()
RETURNS text AS $$
DECLARE
  year_part text;
  sequence_num integer;
  ref_number text;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::text;
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(customer_ref_number FROM 'CUST-\d{4}-(\d+)') AS integer)
  ), 0) + 1
  INTO sequence_num
  FROM users 
  WHERE customer_ref_number LIKE 'CUST-' || year_part || '-%';
  
  ref_number := 'CUST-' || year_part || '-' || LPAD(sequence_num::text, 3, '0');
  
  RETURN ref_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate customer reference numbers
CREATE OR REPLACE FUNCTION set_customer_ref_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'customer' AND NEW.customer_ref_number IS NULL THEN
    NEW.customer_ref_number := generate_customer_ref_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_customer_ref_number
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_customer_ref_number();

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();