/*
  # Create Demo Auth Users

  1. Auth Users
    - Create demo users in auth.users table for testing
    - Set up proper authentication credentials
    - Link to user_profiles

  Note: In production, users would sign up through the app
  This is just for demo/testing purposes
*/

-- Insert demo auth users (for testing only)
-- Note: In production, these would be created through the signup flow

-- Company Admin
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'admin@greensolar.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "John Admin", "role": "company"}'
) ON CONFLICT (id) DO NOTHING;

-- Agent
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'agent@greensolar.com',
  crypt('agent123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "Sarah Agent", "role": "agent"}'
) ON CONFLICT (id) DO NOTHING;

-- Freelancer
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'freelancer@greensolar.com',
  crypt('freelancer123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "Mike Freelancer", "role": "freelancer"}'
) ON CONFLICT (id) DO NOTHING;

-- Installer
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  'installer@greensolar.com',
  crypt('installer123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "Tom Installer", "role": "installer"}'
) ON CONFLICT (id) DO NOTHING;

-- Technician
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  '55555555-5555-5555-5555-555555555555',
  'tech@greensolar.com',
  crypt('tech123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "Lisa Technician", "role": "technician"}'
) ON CONFLICT (id) DO NOTHING;

-- Customer
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  '66666666-6666-6666-6666-666666666666',
  'customer@example.com',
  crypt('customer123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "David Customer", "role": "customer"}'
) ON CONFLICT (id) DO NOTHING;

-- Additional customers
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  '77777777-7777-7777-7777-777777777777',
  'alice.johnson@example.com',
  crypt('alice123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "Alice Johnson", "role": "customer"}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  '88888888-8888-8888-8888-888888888888',
  'contact@greenenergycorp.com',
  crypt('greencorp123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "Green Energy Corp", "role": "customer"}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  '99999999-9999-9999-9999-999999999999',
  'procurement@techcorp.com',
  crypt('techcorp123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "Tech Corp", "role": "customer"}'
) ON CONFLICT (id) DO NOTHING;