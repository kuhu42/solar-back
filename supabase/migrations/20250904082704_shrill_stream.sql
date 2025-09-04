/*
  # Complete Backend Setup for GreenSolar Field Service Management

  1. New Tables
    - Complete users table with all required fields
    - Projects table with customer details and pipeline stages
    - Tasks table for field operations
    - Attendance table for staff tracking
    - Inventory table for equipment management
    - Leads table for sales pipeline
    - Complaints table for customer service
    - Invoices and invoice_items tables for billing
    - Notifications table for system alerts

  2. Security
    - Enable RLS on all tables
    - Create comprehensive policies for each user role
    - Admin access for company role
    - Role-based data access controls

  3. Demo Data
    - Create demo users for all roles
    - Sample projects, tasks, and other data
    - Realistic workflow examples
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS set_customer_ref_number() CASCADE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create customer reference number function
CREATE OR REPLACE FUNCTION set_customer_ref_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'customer' AND NEW.customer_ref_number IS NULL THEN
    NEW.customer_ref_number = 'CUST-' || TO_CHAR(now(), 'YYYY') || '-' || LPAD(NEXTVAL('customer_ref_seq')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for customer reference numbers
CREATE SEQUENCE IF NOT EXISTS customer_ref_seq START 1;

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('company', 'agent', 'freelancer', 'installer', 'technician', 'customer')),
  status text DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'rejected')),
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
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_ref_number text NOT NULL,
  title text NOT NULL,
  customer_id uuid REFERENCES users(id),
  customer_name text NOT NULL,
  customer_details jsonb DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled')),
  pipeline_stage text DEFAULT 'lead_generated' CHECK (pipeline_stage IN ('lead_generated', 'quotation_sent', 'bank_process', 'meter_applied', 'ready_for_installation', 'installation_complete', 'commissioned', 'active')),
  installation_approved boolean DEFAULT false,
  type text NOT NULL CHECK (type IN ('solar', 'wind')),
  location text NOT NULL,
  assigned_to uuid REFERENCES users(id),
  assigned_to_name text,
  serial_numbers text[] DEFAULT '{}',
  start_date date,
  end_date date,
  value numeric DEFAULT 0,
  description text,
  coordinates jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_ref_number text NOT NULL,
  project_id uuid REFERENCES projects(id),
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES users(id),
  assigned_to_name text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  type text NOT NULL CHECK (type IN ('installation', 'maintenance', 'inspection')),
  due_date date,
  serial_number text,
  photos text[] DEFAULT '{}',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Attendance table
CREATE TABLE attendance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id),
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
CREATE TABLE inventory (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  serial_number text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('solar_panel', 'wind_turbine', 'inverter', 'battery')),
  model text NOT NULL,
  status text DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'assigned', 'installed', 'maintenance', 'decommissioned')),
  location text NOT NULL,
  assigned_to text,
  install_date date,
  warranty_expiry date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Leads table
CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  location text NOT NULL,
  type text NOT NULL CHECK (type IN ('solar', 'wind')),
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'converted', 'lost')),
  assigned_to uuid REFERENCES users(id),
  assigned_to_name text,
  estimated_value numeric DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Complaints table
CREATE TABLE complaints (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_ref_number text NOT NULL,
  customer_id uuid NOT NULL REFERENCES users(id),
  customer_name text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid REFERENCES users(id),
  assigned_to_name text,
  serial_number text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Invoices table
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_ref_number text NOT NULL,
  project_id uuid REFERENCES projects(id),
  customer_id uuid NOT NULL REFERENCES users(id),
  customer_name text NOT NULL,
  amount numeric DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invoice items table
CREATE TABLE invoice_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity integer DEFAULT 1,
  unit_price numeric DEFAULT 0,
  total numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id),
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add triggers
CREATE TRIGGER trigger_set_customer_ref_number
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_customer_ref_number();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
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

-- Users policies
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can manage all users"
  ON users FOR ALL
  TO authenticated
  USING (auth.email() = 'admin@greensolar.com');

-- Projects policies
CREATE POLICY "Users can view assigned projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid() OR 
    assigned_to = auth.uid() OR 
    auth.email() = 'admin@greensolar.com'
  );

CREATE POLICY "Admin can manage all projects"
  ON projects FOR ALL
  TO authenticated
  USING (auth.email() = 'admin@greensolar.com');

-- Tasks policies
CREATE POLICY "Users can view assigned tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid() OR 
    auth.email() = 'admin@greensolar.com'
  );

CREATE POLICY "Users can update assigned tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid() OR 
    auth.email() = 'admin@greensolar.com'
  );

-- Attendance policies
CREATE POLICY "Users can manage own attendance"
  ON attendance FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin can view all attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (auth.email() = 'admin@greensolar.com');

-- Inventory policies
CREATE POLICY "All authenticated users can view inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage inventory"
  ON inventory FOR ALL
  TO authenticated
  USING (auth.email() = 'admin@greensolar.com');

-- Leads policies
CREATE POLICY "Users can view assigned leads"
  ON leads FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid() OR 
    auth.email() = 'admin@greensolar.com'
  );

CREATE POLICY "Admin can manage all leads"
  ON leads FOR ALL
  TO authenticated
  USING (auth.email() = 'admin@greensolar.com');

-- Complaints policies
CREATE POLICY "Users can view related complaints"
  ON complaints FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid() OR 
    assigned_to = auth.uid() OR 
    auth.email() = 'admin@greensolar.com'
  );

CREATE POLICY "Customers can create complaints"
  ON complaints FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Staff can update assigned complaints"
  ON complaints FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid() OR 
    auth.email() = 'admin@greensolar.com'
  );

-- Invoices policies
CREATE POLICY "Users can view related invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid() OR 
    auth.email() = 'admin@greensolar.com'
  );

CREATE POLICY "Admin can manage all invoices"
  ON invoices FOR ALL
  TO authenticated
  USING (auth.email() = 'admin@greensolar.com');

-- Invoice items policies
CREATE POLICY "Users can view invoice items"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND (invoices.customer_id = auth.uid() OR auth.email() = 'admin@greensolar.com')
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Insert demo users into public.users table
INSERT INTO users (id, email, name, role, status, phone, location, avatar, customer_ref_number) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@greensolar.com', 'John Admin', 'company', 'active', '+91 22 1234 5678', 'Mumbai Head Office', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', NULL),
('22222222-2222-2222-2222-222222222222', 'agent@greensolar.com', 'Sarah Agent', 'agent', 'active', '+91 98765 43210', 'Mumbai Field Office', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', NULL),
('33333333-3333-3333-3333-333333333333', 'freelancer@greensolar.com', 'Mike Freelancer', 'freelancer', 'active', '+91 98765 43211', 'Bangalore Remote', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', NULL),
('44444444-4444-4444-4444-444444444444', 'installer@greensolar.com', 'Tom Installer', 'installer', 'active', '+91 98765 43212', 'Delhi Installation Team', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', NULL),
('55555555-5555-5555-5555-555555555555', 'tech@greensolar.com', 'Lisa Technician', 'technician', 'active', '+91 98765 43213', 'Pune Maintenance Team', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', NULL),
('66666666-6666-6666-6666-666666666666', 'customer@example.com', 'David Customer', 'customer', 'active', '+91 98765 43214', 'Bandra West, Mumbai', 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'CUST-2024-001');

-- Insert demo projects
INSERT INTO projects (id, customer_ref_number, title, customer_id, customer_name, customer_details, status, pipeline_stage, installation_approved, type, location, assigned_to, assigned_to_name, serial_numbers, start_date, value, description, coordinates) VALUES
('proj-1', 'CUST-2024-001', 'Residential Solar Installation - Mumbai Bandra West', '66666666-6666-6666-6666-666666666666', 'David Customer', '{"name": "David Customer", "phone": "+91 98765 43210", "serviceNumber": "SRV-2024-001", "email": "david.customer@example.com", "address": "301, Sunrise Apartments, Bandra West, Mumbai, Maharashtra 400050", "moduleType": "Monocrystalline Silicon", "kwCapacity": "5 KW", "houseType": "Apartment", "floors": "3", "remarks": "Customer wants battery backup and net metering. Prefers installation during weekends."}', 'in_progress', 'installation_complete', true, 'solar', 'Bandra West, Mumbai, Maharashtra', '44444444-4444-4444-4444-444444444444', 'Tom Installer', '{"SP001", "SP002", "INV001"}', '2024-01-15', 250000, '5kW residential solar panel installation with battery backup', '{"lat": 19.0760, "lng": 72.8777}'),
('proj-2', 'CUST-2024-002', 'Commercial Solar Installation - Bangalore Whitefield', '77777777-7777-7777-7777-777777777777', 'Green Energy Corp', '{"name": "Green Energy Corp", "phone": "+91 80 1234 5678", "serviceNumber": "SRV-2024-002", "email": "contact@greenenergycorp.com", "address": "Plot 45, Whitefield Industrial Area, Bangalore, Karnataka 560066", "moduleType": "Polycrystalline Silicon", "kwCapacity": "25 KW", "houseType": "Commercial Building", "floors": "4", "remarks": "Large commercial installation. Requires grid tie-in and monitoring system."}', 'approved', 'ready_for_installation', false, 'solar', 'Whitefield, Bangalore, Karnataka', '22222222-2222-2222-2222-222222222222', 'Sarah Agent', '{"SP005", "SP006", "INV002"}', '2024-02-01', 1500000, '25kW commercial solar installation for office building', '{"lat": 12.9716, "lng": 77.5946}');

-- Insert demo tasks
INSERT INTO tasks (id, customer_ref_number, project_id, title, description, assigned_to, assigned_to_name, status, type, due_date, serial_number, notes) VALUES
('task-1', 'CUST-2024-001', 'proj-1', 'Install Solar Panels', 'Mount and connect solar panels on rooftop', '44444444-4444-4444-4444-444444444444', 'Tom Installer', 'in_progress', 'installation', '2024-01-20', 'SP001', 'Weather conditions good for installation'),
('task-2', 'CUST-2024-001', 'proj-1', 'Install Inverter', 'Install and configure solar inverter', '44444444-4444-4444-4444-444444444444', 'Tom Installer', 'pending', 'installation', '2024-01-22', 'INV001', 'Requires electrical inspection after installation'),
('task-3', 'CUST-2024-001', 'proj-1', 'Panel Inspection', 'Inspect solar panels for damage or wear', '55555555-5555-5555-5555-555555555555', 'Lisa Technician', 'completed', 'inspection', '2024-01-05', 'SP003', 'All panels in good condition');

-- Insert demo attendance
INSERT INTO attendance (id, user_id, user_name, date, check_in, check_out, location, coordinates) VALUES
('att-1', '22222222-2222-2222-2222-222222222222', 'Sarah Agent', '2024-01-15', '08:30', '17:00', 'Mumbai Field Office', '{"lat": 19.0760, "lng": 72.8777}'),
('att-2', '44444444-4444-4444-4444-444444444444', 'Tom Installer', '2024-01-15', '07:45', '16:30', 'Bandra West, Mumbai', '{"lat": 19.0760, "lng": 72.8777}'),
('att-3', '55555555-5555-5555-5555-555555555555', 'Lisa Technician', '2024-01-15', '09:00', NULL, 'Gurgaon Solar Site', '{"lat": 28.4595, "lng": 77.0266}');

-- Insert demo inventory
INSERT INTO inventory (id, serial_number, type, model, status, location, assigned_to, warranty_expiry, install_date) VALUES
('inv-1', 'SP001', 'solar_panel', 'SolarMax 300W', 'assigned', 'Mumbai Warehouse', 'proj-1', '2034-01-15', NULL),
('inv-2', 'SP002', 'solar_panel', 'SolarMax 300W', 'assigned', 'Mumbai Warehouse', 'proj-1', '2034-01-15', NULL),
('inv-3', 'INV001', 'inverter', 'PowerInvert 5000', 'assigned', 'Mumbai Warehouse', 'proj-1', '2029-01-15', NULL),
('inv-4', 'SP005', 'solar_panel', 'SolarMax 400W', 'in_stock', 'Bangalore Warehouse', NULL, '2034-02-01', NULL),
('inv-5', 'SP003', 'solar_panel', 'SolarMax 300W', 'installed', 'Gurgaon Solar Site', 'proj-1', '2033-06-15', '2023-06-15');

-- Insert demo leads
INSERT INTO leads (id, customer_name, email, phone, location, type, status, assigned_to, assigned_to_name, estimated_value, notes, created_at) VALUES
('lead-1', 'Alice Johnson', 'alice@example.com', '+91 98765 43215', 'Koramangala, Pune', 'solar', 'new', NULL, NULL, 300000, 'Interested in 6kW residential system', '2024-01-14'),
('lead-2', 'Bob Wilson', 'bob@example.com', '+91 98765 43216', 'Whitefield, Bangalore', 'solar', 'contacted', '33333333-3333-3333-3333-333333333333', 'Mike Freelancer', 750000, 'Commercial solar installation inquiry', '2024-01-12'),
('lead-3', 'Carol Davis', 'carol@example.com', '+91 98765 43217', 'Sector 62, Noida', 'solar', 'quoted', '22222222-2222-2222-2222-222222222222', 'Sarah Agent', 450000, 'Requested quote for 8kW system with battery', '2024-01-10');

-- Insert demo complaints
INSERT INTO complaints (id, customer_ref_number, customer_id, customer_name, title, description, status, priority, assigned_to, assigned_to_name, serial_number, created_at) VALUES
('comp-1', 'CUST-2024-001', '66666666-6666-6666-6666-666666666666', 'David Customer', 'Solar Panel Not Working', 'One of the solar panels stopped generating power after the storm', 'open', 'high', '55555555-5555-5555-5555-555555555555', 'Lisa Technician', 'SP003', '2024-01-14'),
('comp-2', 'CUST-2024-001', '66666666-6666-6666-6666-666666666666', 'David Customer', 'Inverter Making Noise', 'The inverter has been making unusual noises for the past week', 'in_progress', 'medium', '55555555-5555-5555-5555-555555555555', 'Lisa Technician', 'INV001', '2024-01-12');

-- Insert demo invoices
INSERT INTO invoices (id, customer_ref_number, project_id, customer_id, customer_name, amount, status, due_date, created_at) VALUES
('inv-1', 'CUST-2024-001', 'proj-1', '66666666-6666-6666-6666-666666666666', 'David Customer', 250000, 'sent', '2024-02-15', '2024-01-15'),
('inv-2', 'CUST-2024-001', 'proj-1', '66666666-6666-6666-6666-666666666666', 'David Customer', 50000, 'paid', '2024-01-20', '2024-01-10');

-- Insert demo invoice items
INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, total) VALUES
('item-1', 'inv-1', 'Solar Panel Installation', 1, 200000, 200000),
('item-2', 'inv-1', 'Inverter Installation', 1, 50000, 50000),
('item-3', 'inv-2', 'Solar Panel Maintenance', 1, 50000, 50000);

-- Insert demo notifications
INSERT INTO notifications (id, user_id, title, message, type, read, created_at) VALUES
('notif-1', '11111111-1111-1111-1111-111111111111', 'New User Registration', 'Mike Freelancer has registered and is pending approval', 'info', false, '2024-01-15T10:30:00Z'),
('notif-2', '44444444-4444-4444-4444-444444444444', 'New Task Assigned', 'You have been assigned a new installation task', 'info', false, '2024-01-15T09:15:00Z'),
('notif-3', '66666666-6666-6666-6666-666666666666', 'Project Update', 'Your solar installation project is now in progress', 'success', true, '2024-01-14T16:45:00Z');