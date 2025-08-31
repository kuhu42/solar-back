/*
  # Insert User Profiles Data

  1. User Profiles
    - Insert all mock users into user_profiles table
    - Generate proper customer reference numbers
    - Set appropriate roles and statuses

  2. Auth Users
    - Create corresponding auth.users entries for login
*/

-- Insert user profiles data
INSERT INTO user_profiles (
  id,
  email,
  name,
  role,
  status,
  phone,
  location,
  avatar,
  customer_ref_number,
  education,
  address,
  bank_details,
  profile_data
) VALUES
-- Company Admin
(
  '11111111-1111-1111-1111-111111111111',
  'admin@greensolar.com',
  'John Admin',
  'company',
  'active',
  '+91 22 1234 5678',
  'Mumbai Head Office',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  NULL,
  'MBA Operations',
  'Andheri East, Mumbai, Maharashtra 400069',
  'HDFC Bank, A/C: 12345678901, IFSC: HDFC0001234',
  '{}'
),
-- Agent
(
  '22222222-2222-2222-2222-222222222222',
  'agent@greensolar.com',
  'Sarah Agent',
  'agent',
  'active',
  '+91 98765 43210',
  'Mumbai Field Office',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  NULL,
  'B.Tech Electrical',
  'Bandra West, Mumbai, Maharashtra 400050',
  'ICICI Bank, A/C: 23456789012, IFSC: ICIC0002345',
  '{}'
),
-- Freelancer (Pending)
(
  '33333333-3333-3333-3333-333333333333',
  'freelancer@greensolar.com',
  'Mike Freelancer',
  'freelancer',
  'pending',
  '+91 98765 43211',
  'Bangalore Remote',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  NULL,
  'B.Com Marketing',
  'Whitefield, Bangalore, Karnataka 560066',
  'SBI Bank, A/C: 34567890123, IFSC: SBIN0003456',
  '{}'
),
-- Installer
(
  '44444444-4444-4444-4444-444444444444',
  'installer@greensolar.com',
  'Tom Installer',
  'installer',
  'active',
  '+91 98765 43212',
  'Delhi Installation Team',
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  NULL,
  'ITI Electrical',
  'Gurgaon, Haryana 122001',
  'PNB Bank, A/C: 45678901234, IFSC: PUNB0004567',
  '{}'
),
-- Technician (Pending)
(
  '55555555-5555-5555-5555-555555555555',
  'tech@greensolar.com',
  'Lisa Technician',
  'technician',
  'pending',
  '+91 98765 43213',
  'Pune Maintenance Team',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  NULL,
  'Diploma Electronics',
  'Koramangala, Pune, Maharashtra 411001',
  'Axis Bank, A/C: 56789012345, IFSC: UTIB0005678',
  '{}'
),
-- Customer 1
(
  '66666666-6666-6666-6666-666666666666',
  'customer@example.com',
  'David Customer',
  'customer',
  'active',
  '+91 98765 43214',
  'Bandra West, Mumbai',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'CUST-2024-001',
  NULL,
  '301, Sunrise Apartments, Bandra West, Mumbai, Maharashtra 400050',
  'HDFC Bank, A/C: 67890123456, IFSC: HDFC0006789',
  '{"serviceNumber": "SRV-2024-001", "moduleType": "Monocrystalline Silicon", "kwCapacity": "5 KW", "houseType": "Apartment", "floors": "3", "remarks": "Customer wants battery backup and net metering. Prefers installation during weekends."}'
),
-- Customer 2
(
  '77777777-7777-7777-7777-777777777777',
  'alice.johnson@example.com',
  'Alice Johnson',
  'customer',
  'active',
  '+91 98765 43215',
  'Koramangala, Pune',
  'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'CUST-2024-002',
  NULL,
  '12/A, Tech Park Road, Koramangala, Pune, Maharashtra 411001',
  'ICICI Bank, A/C: 78901234567, IFSC: ICIC0007890',
  '{"serviceNumber": "SRV-2024-004", "moduleType": "Bifacial Solar Panels", "kwCapacity": "6 KW", "houseType": "Villa", "floors": "2", "remarks": "Customer interested in smart monitoring system and wants installation completed before monsoon."}'
),
-- Customer 3
(
  '88888888-8888-8888-8888-888888888888',
  'contact@greenenergycorp.com',
  'Green Energy Corp',
  'customer',
  'active',
  '+91 80 1234 5678',
  'Whitefield, Bangalore',
  'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'CUST-2024-003',
  NULL,
  'Plot 45, Whitefield Industrial Area, Bangalore, Karnataka 560066',
  'SBI Bank, A/C: 89012345678, IFSC: SBIN0008901',
  '{"serviceNumber": "SRV-2024-002", "moduleType": "Polycrystalline Silicon", "kwCapacity": "25 KW", "houseType": "Commercial Building", "floors": "4", "remarks": "Large commercial installation. Requires grid tie-in and monitoring system."}'
),
-- Customer 4
(
  '99999999-9999-9999-9999-999999999999',
  'procurement@techcorp.com',
  'Tech Corp',
  'customer',
  'active',
  '+91 120 456 7890',
  'Sector 62, Noida',
  'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'CUST-2024-004',
  NULL,
  'Tower B, Sector 62, Noida, Uttar Pradesh 201301',
  'Axis Bank, A/C: 90123456789, IFSC: UTIB0009012',
  '{"serviceNumber": "SRV-2024-005", "moduleType": "High Efficiency Monocrystalline", "kwCapacity": "15 KW", "houseType": "Office Building", "floors": "6", "remarks": "Corporate installation with tax benefits requirement. Needs completion certificate for government subsidies."}'
)
ON CONFLICT (id) DO NOTHING;

