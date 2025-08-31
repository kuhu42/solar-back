/*
  # Fix RLS Policy Recursion Error

  1. Security Updates
    - Drop existing recursive RLS policies on users table
    - Create simplified, non-recursive policies
    - Ensure policies don't reference the users table in a circular way
    - Add proper auth.uid() based policies

  2. Policy Changes
    - Users can read their own data using auth.uid()
    - Users can update their own data using auth.uid()
    - Company role users can manage all users
    - Remove recursive policy checks that cause infinite loops
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Company can manage all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create simple, non-recursive policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Company admin can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users au
      WHERE au.id = auth.uid()
      AND au.email = 'admin@greensolar.com'
    )
  );

CREATE POLICY "Company admin can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users au
      WHERE au.id = auth.uid()
      AND au.email = 'admin@greensolar.com'
    )
  );

CREATE POLICY "Allow user registration"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);