// Demo mode utilities and mock data management

export const DEMO_USERS = {
  ADMIN: {
    id: 'demo-admin',
    email: 'admin@greensolar.com',
    name: 'John Admin',
    role: 'admin',
    status: 'active',
    phone: '+91 98765 00001',
    location: 'Mumbai Head Office',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  AGENT: {
    id: 'demo-agent',
    email: 'agent@greensolar.com',
    name: 'Sarah Agent',
    role: 'agent',
    status: 'active',
    phone: '+91 98765 00002',
    location: 'Mumbai Field Office',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  FREELANCER: {
    id: 'demo-freelancer',
    email: 'freelancer@greensolar.com',
    name: 'Mike Freelancer',
    role: 'freelancer',
    status: 'active',
    phone: '+91 98765 00003',
    location: 'Bangalore Remote',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  INSTALLER: {
    id: 'demo-installer',
    email: 'installer@greensolar.com',
    name: 'Tom Installer',
    role: 'installer',
    status: 'active',
    phone: '+91 98765 00004',
    location: 'Delhi Installation Team',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  TECHNICIAN: {
    id: 'demo-technician',
    email: 'tech@greensolar.com',
    name: 'Lisa Technician',
    role: 'technician',
    status: 'active',
    phone: '+91 98765 00005',
    location: 'Pune Maintenance Team',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  CUSTOMER: {
    id: 'demo-customer',
    email: 'customer@example.com',
    name: 'David Customer',
    role: 'customer',
    status: 'active',
    phone: '+91 98765 00006',
    location: 'Bandra West, Mumbai',
    customerRefNumber: 'CUST-2024-001',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
};

// Demo mode state management
export class DemoStateManager {
  constructor() {
    this.state = this.getInitialState();
    this.listeners = [];
  }

  getInitialState() {
    return {
      users: Object.values(DEMO_USERS),
      projects: this.generateDemoProjects(),
      tasks: this.generateDemoTasks(),
      leads: this.generateDemoLeads(),
      complaints: this.generateDemoComplaints(),
      attendance: this.generateDemoAttendance(),
      inventory: this.generateDemoInventory(),
      invoices: this.generateDemoInvoices(),
      commissions: this.generateDemoCommissions(),
      notifications: this.generateDemoNotifications()
    };
  }

  generateDemoProjects() {
    return [
      {
        id: 'demo-proj-1',
        customerRefNumber: 'CUST-2024-001',
        title: 'Residential Solar Installation - Mumbai Bandra West',
        customerId: 'demo-customer',
        customerName: 'David Customer',
        status: 'in_progress',
        pipelineStage: 'installation_complete',
        type: 'solar',
        location: 'Bandra West, Mumbai',
        assignedTo: 'demo-installer',
        assignedToName: 'Tom Installer',
        serialNumbers: ['SP001', 'SP002', 'INV001'],
        startDate: '2024-01-15',
        value: 250000,
        description: '5kW residential solar panel installation',
        coordinates: { lat: 19.0760, lng: 72.8777 },
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'demo-proj-2',
        customerRefNumber: 'CUST-2024-002',
        title: 'Commercial Solar Installation - Bangalore',
        customerId: 'demo-customer-2',
        customerName: 'Green Energy Corp',
        status: 'approved',
        pipelineStage: 'ready_for_installation',
        type: 'solar',
        location: 'Whitefield, Bangalore',
        assignedTo: 'demo-agent',
        assignedToName: 'Sarah Agent',
        serialNumbers: ['SP005', 'SP006'],
        startDate: '2024-02-01',
        value: 1500000,
        description: '25kW commercial solar installation',
        coordinates: { lat: 12.9716, lng: 77.5946 },
        createdAt: '2024-01-20T14:30:00Z'
      }
    ];
  }

  generateDemoTasks() {
    return [
      {
        id: 'demo-task-1',
        customerRefNumber: 'CUST-2024-001',
        projectId: 'demo-proj-1',
        title: 'Install Solar Panels',
        description: 'Mount and connect solar panels on rooftop',
        assignedTo: 'demo-installer',
        assignedToName: 'Tom Installer',
        status: 'in_progress',
        type: 'installation',
        priority: 'high',
        dueDate: '2024-01-20',
        serialNumber: 'SP001',
        createdAt: '2024-01-15T10:00:00Z'
      }
    ];
  }

  generateDemoLeads() {
    return [
      {
        id: 'demo-lead-1',
        customerName: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '+91 98765 43211',
        location: 'Koramangala, Pune',
        type: 'solar',
        status: 'new',
        estimatedValue: 300000,
        notes: 'Interested in 6kW residential system',
        source: 'website',
        createdAt: '2024-01-14T09:00:00Z'
      }
    ];
  }

  generateDemoComplaints() {
    return [
      {
        id: 'demo-comp-1',
        customerRefNumber: 'CUST-2024-001',
        customerId: 'demo-customer',
        customerName: 'David Customer',
        title: 'Solar Panel Not Working',
        description: 'One panel stopped generating power after storm',
        status: 'open',
        priority: 'high',
        assignedTo: 'demo-technician',
        assignedToName: 'Lisa Technician',
        serialNumber: 'SP003',
        createdAt: '2024-01-14T16:30:00Z'
      }
    ];
  }

  generateDemoAttendance() {
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: 'demo-att-1',
        userId: 'demo-agent',
        userName: 'Sarah Agent',
        date: today,
        checkIn: '08:30',
        checkOut: null,
        location: 'Mumbai Field Office',
        coordinates: { lat: 19.0760, lng: 72.8777 },
        createdAt: new Date().toISOString()
      }
    ];
  }

  generateDemoInventory() {
    return [
      {
        id: 'demo-inv-1',
        serialNumber: 'SP001',
        type: 'solar_panel',
        model: 'SolarMax 300W',
        status: 'assigned',
        location: 'Mumbai Warehouse',
        assignedTo: 'demo-proj-1',
        warrantyExpiry: '2034-01-15',
        cost: 15000,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ];
  }

  generateDemoInvoices() {
    return [
      {
        id: 'demo-inv-1',
        customerRefNumber: 'CUST-2024-001',
        projectId: 'demo-proj-1',
        customerId: 'demo-customer',
        customerName: 'David Customer',
        invoiceNumber: 'INV-202401-0001',
        amount: 250000,
        taxAmount: 45000,
        totalAmount: 295000,
        status: 'sent',
        dueDate: '2024-02-15',
        createdAt: '2024-01-15T12:00:00Z',
        items: [
          {
            id: 'demo-item-1',
            description: 'Solar Panel Installation',
            quantity: 1,
            unitPrice: 200000,
            total: 200000
          },
          {
            id: 'demo-item-2',
            description: 'Inverter Installation',
            quantity: 1,
            unitPrice: 50000,
            total: 50000
          }
        ]
      }
    ];
  }

  generateDemoCommissions() {
    return [
      {
        id: 'demo-comm-1',
        freelancerId: 'demo-freelancer',
        freelancerName: 'Mike Freelancer',
        leadId: 'demo-lead-1',
        commissionType: 'lead_conversion',
        baseAmount: 300000,
        commissionRate: 0.10,
        commissionAmount: 30000,
        status: 'approved',
        createdAt: '2024-01-14T18:00:00Z'
      }
    ];
  }

  generateDemoNotifications() {
    return [
      {
        id: 'demo-notif-1',
        userId: 'demo-admin',
        title: 'New User Registration',
        message: 'Mike Freelancer has registered and is pending approval',
        type: 'info',
        read: false,
        createdAt: '2024-01-15T10:30:00Z'
      }
    ];
  }

  // State management methods
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  updateState(updates) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  // CRUD operations for demo mode
  addItem(table, item) {
    const items = [...this.state[table], item];
    this.updateState({ [table]: items });
  }

  updateItem(table, id, updates) {
    const items = this.state[table].map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    this.updateState({ [table]: items });
  }

  deleteItem(table, id) {
    const items = this.state[table].filter(item => item.id !== id);
    this.updateState({ [table]: items });
  }

  getItems(table, filters = {}) {
    let items = this.state[table] || [];
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        items = items.filter(item => item[key] === value);
      }
    });
    
    return items;
  }
}

// Global demo state manager instance
export const demoStateManager = new DemoStateManager();

// Mock OCR service for demo
export const mockOCRService = {
  async extractSerialNumber(imageFile) {
    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock serial numbers
    const mockSerials = [
      'GKA96M560H20200902RX025',
      'GKA96M560H20200902RX026',
      'SP001-2024-001',
      'INV-5000-2024-001',
      'BAT-LITHIUM-2024-001'
    ];
    
    return mockSerials[Math.floor(Math.random() * mockSerials.length)];
  },

  async extractTextFromImage(imageFile) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      text: 'Sample extracted text from image',
      confidence: 0.95,
      boundingBoxes: []
    };
  }
};

