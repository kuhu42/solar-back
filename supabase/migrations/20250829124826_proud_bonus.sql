/*
  # Insert Complete Mock Data

  1. Insert Users
    - Company admin, agents, freelancers, installers, technicians, customers
    - With proper customer reference numbers and roles
  
  2. Insert Projects
    - Multiple projects with customer details and pipeline stages
    - Linked to customers via customer_id and customer_ref_number
  
  3. Insert Tasks
    - Installation, maintenance, and inspection tasks
    - Assigned to appropriate team members
  
  4. Insert Inventory
    - Solar panels, inverters, batteries with serial numbers
    - Various statuses (in_stock, assigned, installed)
  
  5. Insert Leads
    - Potential customers with different statuses
    - Assigned to freelancers and agents
  
  6. Insert Complaints
    - Customer complaints with priorities and assignments
    - Linked to customer reference numbers
  
  7. Insert Invoices and Items
    - Project invoices with line items
    - Various payment statuses
  
  8. Insert Attendance
    - Daily attendance records for field staff
    - Check-in/check-out times and locations
  
  9. Insert Notifications
    - System notifications for different user types
    - Read/unread status tracking
*/

-- Insert Users
INSERT INTO users (id, email, name, role, status, phone, location, avatar, customer_ref_number, education, address, bank_details, payment_status) VALUES
('1', 'admin@greensolar.com', 'John Admin', 'company', 'active', '+91 22 1234 5678', 'Mumbai Head Office', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', NULL, 'MBA Business Administration', 'Andheri East, Mumbai, Maharashtra 400069', 'HDFC Bank, A/c: 12345678901, IFSC: HDFC0001234', 'paid'),
('2', 'agent@greensolar.com', 'Sarah Agent', 'agent', 'active', '+91 98765 43211', 'Mumbai Field Office', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', NULL, 'B.Tech Electrical Engineering', 'Bandra West, Mumbai, Maharashtra 400050', 'ICICI Bank, A/c: 98765432101, IFSC: ICIC0001234', 'paid'),
('3', 'freelancer@greensolar.com', 'Mike Freelancer', 'freelancer', 'active', '+91 87654 32109', 'Bangalore Remote', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', NULL, 'Diploma in Solar Technology', 'Whitefield, Bangalore, Karnataka 560066', 'SBI Bank, A/c: 11223344556, IFSC: SBIN0001234', 'pending'),
('4', 'installer@greensolar.com', 'Tom Installer', 'installer', 'active', '+91 76543 21098', 'Delhi Installation Team', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', NULL, '12th Pass + ITI Electrical', 'Gurgaon, Haryana 122001', 'PNB Bank, A/c: 55667788990, IFSC: PUNB0001234', 'paid'),
('5', 'tech@greensolar.com', 'Lisa Technician', 'technician', 'active', '+91 65432 10987', 'Pune Maintenance Team', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', NULL, 'B.Tech Electronics', 'Koramangala, Pune, Maharashtra 411001', 'Axis Bank, A/c: 99887766554, IFSC: UTIB0001234', 'paid'),
('6', 'customer@example.com', 'David Customer', 'customer', 'active', '+91 98765 43210', 'Bandra West, Mumbai', 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'CUST-2024-001', NULL, '301, Sunrise Apartments, Bandra West, Mumbai, Maharashtra 400050', NULL, NULL),
('7', 'alice@example.com', 'Alice Johnson', 'customer', 'active', '+91 98765 43211', 'Koramangala, Pune', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'CUST-2024-002', NULL, '12/A, Tech Park Road, Koramangala, Pune, Maharashtra 411001', NULL, NULL),
('8', 'techcorp@example.com', 'Tech Corp', 'customer', 'active', '+91 120 456 7890', 'Sector 62, Noida', NULL, 'CUST-2024-003', NULL, 'Tower B, Sector 62, Noida, Uttar Pradesh 201301', NULL, NULL),
('9', 'greenenergy@example.com', 'Green Energy Corp', 'customer', 'active', '+91 80 1234 5678', 'Whitefield, Bangalore', NULL, 'CUST-2024-004', NULL, 'Plot 45, Whitefield Industrial Area, Bangalore, Karnataka 560066', NULL, NULL);

-- Insert Projects
INSERT INTO projects (id, customer_ref_number, title, customer_id, customer_name, customer_details, status, pipeline_stage, installation_approved, type, location, assigned_to, assigned_to_name, serial_numbers, start_date, end_date, value, description, coordinates) VALUES
('proj-1', 'CUST-2024-001', 'Residential Solar Installation - Mumbai Bandra West', '6', 'David Customer', '{"name": "David Customer", "phone": "+91 98765 43210", "serviceNumber": "SRV-2024-001", "email": "david.customer@example.com", "address": "301, Sunrise Apartments, Bandra West, Mumbai, Maharashtra 400050", "moduleType": "Monocrystalline Silicon", "kwCapacity": "5 KW", "houseType": "Apartment", "floors": "3", "remarks": "Customer wants battery backup and net metering. Prefers installation during weekends."}', 'in_progress', 'installation_complete', false, 'solar', 'Bandra West, Mumbai, Maharashtra', '4', 'Tom Installer', ARRAY['SP001', 'SP002', 'INV001'], '2024-01-15', NULL, 250000, '5kW residential solar panel installation with battery backup', '{"lat": 19.0544, "lng": 72.8406}'),
('proj-2', 'CUST-2024-004', 'Commercial Solar Installation - Bangalore Whitefield', '9', 'Green Energy Corp', '{"name": "Green Energy Corp", "phone": "+91 80 1234 5678", "serviceNumber": "SRV-2024-002", "email": "contact@greenenergycorp.com", "address": "Plot 45, Whitefield Industrial Area, Bangalore, Karnataka 560066", "moduleType": "Polycrystalline Silicon", "kwCapacity": "25 KW", "houseType": "Commercial Building", "floors": "4", "remarks": "Large commercial installation. Requires grid tie-in and monitoring system."}', 'approved', 'ready_for_installation', false, 'solar', 'Whitefield, Bangalore, Karnataka', '2', 'Sarah Agent', ARRAY['SP005', 'SP006', 'INV002'], '2024-02-01', NULL, 1500000, '25kW commercial solar installation for office building', '{"lat": 12.9698, "lng": 77.7500}'),
('proj-3', 'CUST-2024-001', 'Solar Panel Maintenance - Delhi NCR Gurgaon', '6', 'David Customer', '{"name": "David Customer", "phone": "+91 98765 43210", "serviceNumber": "SRV-2024-003", "email": "david.customer@example.com", "address": "B-204, Green Valley Society, Sector 29, Gurgaon, Haryana 122001", "moduleType": "Monocrystalline Silicon", "kwCapacity": "3 KW", "houseType": "Independent House", "floors": "2", "remarks": "Regular maintenance required. Customer prefers morning appointments."}', 'completed', 'active', true, 'solar', 'Sector 29, Gurgaon, Haryana', '5', 'Lisa Technician', ARRAY['SP003', 'SP004'], '2024-01-01', '2024-01-10', 50000, 'Routine maintenance and inspection of solar panels', '{"lat": 28.4595, "lng": 77.0266}'),
('proj-4', 'CUST-2024-002', 'Residential Solar - Pune Koramangala', '7', 'Alice Johnson', '{"name": "Alice Johnson", "phone": "+91 98765 43211", "serviceNumber": "SRV-2024-004", "email": "alice.johnson@example.com", "address": "12/A, Tech Park Road, Koramangala, Pune, Maharashtra 411001", "moduleType": "Bifacial Solar Panels", "kwCapacity": "6 KW", "houseType": "Villa", "floors": "2", "remarks": "Customer interested in smart monitoring system and wants installation completed before monsoon."}', 'pending', 'quotation_sent', false, 'solar', 'Koramangala, Pune, Maharashtra', '2', 'Sarah Agent', ARRAY[], '2024-02-15', NULL, 300000, '6kW residential solar system with battery backup', '{"lat": 18.5204, "lng": 73.8567}'),
('proj-5', 'CUST-2024-003', 'Commercial Solar - Noida Sector 62', '8', 'Tech Corp', '{"name": "Tech Corp", "phone": "+91 120 456 7890", "serviceNumber": "SRV-2024-005", "email": "procurement@techcorp.com", "address": "Tower B, Sector 62, Noida, Uttar Pradesh 201301", "moduleType": "High Efficiency Monocrystalline", "kwCapacity": "15 KW", "houseType": "Office Building", "floors": "6", "remarks": "Corporate installation with tax benefits requirement. Needs completion certificate for government subsidies."}', 'pending', 'bank_process', false, 'solar', 'Sector 62, Noida, Uttar Pradesh', '2', 'Sarah Agent', ARRAY[], '2024-03-01', NULL, 850000, '15kW commercial solar installation', '{"lat": 28.6139, "lng": 77.2090}');

-- Insert Tasks
INSERT INTO tasks (id, customer_ref_number, project_id, title, description, assigned_to, assigned_to_name, status, type, due_date, serial_number, photos, notes) VALUES
('task-1', 'CUST-2024-001', 'proj-1', 'Install Solar Panels', 'Mount and connect solar panels on rooftop', '4', 'Tom Installer', 'in_progress', 'installation', '2024-01-20', 'SP001', ARRAY[], 'Weather conditions good for installation'),
('task-2', 'CUST-2024-001', 'proj-1', 'Install Inverter', 'Install and configure solar inverter', '4', 'Tom Installer', 'pending', 'installation', '2024-01-22', 'INV001', ARRAY[], 'Requires electrical inspection after installation'),
('task-3', 'CUST-2024-001', 'proj-3', 'Panel Inspection', 'Inspect solar panels for damage or wear', '5', 'Lisa Technician', 'completed', 'inspection', '2024-01-05', 'SP003', ARRAY['photo1.jpg', 'photo2.jpg'], 'All panels in good condition');

-- Insert Inventory
INSERT INTO inventory (id, serial_number, type, model, status, location, assigned_to, install_date, warranty_expiry) VALUES
('inv-1', 'SP001', 'solar_panel', 'SolarMax 300W', 'assigned', 'Mumbai Warehouse', 'proj-1', NULL, '2034-01-15'),
('inv-2', 'SP002', 'solar_panel', 'SolarMax 300W', 'assigned', 'Mumbai Warehouse', 'proj-1', NULL, '2034-01-15'),
('inv-3', 'INV001', 'inverter', 'PowerInvert 5000', 'assigned', 'Mumbai Warehouse', 'proj-1', NULL, '2029-01-15'),
('inv-4', 'SP005', 'solar_panel', 'SolarMax 400W', 'in_stock', 'Bangalore Warehouse', NULL, NULL, '2034-02-01'),
('inv-5', 'SP003', 'solar_panel', 'SolarMax 300W', 'installed', 'Gurgaon Solar Site', 'proj-3', '2023-06-15', '2033-06-15'),
('inv-6', 'SP004', 'solar_panel', 'SolarMax 300W', 'installed', 'Gurgaon Solar Site', 'proj-3', '2023-06-15', '2033-06-15'),
('inv-7', 'SP006', 'solar_panel', 'SolarMax 400W', 'assigned', 'Bangalore Warehouse', 'proj-2', NULL, '2034-02-01'),
('inv-8', 'INV002', 'inverter', 'PowerInvert 10000', 'assigned', 'Bangalore Warehouse', 'proj-2', NULL, '2029-02-01'),
('inv-9', 'BAT001', 'battery', 'PowerStore 100Ah', 'in_stock', 'Mumbai Warehouse', NULL, NULL, '2029-01-15'),
('inv-10', 'BAT002', 'battery', 'PowerStore 100Ah', 'in_stock', 'Delhi Warehouse', NULL, NULL, '2029-01-15');

-- Insert Leads
INSERT INTO leads (id, customer_name, email, phone, location, type, status, assigned_to, assigned_to_name, estimated_value, notes) VALUES
('lead-1', 'Rajesh Sharma', 'rajesh@example.com', '+91 98765 43296', 'Koramangala, Pune', 'solar', 'new', NULL, NULL, 300000, 'Interested in 6kW residential system'),
('lead-2', 'Priya Patel', 'priya@example.com', '+91 98765 43297', 'Whitefield, Bangalore', 'solar', 'contacted', '3', 'Mike Freelancer', 750000, 'Commercial solar installation inquiry'),
('lead-3', 'Amit Kumar', 'amit@example.com', '+91 98765 43298', 'Sector 62, Noida', 'solar', 'quoted', '2', 'Sarah Agent', 450000, 'Requested quote for 8kW system with battery'),
('lead-4', 'Sunita Reddy', 'sunita@example.com', '+91 98765 43299', 'Banjara Hills, Hyderabad', 'solar', 'new', NULL, NULL, 400000, 'Villa installation with premium panels'),
('lead-5', 'Vikram Singh', 'vikram@example.com', '+91 98765 43300', 'Malviya Nagar, Jaipur', 'wind', 'contacted', '3', 'Mike Freelancer', 800000, 'Wind turbine installation for farmhouse');

-- Insert Complaints
INSERT INTO complaints (id, customer_ref_number, customer_id, customer_name, title, description, status, priority, assigned_to, assigned_to_name, serial_number) VALUES
('comp-1', 'CUST-2024-001', '6', 'David Customer', 'Solar Panel Not Working', 'One of the solar panels stopped generating power after the storm', 'open', 'high', '5', 'Lisa Technician', 'SP003'),
('comp-2', 'CUST-2024-001', '6', 'David Customer', 'Inverter Making Noise', 'The inverter has been making unusual noises for the past week', 'in_progress', 'medium', '5', 'Lisa Technician', 'INV001'),
('comp-3', 'CUST-2024-002', '7', 'Alice Johnson', 'Low Power Generation', 'Solar system generating less power than expected', 'open', 'medium', NULL, NULL, 'SP005'),
('comp-4', 'CUST-2024-004', '9', 'Green Energy Corp', 'Monitoring System Down', 'Online monitoring dashboard not showing data', 'resolved', 'low', '5', 'Lisa Technician', NULL);

-- Insert Invoices
INSERT INTO invoices (id, customer_ref_number, project_id, customer_id, customer_name, amount, status, due_date) VALUES
('inv-1', 'CUST-2024-001', 'proj-1', '6', 'David Customer', 250000, 'sent', '2024-02-15'),
('inv-2', 'CUST-2024-001', 'proj-3', '6', 'David Customer', 50000, 'paid', '2024-01-20'),
('inv-3', 'CUST-2024-004', 'proj-2', '9', 'Green Energy Corp', 1500000, 'draft', '2024-03-01'),
('inv-4', 'CUST-2024-002', 'proj-4', '7', 'Alice Johnson', 300000, 'sent', '2024-03-15');

-- Insert Invoice Items
INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, total) VALUES
('item-1', 'inv-1', 'Solar Panel Installation (5kW)', 1, 200000, 200000),
('item-2', 'inv-1', 'Inverter System', 1, 30000, 30000),
('item-3', 'inv-1', 'Installation & Setup', 1, 20000, 20000),
('item-4', 'inv-2', 'Solar Panel Maintenance', 1, 50000, 50000),
('item-5', 'inv-3', 'Commercial Solar Installation (25kW)', 1, 1200000, 1200000),
('item-6', 'inv-3', 'Commercial Inverter System', 1, 200000, 200000),
('item-7', 'inv-3', 'Professional Installation', 1, 100000, 100000),
('item-8', 'inv-4', 'Residential Solar System (6kW)', 1, 240000, 240000),
('item-9', 'inv-4', 'Battery Backup System', 1, 60000, 60000);

-- Insert Attendance
INSERT INTO attendance (id, user_id, user_name, date, check_in, check_out, location, coordinates) VALUES
('att-1', '2', 'Sarah Agent', '2024-01-15', '08:30:00', '17:00:00', 'Mumbai Field Office', '{"lat": 19.0760, "lng": 72.8777}'),
('att-2', '4', 'Tom Installer', '2024-01-15', '07:45:00', '16:30:00', 'Bandra West, Mumbai', '{"lat": 19.0544, "lng": 72.8406}'),
('att-3', '5', 'Lisa Technician', '2024-01-15', '09:00:00', NULL, 'Gurgaon Solar Site', '{"lat": 28.4595, "lng": 77.0266}'),
('att-4', '2', 'Sarah Agent', '2024-01-16', '08:45:00', '17:15:00', 'Mumbai Field Office', '{"lat": 19.0760, "lng": 72.8777}'),
('att-5', '4', 'Tom Installer', '2024-01-16', '08:00:00', '16:45:00', 'Bandra West, Mumbai', '{"lat": 19.0544, "lng": 72.8406}'),
('att-6', '3', 'Mike Freelancer', '2024-01-16', '10:00:00', '18:00:00', 'Bangalore Remote Office', '{"lat": 12.9716, "lng": 77.5946}');

-- Insert Notifications
INSERT INTO notifications (id, user_id, title, message, type, read) VALUES
('notif-1', '1', 'New User Registration', 'Mike Freelancer has registered and is pending approval', 'info', false),
('notif-2', '4', 'New Task Assigned', 'You have been assigned a new installation task for CUST-2024-001', 'info', false),
('notif-3', '6', 'Project Update', 'Your solar installation project is now in progress', 'success', true),
('notif-4', '2', 'Lead Assignment', 'New lead assigned: Amit Kumar - Sector 62, Noida', 'info', false),
('notif-5', '5', 'Complaint Assigned', 'New complaint from David Customer - Solar Panel Not Working', 'warning', false),
('notif-6', '1', 'Invoice Generated', 'Invoice INV-2024-001 generated for CUST-2024-001', 'success', true),
('notif-7', '9', 'Quotation Ready', 'Your solar installation quotation is ready for review', 'info', false),
('notif-8', '3', 'Payment Received', 'Commission payment processed for lead conversion', 'success', false);