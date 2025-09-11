export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'pending' | 'rejected';
  avatar?: string;
  phone?: string;
  location?: string;
  customerRefNumber?: string; // Only for customers
}

export type UserRole = 'company' | 'agent' | 'freelancer' | 'installer' | 'technician' | 'customer';

export interface Project {
  id: string;
  customerRefNumber: string; // Primary tracking reference
  title: string;
  customerId: string;
  customerName: string;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  type: 'solar' | 'wind';
  location: string;
  assignedTo?: string;
  assignedToName?: string;
  serialNumbers: string[];
  startDate: string;
  endDate?: string;
  value: number;
  description: string;
  coordinates: { lat: number; lng: number };
}

export interface Task {
  id: string;
  customerRefNumber: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  status: 'pending' | 'in_progress' | 'completed';
  type: 'installation' | 'maintenance' | 'inspection';
  dueDate: string;
  serialNumber?: string;
  photos: string[];
  notes: string;
}

export interface Attendance {
  id: string;
  userId: string;
  userName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  location: string;
  coordinates: { lat: number; lng: number };
}

export interface Inventory {
  id: string;
  serialNumber: string;
  type: 'solar_panel' | 'wind_turbine' | 'inverter' | 'battery';
  model: string;
  status: 'in_stock' | 'assigned' | 'installed' | 'maintenance' | 'decommissioned';
  location: string;
  assignedTo?: string;
  installDate?: string;
  warrantyExpiry: string;
}

export interface Lead {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  location: string;
  type: 'solar' | 'wind';
  status: 'new' | 'contacted' | 'quoted' | 'converted' | 'lost';
  assignedTo?: string;
  assignedToName?: string;
  estimatedValue: number;
  notes: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  customerRefNumber: string;
  customerId: string;
  customerName: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedToName?: string;
  serialNumber?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Invoice {
  id: string;
  customerRefNumber: string;
  projectId: string;
  customerId: string;
  customerName: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  tasks: Task[];
  attendance: Attendance[];
  inventory: Inventory[];
  leads: Lead[];
  complaints: Complaint[];
  invoices: Invoice[];
  notifications: Notification[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}