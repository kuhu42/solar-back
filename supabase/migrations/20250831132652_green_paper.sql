/*
  # Fix All RLS Policies and Permissions

  1. Security Updates
    - Drop all existing problematic policies
    - Create simple, non-recursive policies for all tables
    - Enable proper access for authenticated users
    - Add admin access policies

  2. Tables Updated
    - users: Basic CRUD for own data + admin access
    - projects: Read for participants + admin management
    - tasks: Read/update for assigned users + admin
    - leads: Read for assigned + admin management
    - complaints: CRUD for customers/assigned + admin
    - invoices: Read for customers + admin management
    - invoice_items: Read access based on invoice ownership
    - notifications: CRUD for own notifications
    - attendance: CRUD for own attendance + admin read
    - inventory: Read for all + admin management
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Enable admin access" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable read for own profile" ON users;
DROP POLICY IF EXISTS "Enable update for own profile" ON users;

DROP POLICY IF EXISTS "Enable admin project management" ON projects;
DROP POLICY IF EXISTS "Enable read for project participants" ON projects;

DROP POLICY IF EXISTS "Enable read for task participants" ON tasks;
DROP POLICY IF EXISTS "Enable task updates for assigned users" ON tasks;

DROP POLICY IF EXISTS "Enable manage leads for admin" ON leads;
DROP POLICY IF EXISTS "Enable read leads for professionals" ON leads;

DROP POLICY IF EXISTS "Enable create complaints for customers" ON complaints;
DROP POLICY IF EXISTS "Enable read relevant complaints" ON complaints;
DROP POLICY IF EXISTS "Enable update complaints for assigned users" ON complaints;

DROP POLICY IF EXISTS "Enable admin invoice management" ON invoices;
DROP POLICY IF EXISTS "Enable read relevant invoices" ON invoices;

DROP POLICY IF EXISTS "Enable read invoice items" ON invoice_items;

DROP POLICY IF EXISTS "Enable read own notifications" ON notifications;
DROP POLICY IF EXISTS "Enable update own notifications" ON notifications;

DROP POLICY IF EXISTS "Enable manage own attendance" ON attendance;
DROP POLICY IF EXISTS "Enable read own attendance" ON attendance;

DROP POLICY IF EXISTS "Enable admin inventory management" ON inventory;
DROP POLICY IF EXISTS "Enable read inventory for all authenticated" ON inventory;

-- Create simple, non-recursive policies for users table
CREATE POLICY "users_select_own" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_admin_all" ON users
  FOR ALL TO authenticated
  USING (auth.email() = 'admin@greensolar.com');

-- Create policies for projects table
CREATE POLICY "projects_select" ON projects
  FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid() OR 
    assigned_to = auth.uid() OR 
    auth.email() = 'admin@greensolar.com'
  );

CREATE POLICY "projects_admin_all" ON projects
  FOR ALL TO authenticated
  USING (auth.email() = 'admin@greensolar.com');

-- Create policies for tasks table
CREATE POLICY "tasks_select" ON tasks
  FOR SELECT TO authenticated
  USING (
    assigned_to = auth.uid() OR 
    auth.email() = 'admin@greensolar.com'
  );

CREATE POLICY "tasks_update" ON tasks
  FOR UPDATE TO authenticated
  USING (
    assigned_to = auth.uid() OR 
    auth.email() = 'admin@greensolar.com'
  );

-- Create policies for leads table
CREATE POLICY "leads_select" ON leads
  FOR SELECT TO authenticated
  USING (
    assigned_to = auth.uid() OR 
    auth.email() = 'admin@greensolar.com'
  );

CREATE POLICY "leads_admin_all" ON leads
  FOR ALL TO authenticated
  USING (auth.email() = 'admin@greensolar.com');

-- Create policies for complaints table
CREATE POLICY "complaints_select" ON complaints
  FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid() OR 
    assigned_to = auth.uid() OR 
    auth.email() = 'admin@greensolar.com'
  );

CREATE POLICY "complaints_insert" ON complaints
  FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "complaints_update" ON complaints
  FOR UPDATE TO authenticated
  USING (
    assigned_to = auth.uid() OR 
    auth.email() = 'admin@greensolar.com'
  );

-- Create policies for invoices table
CREATE POLICY "invoices_select" ON invoices
  FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid() OR 
    auth.email() = 'admin@greensolar.com'
  );

CREATE POLICY "invoices_admin_all" ON invoices
  FOR ALL TO authenticated
  USING (auth.email() = 'admin@greensolar.com');

-- Create policies for invoice_items table
CREATE POLICY "invoice_items_select" ON invoice_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND (invoices.customer_id = auth.uid() OR auth.email() = 'admin@greensolar.com')
    )
  );

-- Create policies for notifications table
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for attendance table
CREATE POLICY "attendance_select" ON attendance
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    auth.email() = 'admin@greensolar.com'
  );

CREATE POLICY "attendance_insert_own" ON attendance
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "attendance_update_own" ON attendance
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for inventory table
CREATE POLICY "inventory_select_all" ON inventory
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "inventory_admin_all" ON inventory
  FOR ALL TO authenticated
  USING (auth.email() = 'admin@greensolar.com');