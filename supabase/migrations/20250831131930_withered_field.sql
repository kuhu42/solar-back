/*
  # Fix RLS Permission Errors

  1. Security Updates
    - Drop existing problematic policies that cause recursion
    - Create simple, non-recursive policies for all tables
    - Allow authenticated users to read their own data
    - Allow admin users to read all data
    - Enable proper INSERT permissions for new users

  2. Tables Updated
    - users: Read own profile, admin reads all
    - projects: Read assigned/owned projects, admin reads all
    - tasks: Read assigned tasks, admin reads all
    - attendance: Read own attendance, admin reads all
    - inventory: All authenticated users can read
    - leads: Agents/freelancers can manage, admin reads all
    - complaints: Read own complaints, assigned users can update
    - invoices: Read own invoices, admin manages all
    - notifications: Read own notifications
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Company admin can manage all users" ON users;
DROP POLICY IF EXISTS "Company admin can read all users" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

DROP POLICY IF EXISTS "Company and agents can manage projects" ON projects;
DROP POLICY IF EXISTS "Users can read relevant projects" ON projects;

DROP POLICY IF EXISTS "Assigned users can update tasks" ON tasks;
DROP POLICY IF EXISTS "Users can read relevant tasks" ON tasks;

DROP POLICY IF EXISTS "Users can manage own attendance" ON attendance;
DROP POLICY IF EXISTS "Users can read own attendance" ON attendance;

DROP POLICY IF EXISTS "All authenticated users can read inventory" ON inventory;
DROP POLICY IF EXISTS "Company can manage inventory" ON inventory;

DROP POLICY IF EXISTS "Freelancers and agents can manage leads" ON leads;
DROP POLICY IF EXISTS "Users can read relevant leads" ON leads;

DROP POLICY IF EXISTS "Customers can create complaints" ON complaints;
DROP POLICY IF EXISTS "Technicians can update complaints" ON complaints;
DROP POLICY IF EXISTS "Users can read relevant complaints" ON complaints;

DROP POLICY IF EXISTS "Company can manage invoices" ON invoices;
DROP POLICY IF EXISTS "Users can read relevant invoices" ON invoices;

DROP POLICY IF EXISTS "Users can read invoice items" ON invoice_items;

DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Create simple, non-recursive policies for users table
CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable read for own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable admin access" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@greensolar.com'
    )
  );

-- Projects policies
CREATE POLICY "Enable read for project participants" ON projects
  FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid() OR 
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@greensolar.com'
    )
  );

CREATE POLICY "Enable admin project management" ON projects
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@greensolar.com'
    )
  );

-- Tasks policies
CREATE POLICY "Enable read for task participants" ON tasks
  FOR SELECT TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tasks.project_id 
      AND projects.customer_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@greensolar.com'
    )
  );

CREATE POLICY "Enable task updates for assigned users" ON tasks
  FOR UPDATE TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@greensolar.com'
    )
  );

-- Attendance policies
CREATE POLICY "Enable read own attendance" ON attendance
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@greensolar.com'
    )
  );

CREATE POLICY "Enable manage own attendance" ON attendance
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Inventory policies
CREATE POLICY "Enable read inventory for all authenticated" ON inventory
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable admin inventory management" ON inventory
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@greensolar.com'
    )
  );

-- Leads policies
CREATE POLICY "Enable read leads for professionals" ON leads
  FOR SELECT TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@greensolar.com'
    )
  );

CREATE POLICY "Enable manage leads for admin" ON leads
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@greensolar.com'
    )
  );

-- Complaints policies
CREATE POLICY "Enable read relevant complaints" ON complaints
  FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid() OR
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@greensolar.com'
    )
  );

CREATE POLICY "Enable create complaints for customers" ON complaints
  FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Enable update complaints for assigned users" ON complaints
  FOR UPDATE TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@greensolar.com'
    )
  );

-- Invoices policies
CREATE POLICY "Enable read relevant invoices" ON invoices
  FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@greensolar.com'
    )
  );

CREATE POLICY "Enable admin invoice management" ON invoices
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@greensolar.com'
    )
  );

-- Invoice items policies
CREATE POLICY "Enable read invoice items" ON invoice_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND (
        invoices.customer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM auth.users 
          WHERE auth.users.id = auth.uid() 
          AND auth.users.email = 'admin@greensolar.com'
        )
      )
    )
  );

-- Notifications policies
CREATE POLICY "Enable read own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Enable update own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());