-- Update existing tables to reference user_profiles
UPDATE projects SET customer_id = '66666666-6666-6666-6666-666666666666' WHERE customer_ref_number = 'CUST-2024-001';
UPDATE projects SET customer_id = '77777777-7777-7777-7777-777777777777' WHERE customer_ref_number = 'CUST-2024-002';
UPDATE projects SET customer_id = '88888888-8888-8888-8888-888888888888' WHERE customer_ref_number = 'CUST-2024-003';
UPDATE projects SET customer_id = '99999999-9999-9999-9999-999999999999' WHERE customer_ref_number = 'CUST-2024-004';

UPDATE projects SET assigned_to = '22222222-2222-2222-2222-222222222222' WHERE assigned_to_name = 'Sarah Agent';
UPDATE projects SET assigned_to = '44444444-4444-4444-4444-444444444444' WHERE assigned_to_name = 'Tom Installer';
UPDATE projects SET assigned_to = '55555555-5555-5555-5555-555555555555' WHERE assigned_to_name = 'Lisa Technician';

UPDATE tasks SET assigned_to = '44444444-4444-4444-4444-444444444444' WHERE assigned_to_name = 'Tom Installer';
UPDATE tasks SET assigned_to = '55555555-5555-5555-5555-555555555555' WHERE assigned_to_name = 'Lisa Technician';

UPDATE complaints SET customer_id = '66666666-6666-6666-6666-666666666666' WHERE customer_ref_number = 'CUST-2024-001';
UPDATE complaints SET assigned_to = '55555555-5555-5555-5555-555555555555' WHERE assigned_to_name = 'Lisa Technician';

UPDATE invoices SET customer_id = '66666666-6666-6666-6666-666666666666' WHERE customer_ref_number = 'CUST-2024-001';

UPDATE leads SET assigned_to = '33333333-3333-3333-3333-333333333333' WHERE assigned_to_name = 'Mike Freelancer';
UPDATE leads SET assigned_to = '22222222-2222-2222-2222-222222222222' WHERE assigned_to_name = 'Sarah Agent';

UPDATE attendance SET user_id = '22222222-2222-2222-2222-222222222222' WHERE user_name = 'Sarah Agent';
UPDATE attendance SET user_id = '44444444-4444-4444-4444-444444444444' WHERE user_name = 'Tom Installer';
UPDATE attendance SET user_id = '55555555-5555-5555-5555-555555555555' WHERE user_name = 'Lisa Technician';

UPDATE notifications SET user_id = '11111111-1111-1111-1111-111111111111' WHERE title LIKE '%registration%';
UPDATE notifications SET user_id = '44444444-4444-4444-4444-444444444444' WHERE title LIKE '%task%';
UPDATE notifications SET user_id = '66666666-6666-6666-6666-666666666666' WHERE title LIKE '%project%';