/*
  # Seed Mock Data for GreenSolar

  1. Insert mock users (all roles)
  2. Insert mock projects with customer details
  3. Insert mock tasks, attendance, inventory
  4. Insert mock leads, complaints, invoices
  5. Insert mock notifications

  This migration populates the database with realistic test data.
*/

-- Insert mock users
INSERT INTO users (id, email, name, role, status, phone, location, avatar, customer_ref_number, education, address, bank_details, payment_status) VALUES
-- Company Admin
('550e8400-e29b-41d4-a716-446655440001', 'admin@greensolar.com', 'John Admin', 'company', 'active', '+91 22 1234 5678', 'Mumbai Head Office', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', NULL, 'MBA Business Administration', 'Andheri East, Mumbai, Maharashtra 400069', NULL, 'paid'),

-- Agent
('550e8400-e29b-41d4-a716-446655440002', 'agent@greensolar.com', 'Sarah Agent', 'agent', 'active', '+91 98765 43211', 'Mumbai Field Office', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', NULL, 'B.Tech Electrical Engineering', 'Bandra West, Mumbai, Maharashtra 400050', 'HDFC Bank, A/c: 12345678901, IFSC: HDFC0001234', 'paid'),

-- Freelancer
('550e8400-e29b-41d4-a716-446655440003', 'freelancer@greensolar.com', 'Mike Freelancer', 'freelancer', 'active', '+91 98765 43212', 'Bangalore Remote', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', NULL, 'Diploma in Solar Technology', 'Whitefield, Bangalore, Karnataka 560066', 'SBI Bank, A/c: 98765432101, IFSC: SBIN0001234', 'processing'),

-- Installer
('550e8400-e29b-41d4-a716-446655440004', 'installer@greensolar.com', 'Tom Installer', 'installer', 'active', '+91 98765 43213', 'Delhi Installation Team', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', NULL, 'ITI Electrician', 'Gurgaon, Haryana 122001', 'ICICI Bank, A/c: 11223344556, IFSC: ICIC0001234', 'paid'),

-- Technician
('550e8400-e29b-41d4-a716-446655440005', 'tech@greensolar.com', 'Lisa Technician', 'technician', 'active', '+91 98765 43214', 'Pune Maintenance Team', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', NULL, 'B.Sc Electronics', 'Koramangala, Pune, Maharashtra 411001', 'Axis Bank, A/c: 55667788990, IFSC: UTIB0001234', 'pending'),

-- Customers
('550e8400-e29b-41d4-a716-446655440006', 'customer@example.com', 'David Customer', 'customer', 'active', '+91 98765 43210', 'Bandra West, Mumbai', 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'CUST-2024-001', NULL, '301, Sunrise Apartments, Bandra West, Mumbai, Maharashtra 400050', NULL, NULL),

('550e8400-e29b-41d4-a716-446655440007', 'alice@example.com', 'Alice Johnson', 'customer', 'active', '+91 98765 43215', 'Koramangala, Pune', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'CUST-2024-002', NULL, '12/A, Tech Park Road, Koramangala, Pune, Maharashtra 411001', NULL, NULL),

('550e8400-e29b-41d4-a716-446655440008', 'bob@example.com', 'Bob Wilson', 'customer', 'active', '+91 98765 43216', 'Whitefield, Bangalore', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'CUST-2024-003', NULL, 'Plot 45, Whitefield Industrial Area, Bangalore, Karnataka 560066', NULL, NULL);

-- Insert mock projects
INSERT INTO projects (id, customer_ref_number, title, customer_id, customer_name, customer_details, status, pipeline_stage, installation_approved, type, location, assigned_to, assigned_to_name, serial_numbers, start_date, end_date, value, description, coordinates) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'CUST-2024-001', 'Residential Solar Installation - Mumbai Bandra West', '550e8400-e29b-41d4-a716-446655440006', 'David Customer', '{"name": "David Customer", "phone": "+91 98765 43210", "serviceNumber": "SRV-2024-001", "email": "david.customer@example.com", "address": "301, Sunrise Apartments, Bandra West, Mumbai, Maharashtra 400050", "moduleType": "Monocrystalline Silicon", "kwCapacity": "5 KW", "houseType": "Apartment", "floors": "3", "remarks": "Customer wants battery backup and net metering. Prefers installation during weekends."}', 'in_progress', 'installation_complete', false, 'solar', 'Bandra West, Mumbai, Maharashtra', '550e8400-e29b-41d4-a716-446655440004', 'Tom Installer', ARRAY['SP001', 'SP002', 'INV001'], '2024-01-15', NULL, 250000, '5kW residential solar panel installation with battery backup', '{"lat": 19.0544, "lng": 72.8181}'),

('660e8400-e29b-41d4-a716-446655440002', 'CUST-2024-003', 'Commercial Solar Installation - Bangalore Whitefield', '550e8400-e29b-41d4-a716-446655440008', 'Bob Wilson', '{"name": "Bob Wilson", "phone": "+91 80 1234 5678", "serviceNumber": "SRV-2024-002", "email": "bob@example.com", "address": "Plot 45, Whitefield Industrial Area, Bangalore, Karnataka 560066", "moduleType": "Polycrystalline Silicon", "kwCapacity": "25 KW", "houseType": "Commercial Building", "floors": "4", "remarks": "Large commercial installation. Requires grid tie-in and monitoring system."}', 'approved', 'ready_for_installation', false, 'solar', 'Whitefield, Bangalore, Karnataka', '550e8400-e29b-41d4-a716-446655440002', 'Sarah Agent', ARRAY['SP005', 'SP006', 'INV002'], '2024-02-01', NULL, 1500000, '25kW commercial solar installation for office building', '{"lat": 12.9698, "lng": 77.7500}'),

('660e8400-e29b-41d4-a716-446655440003', 'CUST-2024-001', 'Solar Panel Maintenance - Delhi NCR Gurgaon', '550e8400-e29b-41d4-a716-446655440006', 'David Customer', '{"name": "David Customer", "phone": "+91 98765 43210", "serviceNumber": "SRV-2024-003", "email": "david.customer@example.com", "address": "B-204, Green Valley Society, Sector 29, Gurgaon, Haryana 122001", "moduleType": "Monocrystalline Silicon", "kwCapacity": "3 KW", "houseType": "Independent House", "floors": "2", "remarks": "Regular maintenance required. Customer prefers morning appointments."}', 'completed', 'active', true, 'solar', 'Sector 29, Gurgaon, Haryana', '550e8400-e29b-41d4-a716-446655440005', 'Lisa Technician', ARRAY['SP003', 'SP004'], '2024-01-01', '2024-01-10', 50000, 'Routine maintenance and inspection of solar panels', '{"lat": 28.4595, "lng": 77.0266}'),

('660e8400-e29b-41d4-a716-446655440004', 'CUST-2024-002', 'Residential Solar - Pune Koramangala', '550e8400-e29b-41d4-a716-446655440007', 'Alice Johnson', '{"name": "Alice Johnson", "phone": "+91 98765 43211", "serviceNumber": "SRV-2024-004", "email": "alice.johnson@example.com", "address": "12/A, Tech Park Road, Koramangala, Pune, Maharashtra 411001", "moduleType": "Bifacial Solar Panels", "kwCapacity": "6 KW", "houseType": "Villa", "floors": "2", "remarks": "Customer interested in smart monitoring system and wants installation completed before monsoon."}', 'pending', 'quotation_sent', false, 'solar', 'Koramangala, Pune, Maharashtra', '550e8400-e29b-41d4-a716-446655440002', 'Sarah Agent', ARRAY[]::text[], '2024-02-15', NULL, 300000, '6kW residential solar system with battery backup', '{"lat": 18.5204, "lng": 73.8567}');

-- Insert mock tasks
INSERT INTO tasks (id, customer_ref_number, project_id, title, description, assigned_to, assigned_to_name, status, type, due_date, serial_number, photos, notes) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'CUST-2024-001', '660e8400-e29b-41d4-a716-446655440001', 'Install Solar Panels', 'Mount and connect solar panels on rooftop', '550e8400-e29b-41d4-a716-446655440004', 'Tom Installer', 'in_progress', 'installation', '2024-01-20', 'SP001', ARRAY[]::text[], 'Weather conditions good for installation'),

('770e8400-e29b-41d4-a716-446655440002', 'CUST-2024-001', '660e8400-e29b-41d4-a716-446655440001', 'Install Inverter', 'Install and configure solar inverter', '550e8400-e29b-41d4-a716-446655440004', 'Tom Installer', 'pending', 'installation', '2024-01-22', 'INV001', ARRAY[]::text[], 'Requires electrical inspection after installation'),

('770e8400-e29b-41d4-a716-446655440003', 'CUST-2024-001', '660e8400-e29b-41d4-a716-446655440003', 'Panel Inspection', 'Inspect solar panels for damage or wear', '550e8400-e29b-41d4-a716-446655440005', 'Lisa Technician', 'completed', 'inspection', '2024-01-05', 'SP003', ARRAY['photo1.jpg', 'photo2.jpg'], 'All panels in good condition');

-- Insert mock attendance
INSERT INTO attendance (id, user_id, user_name, date, check_in, check_out, location, coordinates) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Sarah Agent', '2024-01-15', '08:30', '17:00', 'Mumbai Field Office', '{"lat": 19.0760, "lng": 72.8777}'),

('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'Tom Installer', '2024-01-15', '07:45', '16:30', 'Bandra West, Mumbai', '{"lat": 19.0544, "lng": 72.8181}'),

('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'Lisa Technician', '2024-01-15', '09:00', NULL, 'Gurgaon Solar Site', '{"lat": 28.4595, "lng": 77.0266}');

-- Insert mock inventory
INSERT INTO inventory (id, serial_number, type, model, status, location, assigned_to, install_date, warranty_expiry) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'SP001', 'solar_panel', 'SolarMax 300W', 'assigned', 'Mumbai Warehouse', 'proj-1', NULL, '2034-01-15'),

('990e8400-e29b-41d4-a716-446655440002', 'SP002', 'solar_panel', 'SolarMax 300W', 'assigned', 'Mumbai Warehouse', 'proj-1', NULL, '2034-01-15'),

('990e8400-e29b-41d4-a716-446655440003', 'INV001', 'inverter', 'PowerInvert 5000', 'assigned', 'Mumbai Warehouse', 'proj-1', NULL, '2029-01-15'),

('990e8400-e29b-41d4-a716-446655440004', 'SP005', 'solar_panel', 'SolarMax 400W', 'in_stock', 'Bangalore Warehouse', NULL, NULL, '2034-02-01'),

('990e8400-e29b-41d4-a716-446655440005', 'SP003', 'solar_panel', 'SolarMax 300W', 'installed', 'Gurgaon Solar Site', 'proj-3', '2023-06-15', '2033-06-15');

-- Insert mock leads
INSERT INTO leads (id, customer_name, email, phone, location, type, status, assigned_to, assigned_to_name, estimated_value, notes) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', 'Carol Davis', 'carol@example.com', '+91 98765 43217', 'Sector 62, Noida', 'solar', 'new', NULL, NULL, 300000, 'Interested in 6kW residential system'),

('aa0e8400-e29b-41d4-a716-446655440002', 'Robert Smith', 'robert@example.com', '+91 98765 43218', 'Whitefield, Bangalore', 'solar', 'contacted', '550e8400-e29b-41d4-a716-446655440003', 'Mike Freelancer', 750000, 'Commercial solar installation inquiry'),

('aa0e8400-e29b-41d4-a716-446655440003', 'Emma Brown', 'emma@example.com', '+91 98765 43219', 'Sector 62, Noida', 'solar', 'quoted', '550e8400-e29b-41d4-a716-446655440002', 'Sarah Agent', 450000, 'Requested quote for 8kW system with battery');

-- Insert mock complaints
INSERT INTO complaints (id, customer_ref_number, customer_id, customer_name, title, description, status, priority, assigned_to, assigned_to_name, serial_number) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', 'CUST-2024-001', '550e8400-e29b-41d4-a716-446655440006', 'David Customer', 'Solar Panel Not Working', 'One of the solar panels stopped generating power after the storm', 'open', 'high', '550e8400-e29b-41d4-a716-446655440005', 'Lisa Technician', 'SP003'),

('bb0e8400-e29b-41d4-a716-446655440002', 'CUST-2024-001', '550e8400-e29b-41d4-a716-446655440006', 'David Customer', 'Inverter Making Noise', 'The inverter has been making unusual noises for the past week', 'in_progress', 'medium', '550e8400-e29b-41d4-a716-446655440005', 'Lisa Technician', 'INV001');

-- Insert mock invoices
INSERT INTO invoices (id, customer_ref_number, project_id, customer_id, customer_name, amount, status, due_date) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', 'CUST-2024-001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', 'David Customer', 250000, 'sent', '2024-02-15'),

('cc0e8400-e29b-41d4-a716-446655440002', 'CUST-2024-001', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', 'David Customer', 50000, 'paid', '2024-01-20');

-- Insert mock invoice items
INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, total) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', 'cc0e8400-e29b-41d4-a716-446655440001', 'Solar Panel Installation', 1, 200000, 200000),
('dd0e8400-e29b-41d4-a716-446655440002', 'cc0e8400-e29b-41d4-a716-446655440001', 'Inverter Installation', 1, 50000, 50000),
('dd0e8400-e29b-41d4-a716-446655440003', 'cc0e8400-e29b-41d4-a716-446655440002', 'Solar Panel Maintenance', 1, 50000, 50000);

-- Insert mock notifications
INSERT INTO notifications (id, user_id, title, message, type, read) VALUES
('ee0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'New User Registration', 'Mike Freelancer has registered and is pending approval', 'info', false),

('ee0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'New Task Assigned', 'You have been assigned a new installation task', 'info', false),

('ee0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', 'Project Update', 'Your solar installation project is now in progress', 'success', true);