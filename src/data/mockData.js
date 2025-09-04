import { USER_ROLES, USER_STATUS, PROJECT_STATUS, TASK_STATUS, INVENTORY_STATUS, LEAD_STATUS, COMPLAINT_STATUS, INVOICE_STATUS } from '../types/index.js';

export const mockUsers = [
  {
    id: '1',
    email: 'admin@solartech.com',
    email: 'admin@greensolar.com',
    name: 'John Admin',
    role: USER_ROLES.COMPANY,
    status: USER_STATUS.ACTIVE,
    phone: '+1234567890',
    location: 'Head Office',
    location: 'Mumbai Head Office',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    customerRefNumber: null
  },
  {
    id: '2',
    email: 'agent@solartech.com',
    email: 'agent@greensolar.com',
    name: 'Sarah Agent',
    role: USER_ROLES.AGENT,
    status: USER_STATUS.ACTIVE,
    phone: '+1234567891',
    location: 'Mumbai Field Office',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    customerRefNumber: null
  },
  {
    id: '3',
    email: 'freelancer@solartech.com',
    email: 'freelancer@greensolar.com',
    name: 'Mike Freelancer',
    role: 'middleman', // Will be assigned role by admin
    status: USER_STATUS.PENDING,
    phone: '+1234567892',
    location: 'Bangalore Remote',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    customerRefNumber: null
  },
  {
    id: '4',
    email: 'installer@solartech.com',
    email: 'installer@greensolar.com',
    name: 'Tom Installer',
    role: USER_ROLES.INSTALLER,
    status: USER_STATUS.ACTIVE,
    phone: '+1234567893',
    location: 'Delhi Installation Team',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    customerRefNumber: null
  },
  {
    id: '5',
    email: 'tech@solartech.com',
    email: 'tech@greensolar.com',
    name: 'Lisa Technician',
    role: 'middleman', // Will be assigned role by admin
    status: USER_STATUS.PENDING,
    phone: '+1234567894',
    location: 'Pune Maintenance Team',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    customerRefNumber: null
  },
  {
    id: '6',
    email: 'customer@example.com',
    name: 'David Customer',
    role: USER_ROLES.CUSTOMER,
    status: USER_STATUS.ACTIVE,
    phone: '+1234567895',
    location: 'Bandra West, Mumbai',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    customerRefNumber: 'CUST-2024-001'
  }
];