// Mock GPS service for demo
export const mockGPSService = {
  async getCurrentLocation() {
    // Simulate GPS delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock Indian locations
    const mockLocations = [
      { lat: 19.0760, lng: 72.8777, address: 'Bandra West, Mumbai' },
      { lat: 12.9716, lng: 77.5946, address: 'Whitefield, Bangalore' },
      { lat: 28.4595, lng: 77.0266, address: 'Gurgaon, Haryana' },
      { lat: 18.5204, lng: 73.8567, address: 'Pune, Maharashtra' },
      { lat: 28.6139, lng: 77.2090, address: 'New Delhi' }
    ];
    
    return mockLocations[Math.floor(Math.random() * mockLocations.length)];
  },

  async trackLocation(userId) {
    const location = await this.getCurrentLocation();
    return {
      userId,
      ...location,
      timestamp: new Date().toISOString(),
      accuracy: 10 // meters
    };
  }
};

// Mock WhatsApp service for demo
export const mockWhatsAppService = {
  async sendMessage(phone, message, attachments = []) {
    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Mock WhatsApp Message Sent:', {
      to: phone,
      message,
      attachments: attachments.length
    });
    
    return {
      messageId: `wa-${Date.now()}`,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  },

  async sendQuotation(phone, quotationData) {
    const message = `🌞 *GreenSolar Quotation*

Dear ${quotationData.customerName},

Thank you for your interest in our solar solutions!

💰 *Quotation Amount:* ₹${quotationData.amount?.toLocaleString()}
📋 *Project Details:* ${quotationData.projectType || 'Solar Installation'}
⚡ *System Capacity:* ${quotationData.capacity || '5kW'}
📅 *Installation Timeline:* 7-10 days

✅ *What's Included:*
• High-efficiency solar panels
• Premium inverter system
• Professional installation
• 10-year warranty
• Free maintenance (1st year)

📞 Contact us to proceed or ask questions!

Best regards,
GreenSolar Team`;

    return this.sendMessage(phone, message);
  },

  async sendInvoice(phone, invoiceData) {
    const message = `🧾 *GreenSolar Invoice*

Dear ${invoiceData.customerName},

Your project has been completed successfully! 🎉

💰 *Invoice Amount:* ₹${invoiceData.amount?.toLocaleString()}
📋 *Project:* ${invoiceData.projectTitle}
📅 *Completion Date:* ${new Date().toLocaleDateString()}

💳 *Payment Options:*
• Bank Transfer
• Online Payment
• UPI/Digital Payment

Thank you for choosing GreenSolar! ⚡

Best regards,
GreenSolar Team`;

    return this.sendMessage(phone, message, ['invoice.pdf']);
  }
};

