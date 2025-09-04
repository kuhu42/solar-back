// Demo state manager for offline functionality
import { 
  mockUsers, 
  mockProjects, 
  mockTasks, 
  mockAttendance, 
  mockInventory, 
  mockLeads, 
  mockComplaints, 
  mockInvoices, 
  mockNotifications 
} from '../data/mockData.js';

export class DemoStateManager {
  constructor() {
    this.state = {
      users: [...mockUsers],
      projects: [...mockProjects],
      tasks: [...mockTasks],
      attendance: [...mockAttendance],
      inventory: [...mockInventory],
      leads: [...mockLeads],
      complaints: [...mockComplaints],
      invoices: [...mockInvoices],
      notifications: [...mockNotifications],
      commissions: []
    };
    
    this.listeners = new Map();
  }

  // Subscribe to state changes
  subscribe(table, callback) {
    if (!this.listeners.has(table)) {
      this.listeners.set(table, []);
    }
    this.listeners.get(table).push(callback);
    
    return {
      unsubscribe: () => {
        const callbacks = this.listeners.get(table);
        if (callbacks) {
          const index = callbacks.indexOf(callback);
          if (index > -1) {
            callbacks.splice(index, 1);
          }
        }
      }
    };
  }

  // Notify listeners of changes
  notify(table, eventType, record) {
    const callbacks = this.listeners.get(table);
    if (callbacks) {
      callbacks.forEach(callback => {
        callback({
          eventType,
          new: eventType !== 'DELETE' ? record : null,
          old: eventType === 'DELETE' ? record : null
        });
      });
    }
  }

  // CRUD operations
  async create(table, data) {
    const record = {
      id: `${table}-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.state[table].unshift(record);
    this.notify(table, 'INSERT', record);
    
    return record;
  }

  async update(table, id, updates) {
    const index = this.state[table].findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`Record not found in ${table}`);
    }

    const oldRecord = this.state[table][index];
    const updatedRecord = {
      ...oldRecord,
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.state[table][index] = updatedRecord;
    this.notify(table, 'UPDATE', updatedRecord);
    
    return updatedRecord;
  }

  async delete(table, id) {
    const index = this.state[table].findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`Record not found in ${table}`);
    }

    const deletedRecord = this.state[table][index];
    this.state[table].splice(index, 1);
    this.notify(table, 'DELETE', deletedRecord);
    
    return deletedRecord;
  }

  async findById(table, id) {
    return this.state[table].find(item => item.id === id) || null;
  }

  async findAll(table, filters = {}) {
    let results = [...this.state[table]];
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      results = results.filter(item => item[key] === value);
    });
    
    return results;
  }

  // Simulate async delays for realistic UX
  async simulateDelay(min = 500, max = 1500) {
    const delay = Math.random() * (max - min) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Reset to initial state
  reset() {
    this.state = {
      users: [...mockUsers],
      projects: [...mockProjects],
      tasks: [...mockTasks],
      attendance: [...mockAttendance],
      inventory: [...mockInventory],
      leads: [...mockLeads],
      complaints: [...mockComplaints],
      invoices: [...mockInvoices],
      notifications: [...mockNotifications],
      commissions: []
    };
  }
}

// Singleton instance
export const demoStateManager = new DemoStateManager();

// Demo workflow simulators
export const demoWorkflows = {
  async progressProject(projectId, newStage) {
    await demoStateManager.simulateDelay();
    
    const project = await demoStateManager.findById('projects', projectId);
    if (project) {
      return await demoStateManager.update('projects', projectId, {
        pipeline_stage: newStage,
        updated_at: new Date().toISOString()
      });
    }
  },

  async completeTask(taskId, completionData) {
    await demoStateManager.simulateDelay();
    
    return await demoStateManager.update('tasks', taskId, {
      status: 'completed',
      completion_data: completionData,
      notes: completionData.notes || '',
      photos: completionData.photos || [],
      updated_at: new Date().toISOString()
    });
  },

  async assignTask(taskId, assigneeId, assigneeName) {
    await demoStateManager.simulateDelay();
    
    const updatedTask = await demoStateManager.update('tasks', taskId, {
      assigned_to: assigneeId,
      assigned_to_name: assigneeName,
      status: 'pending'
    });

    // Create notification
    await demoStateManager.create('notifications', {
      user_id: assigneeId,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${updatedTask.title}`,
      type: 'info',
      read: false
    });

    return updatedTask;
  },

  async convertLead(leadId) {
    await demoStateManager.simulateDelay();
    
    const lead = await demoStateManager.findById('leads', leadId);
    if (!lead) return null;

    // Update lead status
    const updatedLead = await demoStateManager.update('leads', leadId, {
      status: 'converted'
    });

    // Create project from lead
    const project = await demoStateManager.create('projects', {
      customer_ref_number: `CUST-${Date.now()}`,
      title: `${lead.type} Installation - ${lead.location}`,
      customer_name: lead.customer_name,
      type: lead.type,
      location: lead.location,
      value: lead.estimated_value,
      status: 'pending',
      pipeline_stage: 'quotation_sent',
      assigned_to: lead.assigned_to,
      assigned_to_name: lead.assigned_to_name
    });

    // Create commission record
    if (lead.assigned_to) {
      await demoStateManager.create('commissions', {
        freelancer_id: lead.assigned_to,
        freelancer_name: lead.assigned_to_name,
        lead_id: leadId,
        project_id: project.id,
        commission_type: 'lead_conversion',
        base_amount: lead.estimated_value,
        commission_rate: 0.1,
        commission_amount: lead.estimated_value * 0.1,
        status: 'pending'
      });
    }

    return { lead: updatedLead, project };
  },

  async resolveComplaint(complaintId, resolutionNotes) {
    await demoStateManager.simulateDelay();
    
    return await demoStateManager.update('complaints', complaintId, {
      status: 'resolved',
      resolution_notes: resolutionNotes,
      resolved_at: new Date().toISOString()
    });
  }
};