export const mockProjects = [
  {
    id: 'proj-1',
    customerRefNumber: 'CUST-2024-001',
    title: 'Residential Solar Installation - Mumbai Bandra West',
    customerId: '6',
    customerName: 'David Customer',
    customerDetails: {
      name: 'David Customer',
      phone: '+91 98765 43210',
      serviceNumber: 'SRV-2024-001',
      email: 'david.customer@example.com',
      address: '301, Sunrise Apartments, Bandra West, Mumbai, Maharashtra 400050',
      moduleType: 'Monocrystalline Silicon',
      kwCapacity: '5 KW',
      houseType: 'Apartment',
      floors: '3',
      remarks: 'Customer wants battery backup and net metering. Prefers installation during weekends.'
    },
    status: PROJECT_STATUS.IN_PROGRESS,
    pipelineStage: 'installation_complete',
    installationApproved: true,
    type: 'solar',
    location: 'Bandra West, Mumbai, Maharashtra',
    assignedTo: '4',
    assignedToName: 'Tom Installer',
    serialNumbers: ['SP001', 'SP002', 'INV001'],
    startDate: '2024-01-15',
    value: 250000,
    description: '5kW residential solar panel installation with battery backup',
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: 'proj-2',
    customerRefNumber: 'CUST-2024-002',
    title: 'Commercial Solar Installation - Bangalore Whitefield',
    customerId: '7',
    customerName: 'Green Energy Corp',
    customerDetails: {
      name: 'Green Energy Corp',
      phone: '+91 80 1234 5678',
      serviceNumber: 'SRV-2024-002',
      email: 'contact@greenenergycorp.com',
      address: 'Plot 45, Whitefield Industrial Area, Bangalore, Karnataka 560066',
      moduleType: 'Polycrystalline Silicon',
      kwCapacity: '25 KW',
      houseType: 'Commercial Building',
      floors: '4',
      remarks: 'Large commercial installation. Requires grid tie-in and monitoring system.'
    },
    status: PROJECT_STATUS.APPROVED,
    pipelineStage: 'ready_for_installation',
    installationApproved: false,
    type: 'solar',
    location: 'Whitefield, Bangalore, Karnataka',
    assignedTo: '2',
    assignedToName: 'Sarah Agent',
    serialNumbers: ['SP005', 'SP006', 'INV002'],
    startDate: '2024-02-01',
    value: 1500000,
    description: '25kW commercial solar installation for office building',
    coordinates: { lat: 40.7589, lng: -73.9851 }
  },
  {
    id: 'proj-3',
    customerRefNumber: 'CUST-2024-001',
    title: 'Solar Panel Maintenance - Delhi NCR Gurgaon',
    customerId: '6',
    customerName: 'David Customer',
    customerDetails: {
      name: 'David Customer',
      phone: '+91 98765 43210',
      serviceNumber: 'SRV-2024-003',
      email: 'david.customer@example.com',
      address: 'B-204, Green Valley Society, Sector 29, Gurgaon, Haryana 122001',
      moduleType: 'Monocrystalline Silicon',
      kwCapacity: '3 KW',
      houseType: 'Independent House',
      floors: '2',
      remarks: 'Regular maintenance required. Customer prefers morning appointments.'
    },
    status: PROJECT_STATUS.COMPLETED,
    pipelineStage: 'active',
    installationApproved: true,
    type: 'solar',
    location: 'Sector 29, Gurgaon, Haryana',
    assignedTo: '5',
    assignedToName: 'Lisa Technician',
    serialNumbers: ['SP003', 'SP004'],
    startDate: '2024-01-01',
    endDate: '2024-01-10',
    value: 50000,
    description: 'Routine maintenance and inspection of solar panels',
    coordinates: { lat: 40.6892, lng: -74.0445 }
  },
  {
    id: 'proj-4',
    customerRefNumber: 'CUST-2024-003',
    title: 'Residential Solar - Pune Koramangala',
    customerId: '8',
    customerName: 'Alice Johnson',
    customerDetails: {
      name: 'Alice Johnson',
      phone: '+91 98765 43211',
      serviceNumber: 'SRV-2024-004',
      email: 'alice.johnson@example.com',
      address: '12/A, Tech Park Road, Koramangala, Pune, Maharashtra 411001',
      moduleType: 'Bifacial Solar Panels',
      kwCapacity: '6 KW',
      houseType: 'Villa',
      floors: '2',
      remarks: 'Customer interested in smart monitoring system and wants installation completed before monsoon.'
    },
    status: PROJECT_STATUS.PENDING,
    pipelineStage: 'quotation_sent',
    installationApproved: false,
    type: 'solar',
    location: 'Koramangala, Pune, Maharashtra',
    assignedTo: '2',
    assignedToName: 'Sarah Agent',
    serialNumbers: [],
    startDate: '2024-02-15',
    value: 300000,
    description: '6kW residential solar system with battery backup',
    coordinates: { lat: 40.7282, lng: -73.7949 }
  },
  {
    id: 'proj-5',
    customerRefNumber: 'CUST-2024-004',
    title: 'Commercial Solar - Noida Sector 62',
    customerId: '9',
    customerName: 'Tech Corp',
    customerDetails: {
      name: 'Tech Corp',
      phone: '+91 120 456 7890',
      serviceNumber: 'SRV-2024-005',
      email: 'procurement@techcorp.com',
      address: 'Tower B, Sector 62, Noida, Uttar Pradesh 201301',
      moduleType: 'High Efficiency Monocrystalline',
      kwCapacity: '15 KW',
      houseType: 'Office Building',
      floors: '6',
      remarks: 'Corporate installation with tax benefits requirement. Needs completion certificate for government subsidies.'
    },
    status: PROJECT_STATUS.PENDING,
    pipelineStage: 'bank_process',
    installationApproved: false,
    type: 'solar',
    location: 'Sector 62, Noida, Uttar Pradesh',
    assignedTo: '2',
    assignedToName: 'Sarah Agent',
    serialNumbers: [],
    startDate: '2024-03-01',
    value: 850000,
    description: '15kW commercial solar installation',
    coordinates: { lat: 40.7589, lng: -73.9851 }
  }
];

