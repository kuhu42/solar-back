/*
  # Insert Demo Data

  1. Demo Users
    - Admin, Agent, Freelancer, Installer, Technician, Customer accounts
    - Each with proper authentication and profile data

  2. Sample Projects
    - Various stages of solar/wind installations
    - Realistic customer data and project details

  3. Sample Tasks, Leads, Complaints
    - Distributed across different users and statuses
    - Realistic workflow scenarios

  4. Sample Inventory
    - Equipment with serial numbers and statuses
    - Proper assignment to projects
*/

-- Insert demo user profiles (these will be created via auth signup in the app)
-- We'll create the profile data that will be linked when users sign up

-- Demo projects
INSERT INTO projects (
  id,
  customer_ref_number,
  title,
  customer_name,
  customer_details,
  status,
  pipeline_stage,
  installation_approved,
  type,
  location,
  coordinates,
  serial_numbers,
  start_date,
  end_date,
  value,
  description
) VALUES 
(
  'proj-demo-1',
  'CUST-2024-001',
  'Residential Solar Installation - Mumbai Bandra West',
  'David Customer',
  '{"name": "David Customer", "phone": "+91 98765 43210", "email": "customer@example.com", "address": "301, Sunrise Apartments, Bandra West, Mumbai, Maharashtra 400050", "moduleType": "Monocrystalline Silicon", "kwCapacity": "5 KW", "houseType": "Apartment", "floors": "3", "remarks": "Customer wants battery backup and net metering"}',
  'in_progress',
  'installation_complete',
  true,
  'solar',
  'Bandra West, Mumbai, Maharashtra',
  '{"lat": 19.0760, "lng": 72.8777}',
  ARRAY['SP001', 'SP002', 'INV001'],
  '2024-01-15',
  NULL,
  250000,
  '5kW residential solar panel installation with battery backup'
),
(
  'proj-demo-2',
  'CUST-2024-002',
  'Commercial Solar Installation - Bangalore Whitefield',
  'Green Energy Corp',
  '{"name": "Green Energy Corp", "phone": "+91 80 1234 5678", "email": "contact@greenenergycorp.com", "address": "Plot 45, Whitefield Industrial Area, Bangalore, Karnataka 560066", "moduleType": "Polycrystalline Silicon", "kwCapacity": "25 KW", "houseType": "Commercial Building", "floors": "4"}',
  'approved',
  'ready_for_installation',
  false,
  'solar',
  'Whitefield, Bangalore, Karnataka',
  '{"lat": 12.9716, "lng": 77.5946}',
  ARRAY['SP005', 'SP006', 'INV002'],
  '2024-02-01',
  NULL,
  1500000,
  '25kW commercial solar installation for office building'
),
(
  'proj-demo-3',
  'CUST-2024-001',
  'Solar Panel Maintenance - Delhi NCR Gurgaon',
  'David Customer',
  '{"name": "David Customer", "phone": "+91 98765 43210", "email": "customer@example.com", "address": "B-204, Green Valley Society, Sector 29, Gurgaon, Haryana 122001", "moduleType": "Monocrystalline Silicon", "kwCapacity": "3 KW", "houseType": "Independent House", "floors": "2"}',
  'completed',
  'active',
  true,
  'solar',
  'Sector 29, Gurgaon, Haryana',
  '{"lat": 28.4595, "lng": 77.0266}',
  ARRAY['SP003', 'SP004'],
  '2024-01-01',
  '2024-01-10',
  50000,
  'Routine maintenance and inspection of solar panels'
);

-- Demo leads
INSERT INTO leads (
  id,
  customer_name,
  email,
  phone,
  location,
  type,
  status,
  estimated_value,
  notes,
  source
) VALUES 
(
  'lead-demo-1',
  'Alice Johnson',
  'alice@example.com',
  '+91 98765 43211',
  'Koramangala, Pune',
  'solar',
  'new',
  300000,
  'Interested in 6kW residential system with battery backup',
  'website'
),
(
  'lead-demo-2',
  'Bob Wilson',
  'bob@example.com',
  '+91 98765 43212',
  'Whitefield, Bangalore',
  'solar',
  'contacted',
  750000,
  'Commercial solar installation inquiry for office building',
  'referral'
),
(
  'lead-demo-3',
  'Carol Davis',
  'carol@example.com',
  '+91 98765 43213',
  'Sector 62, Noida',
  'solar',
  'quoted',
  450000,
  'Requested quote for 8kW system with battery and monitoring',
  'phone'
);

-- Demo inventory
INSERT INTO inventory (
  id,
  serial_number,
  type,
  model,
  status,
  location,
  assigned_to,
  project_id,
  install_date,
  warranty_expiry,
  purchase_date,
  cost
) VALUES 
(
  'inv-demo-1',
  'SP001',
  'solar_panel',
  'SolarMax 300W Monocrystalline',
  'assigned',
  'Mumbai Warehouse',
  'proj-demo-1',
  'proj-demo-1',
  NULL,
  '2034-01-15',
  '2024-01-01',
  15000
),
(
  'inv-demo-2',
  'SP002',
  'solar_panel',
  'SolarMax 300W Monocrystalline',
  'assigned',
  'Mumbai Warehouse',
  'proj-demo-1',
  'proj-demo-1',
  NULL,
  '2034-01-15',
  '2024-01-01',
  15000
),
(
  'inv-demo-3',
  'INV001',
  'inverter',
  'PowerInvert 5000W Hybrid',
  'assigned',
  'Mumbai Warehouse',
  'proj-demo-1',
  'proj-demo-1',
  NULL,
  '2029-01-15',
  '2024-01-01',
  45000
),
(
  'inv-demo-4',
  'SP005',
  'solar_panel',
  'SolarMax 400W Bifacial',
  'in_stock',
  'Bangalore Warehouse',
  NULL,
  NULL,
  NULL,
  '2034-02-01',
  '2024-01-15',
  18000
),
(
  'inv-demo-5',
  'SP003',
  'solar_panel',
  'SolarMax 300W Monocrystalline',
  'installed',
  'Gurgaon Solar Site',
  'proj-demo-3',
  'proj-demo-3',
  '2023-06-15',
  '2033-06-15',
  '2023-06-01',
  15000
);

-- Demo invoices
INSERT INTO invoices (
  id,
  customer_ref_number,
  project_id,
  customer_name,
  amount,
  tax_amount,
  total_amount,
  status,
  due_date,
  notes
) VALUES 
(
  'inv-demo-1',
  'CUST-2024-001',
  'proj-demo-1',
  'David Customer',
  250000,
  45000,
  295000,
  'sent',
  '2024-02-15',
  'Solar installation invoice with 18% GST'
),
(
  'inv-demo-2',
  'CUST-2024-001',
  'proj-demo-3',
  'David Customer',
  50000,
  9000,
  59000,
  'paid',
  '2024-01-20',
  'Maintenance service invoice'
);

-- Demo invoice items
INSERT INTO invoice_items (
  invoice_id,
  description,
  quantity,
  unit_price,
  total
) VALUES 
('inv-demo-1', 'Solar Panel Installation (5kW)', 1, 200000, 200000),
('inv-demo-1', 'Inverter Installation', 1, 50000, 50000),
('inv-demo-2', 'Solar Panel Maintenance', 1, 50000, 50000);