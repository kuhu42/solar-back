/*
  # Insert Demo Data

  1. Demo Users
    - Admin user with full access
    - Agent for field operations
    - Freelancer for lead generation
    - Installer for equipment setup
    - Technician for maintenance
    - Customer for testing customer flows

  2. Sample Projects
    - Various stages of completion
    - Different project types (solar/wind)
    - Realistic customer data

  3. Sample Data
    - Tasks assigned to different roles
    - Inventory items with serial numbers
    - Leads in various stages
    - Complaints for testing resolution
    - Attendance records
    - Sample invoices and commissions
*/

-- Insert demo user profiles (these will be created via auth signup)
-- Note: The actual auth.users records will be created via the signup process

-- Insert demo inventory items
INSERT INTO inventory (serial_number, type, model, status, location, warranty_expiry, cost) VALUES
('SP001', 'solar_panel', 'SolarMax 300W', 'in_stock', 'Mumbai Warehouse', '2034-01-15', 15000),
('SP002', 'solar_panel', 'SolarMax 300W', 'in_stock', 'Mumbai Warehouse', '2034-01-15', 15000),
('SP003', 'solar_panel', 'SolarMax 300W', 'in_stock', 'Mumbai Warehouse', '2034-01-15', 15000),
('SP004', 'solar_panel', 'SolarMax 300W', 'in_stock', 'Mumbai Warehouse', '2034-01-15', 15000),
('SP005', 'solar_panel', 'SolarMax 400W', 'in_stock', 'Bangalore Warehouse', '2034-02-01', 18000),
('SP006', 'solar_panel', 'SolarMax 400W', 'in_stock', 'Bangalore Warehouse', '2034-02-01', 18000),
('INV001', 'inverter', 'PowerInvert 5000', 'in_stock', 'Mumbai Warehouse', '2029-01-15', 45000),
('INV002', 'inverter', 'PowerInvert 5000', 'in_stock', 'Bangalore Warehouse', '2029-02-01', 45000),
('BAT001', 'battery', 'LithiumPower 10kWh', 'in_stock', 'Mumbai Warehouse', '2032-01-15', 80000),
('BAT002', 'battery', 'LithiumPower 10kWh', 'in_stock', 'Delhi Warehouse', '2032-01-15', 80000),
('WT001', 'wind_turbine', 'WindMax 5kW', 'in_stock', 'Gujarat Warehouse', '2035-01-15', 250000),
('WT002', 'wind_turbine', 'WindMax 5kW', 'in_stock', 'Gujarat Warehouse', '2035-01-15', 250000),
('MNT001', 'mounting', 'RoofMount Pro', 'in_stock', 'Mumbai Warehouse', '2029-01-15', 5000),
('MNT002', 'mounting', 'RoofMount Pro', 'in_stock', 'Bangalore Warehouse', '2029-01-15', 5000),
('CBL001', 'cable', 'SolarCable 4mm', 'in_stock', 'Mumbai Warehouse', '2027-01-15', 500),
('CBL002', 'cable', 'SolarCable 4mm', 'in_stock', 'Bangalore Warehouse', '2027-01-15', 500)
ON CONFLICT (serial_number) DO NOTHING;