export const mockTasks = [
  {
    id: 'task-1',
    customerRefNumber: 'CUST-2024-001',
    projectId: 'proj-1',
    title: 'Install Solar Panels',
    description: 'Mount and connect solar panels on rooftop',
    assignedTo: '4',
    assignedToName: 'Tom Installer',
    status: TASK_STATUS.IN_PROGRESS,
    type: 'installation',
    dueDate: '2024-01-20',
    serialNumber: 'SP001',
    photos: [],
    notes: 'Weather conditions good for installation'
  },
  {
    id: 'task-2',
    customerRefNumber: 'CUST-2024-001',
    projectId: 'proj-1',
    title: 'Install Inverter',
    description: 'Install and configure solar inverter',
    assignedTo: '4',
    assignedToName: 'Tom Installer',
    status: TASK_STATUS.PENDING,
    type: 'installation',
    dueDate: '2024-01-22',
    serialNumber: 'INV001',
    photos: [],
    notes: 'Requires electrical inspection after installation'
  },
  {
    id: 'task-3',
    customerRefNumber: 'CUST-2024-001',
    projectId: 'proj-3',
    title: 'Panel Inspection',
    description: 'Inspect solar panels for damage or wear',
    assignedTo: '5',
    assignedToName: 'Lisa Technician',
    status: TASK_STATUS.COMPLETED,
    type: 'inspection',
    dueDate: '2024-01-05',
    serialNumber: 'SP003',
    photos: ['photo1.jpg', 'photo2.jpg'],
    notes: 'All panels in good condition'
  }
];

export const mockAttendance = [
  {
    id: 'att-1',
    userId: '2',
    userName: 'Sarah Agent',
    date: '2024-01-15',
    checkIn: '08:30',
    checkOut: '17:00',
    location: 'Mumbai Field Office',
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: 'att-2',
    userId: '4',
    userName: 'Tom Installer',
    date: '2024-01-15',
    checkIn: '07:45',
    checkOut: '16:30',
    location: 'Bandra West, Mumbai',
    coordinates: { lat: 40.7589, lng: -73.9851 }
  },
  {
    id: 'att-3',
    userId: '5',
    userName: 'Lisa Technician',
    date: '2024-01-15',
    checkIn: '09:00',
    location: 'Gurgaon Solar Site',
    coordinates: { lat: 40.6892, lng: -74.0445 }
  }
];

export const mockInventory = [
  {
    id: 'inv-1',
    serialNumber: 'SP001',
    type: 'solar_panel',
    model: 'SolarMax 300W',
    status: INVENTORY_STATUS.ASSIGNED,
    location: 'Mumbai Warehouse',
    assignedTo: 'proj-1',
    warrantyExpiry: '2034-01-15'
  },
  {
    id: 'inv-2',
    serialNumber: 'SP002',
    type: 'solar_panel',
    model: 'SolarMax 300W',
    status: INVENTORY_STATUS.ASSIGNED,
    location: 'Mumbai Warehouse',
    assignedTo: 'proj-1',
    warrantyExpiry: '2034-01-15'
  },
  {
    id: 'inv-3',
    serialNumber: 'INV001',
    type: 'inverter',
    model: 'PowerInvert 5000',
    status: INVENTORY_STATUS.ASSIGNED,
    location: 'Mumbai Warehouse',
    assignedTo: 'proj-1',
    warrantyExpiry: '2029-01-15'
  },
  {
    id: 'inv-4',
    serialNumber: 'SP005',
    type: 'solar_panel',
    model: 'SolarMax 400W',
    status: INVENTORY_STATUS.IN_STOCK,
    location: 'Bangalore Warehouse',
    warrantyExpiry: '2034-02-01'
  },
  {
    id: 'inv-5',
    serialNumber: 'SP003',
    type: 'solar_panel',
    model: 'SolarMax 300W',
    status: INVENTORY_STATUS.INSTALLED,
    location: 'Gurgaon Solar Site',
    assignedTo: 'proj-3',
    installDate: '2023-06-15',
    warrantyExpiry: '2033-06-15'
  }
];

