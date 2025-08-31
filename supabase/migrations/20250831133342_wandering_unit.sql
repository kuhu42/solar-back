/*
  # Create Demo Users with Authentication

  1. Purpose
    - Create demo users in both auth.users and public.users tables
    - Provide working login credentials for testing
    - Set up proper user profiles with roles and status

  2. Demo Accounts Created
    - admin@greensolar.com (password: admin123) - Company Admin
    - agent@greensolar.com (password: agent123) - Sales Agent  
    - customer@example.com (password: customer123) - Customer
    - installer@greensolar.com (password: installer123) - Installer
    - tech@greensolar.com (password: tech123) - Technician (pending approval)
    - freelancer@greensolar.com (password: freelancer123) - Freelancer (pending approval)

  3. Security
    - All demo users have proper authentication entries
    - User profiles linked to auth.users via id
    - Appropriate roles and status assigned
*/

-- Create demo users in auth.users table (this creates the authentication records)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'admin@greensolar.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'agent@greensolar.com',
    crypt('agent123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'customer@example.com',
    crypt('customer123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '00000000-0000-0000-0000-000000000000',
    'installer@greensolar.com',
    crypt('installer123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    '00000000-0000-0000-0000-000000000000',
    'tech@greensolar.com',
    crypt('tech123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    '00000000-0000-0000-0000-000000000000',
    'freelancer@greensolar.com',
    crypt('freelancer123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
ON CONFLICT (email) DO NOTHING;

-- Create corresponding user profiles in public.users table
INSERT INTO public.users (
  id,
  email,
  name,
  role,
  status,
  phone,
  location,
  customer_ref_number,
  created_at,
  updated_at
) VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'admin@greensolar.com',
    'John Admin',
    'company',
    'active',
    '+91 98765 43210',
    'Mumbai Head Office',
    NULL,
    now(),
    now()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'agent@greensolar.com',
    'Sarah Agent',
    'agent',
    'active',
    '+91 98765 43211',
    'Mumbai Field Office',
    NULL,
    now(),
    now()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'customer@example.com',
    'David Customer',
    'customer',
    'active',
    '+91 98765 43212',
    'Bandra West, Mumbai',
    'CUST-2024-001',
    now(),
    now()
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'installer@greensolar.com',
    'Tom Installer',
    'installer',
    'active',
    '+91 98765 43213',
    'Delhi Installation Team',
    NULL,
    now(),
    now()
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'tech@greensolar.com',
    'Lisa Technician',
    'technician',
    'pending',
    '+91 98765 43214',
    'Pune Maintenance Team',
    NULL,
    now(),
    now()
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'freelancer@greensolar.com',
    'Mike Freelancer',
    'freelancer',
    'pending',
    '+91 98765 43215',
    'Bangalore Remote',
    NULL,
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  phone = EXCLUDED.phone,
  location = EXCLUDED.location,
  updated_at = now();