// Demo mode workflow simulators
export const demoWorkflows = {
  // Simulate project pipeline progression
  async progressProject(projectId, nextStage) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    demoStateManager.updateItem('projects', projectId, {
      pipelineStage: nextStage,
      updatedAt: new Date().toISOString()
    });
    
    return { success: true, stage: nextStage };
  },

  // Simulate task completion
  async completeTask(taskId, completionData) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    demoStateManager.updateItem('tasks', taskId, {
      status: 'completed',
      completionData,
      updatedAt: new Date().toISOString()
    });
    
    return { success: true, completedAt: new Date().toISOString() };
  },

  // Simulate lead conversion
  async convertLead(leadId, projectData) {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Update lead status
    demoStateManager.updateItem('leads', leadId, {
      status: 'converted',
      updatedAt: new Date().toISOString()
    });
    
    // Create new project
    const newProject = {
      id: `demo-proj-${Date.now()}`,
      ...projectData,
      createdAt: new Date().toISOString()
    };
    
    demoStateManager.addItem('projects', newProject);
    
    return { success: true, project: newProject };
  },

  // Simulate complaint resolution
  async resolveComplaint(complaintId, resolutionData) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    demoStateManager.updateItem('complaints', complaintId, {
      status: 'resolved',
      resolutionNotes: resolutionData.notes,
      resolvedAt: new Date().toISOString()
    });
    
    return { success: true, resolvedAt: new Date().toISOString() };
  }
};