export const mockLeads = [
  {
    id: 'lead-1',
    customerName: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1234567896',
    location: 'Koramangala, Pune',
    type: 'solar',
    status: LEAD_STATUS.NEW,
    estimatedValue: 300000,
    notes: 'Interested in 6kW residential system',
    createdAt: '2024-01-14'
  },
  {
    id: 'lead-2',
    customerName: 'Bob Wilson',
    email: 'bob@example.com',
    phone: '+1234567897',
    location: 'Whitefield, Bangalore',
    type: 'solar',
    status: LEAD_STATUS.CONTACTED,
    assignedTo: '3',
    assignedToName: 'Mike Freelancer',
    estimatedValue: 750000,
    notes: 'Commercial solar installation inquiry',
    createdAt: '2024-01-12'
  },
  {
    id: 'lead-3',
    customerName: 'Carol Davis',
    email: 'carol@example.com',
    phone: '+1234567898',
    location: 'Sector 62, Noida',
    type: 'solar',
    status: LEAD_STATUS.QUOTED,
    assignedTo: '2',
    assignedToName: 'Sarah Agent',
    estimatedValue: 450000,
    notes: 'Requested quote for 8kW system with battery',
    createdAt: '2024-01-10'
  }
];

export const mockComplaints = [
  {
    id: 'comp-1',
    customerRefNumber: 'CUST-2024-001',
    customerId: '6',
    customerName: 'David Customer',
    title: 'Solar Panel Not Working',
    description: 'One of the solar panels stopped generating power after the storm',
    status: COMPLAINT_STATUS.OPEN,
    priority: 'high',
    assignedTo: '5',
    assignedToName: 'Lisa Technician',
    serialNumber: 'SP003',
    createdAt: '2024-01-14'
  },
  {
    id: 'comp-2',
    customerRefNumber: 'CUST-2024-001',
    customerId: '6',
    customerName: 'David Customer',
    title: 'Inverter Making Noise',
    description: 'The inverter has been making unusual noises for the past week',
    status: COMPLAINT_STATUS.IN_PROGRESS,
    priority: 'medium',
    assignedTo: '5',
    assignedToName: 'Lisa Technician',
    serialNumber: 'INV001',
    createdAt: '2024-01-12'
  }
];

export const mockInvoices = [
  {
    id: 'inv-1',
    customerRefNumber: 'CUST-2024-001',
    projectId: 'proj-1',
    customerId: '6',
    customerName: 'David Customer',
    amount: 2500000,
    status: INVOICE_STATUS.SENT,
    dueDate: '2024-02-15',
    createdAt: '2024-01-15',
    items: [
      {
        id: 'item-1',
        description: 'Solar Panel Installation',
        quantity: 1,
        unitPrice: 2000000,
        total: 2000000
      },
      {
        id: 'item-2',
        description: 'Inverter Installation',
        quantity: 1,
        unitPrice: 500000,
        total: 500000
      }
    ]
  },
  {
    id: 'inv-2',
    customerRefNumber: 'CUST-2024-001',
    projectId: 'proj-3',
    customerId: '6',
    customerName: 'David Customer',
    amount: 500000,
    status: INVOICE_STATUS.PAID,
    dueDate: '2024-01-20',
    createdAt: '2024-01-10',
    items: [
      {
        id: 'item-3',
        description: 'Solar Panel Maintenance',
        quantity: 1,
        unitPrice: 500000,
        total: 500000
      }
    ]
  }
];

export const mockNotifications = [
  {
    id: 'notif-1',
    userId: '1',
    title: 'New User Registration',
    message: 'Mike Freelancer has registered and is pending approval',
    type: 'info',
    read: false,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'notif-2',
    userId: '4',
    title: 'New Task Assigned',
    message: 'You have been assigned a new installation task',
    type: 'info',
    read: false,
    createdAt: '2024-01-15T09:15:00Z'
  },
  {
    id: 'notif-3',
    userId: '6',
    title: 'Project Update',
    message: 'Your solar installation project is now in progress',
    type: 'success',
    read: true,
    createdAt: '2024-01-14T16:45:00Z'
  }
];