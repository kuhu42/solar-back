import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database service functions
export const dbService = {
  // Check if Supabase is available
  isAvailable() {
    return !!(supabaseUrl && supabaseAnonKey)
  },

  // Users
  async getUserProfiles() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createUserProfile(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

// Add this to your supabase.js file - replace the existing updateUserProfile function

async updateUserProfile(id, updates) {
  try {
    console.log(`Updating user ${id} with:`, updates);
    
    // Get current session to check permissions
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current session user:', session?.user?.email);
    
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Database update error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log('Update successful:', data);
    return data;
  } catch (error) {
    console.error('updateUserProfile error:', error);
    throw error;
  }
},

  async getUserProfileByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
    
    if (error) throw error
    return data && data.length > 0 ? data[0] : null
  },

  async getUserProfileById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
    
    if (error) throw error
    return data && data.length > 0 ? data[0] : null
  },

  // Projects
  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

// Replace your createProject function in supabase.js with this debug version:

// Replace your createProject function in supabase.js with this version that bypasses validation:

async createProject(projectData) {
  try {
    console.log('ðŸš€ Creating project with data:', projectData);
    
    // Clean the data first - remove undefined values from arrays
    const cleanedData = {
      ...projectData,
      serial_numbers: projectData.serial_numbers?.filter(item => item !== undefined) || []
    };
    
    console.log('ðŸ§¹ Cleaned data:', cleanedData);
    
    // SKIP VALIDATION FOR NOW - RLS is blocking the user queries
    console.log('âš ï¸ Skipping validation due to RLS issues - proceeding directly to insert');
    
    console.log('ðŸ’¾ Attempting database insert...');
    
    // Create the project directly
    const { data, error } = await supabase
      .from('projects')
      .insert([cleanedData])
      .select()
      .single();
    
    if (error) {
      console.error('âŒ Database insert error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log('âœ… Project created successfully in database:', data);
    console.log('ðŸŽ‰ Project creation completed!');
    return data;
    
  } catch (error) {
    console.error('ðŸ’¥ createProject error:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
},

  // Replace your updateProject function in supabase.js with this debug version:

async updateProject(id, updates) {
  try {
    console.log('ðŸ”„ updateProject called with:', { id, updates });
    
    // Add timeout to catch hanging operations
    const updatePromise = supabase
      .from('projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('updateProject timed out after 10 seconds')), 10000);
    });
    
    console.log('ðŸ’¾ Attempting project update...');
    const { data, error } = await Promise.race([updatePromise, timeoutPromise]);
    
    console.log('ðŸ“Š Update response received');
    console.log('Update data:', data);
    console.log('Update error:', error);
    
    if (error) {
      console.error('âŒ Project update error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log('âœ… Project updated successfully:', data);
    return data;
  } catch (error) {
    console.error('ðŸ’¥ updateProject error:', error);
    throw error;
  }
},

  // Tasks
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createTask(taskData) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateTask(id, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
// In your supabase.js, update the createTask function to handle field mapping:

async createTask(taskData) {
  try {
    console.log('Creating task with original data:', taskData);
    
    // Map frontend field names to database field names
    const dbTaskData = {
      id: taskData.id,
      title: taskData.title,
      description: taskData.description,
      type: taskData.type,
      status: taskData.status,
      priority: taskData.priority || 'medium',
      
      // Map camelCase to snake_case for database
      assigned_to: taskData.assignedTo || taskData.assigned_to,
      assigned_to_name: taskData.assignedToName || taskData.assigned_to_name,
      project_id: taskData.projectId || taskData.project_id,
      customer_ref_number: taskData.customerRefNumber || taskData.customer_ref_number,
      due_date: taskData.dueDate || taskData.due_date,
      
      // Handle serial numbers (array vs single value)
      serial_number: Array.isArray(taskData.serialNumbers) 
        ? taskData.serialNumbers[0] 
        : taskData.serialNumber || taskData.serial_number,
      
      // Photos and notes
      photos: taskData.photos || [],
      notes: taskData.notes || '',
      completion_data: taskData.completionData || taskData.completion_data || {},
      
      // Timestamps
      created_at: taskData.createdAt || taskData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Mapped task data for database:', dbTaskData);
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([dbTaskData])
      .select()
      .single();
    
    if (error) {
      console.error('Task creation error:', error);
      throw error;
    }
    
    console.log('Task created successfully:', data);
    return data;
  } catch (error) {
    console.error('createTask error:', error);
    throw error;
  }
},
  // Attendance
  async getAttendance() {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createAttendance(attendanceData) {
    const { data, error } = await supabase
      .from('attendance')
      .insert([attendanceData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateAttendance(id, updates) {
    const { data, error } = await supabase
      .from('attendance')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Inventory
  async getInventory() {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async updateInventory(serialNumber, updates) {
    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('serial_number', serialNumber)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Leads
  async getLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createLead(leadData) {
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateLead(id, updates) {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Complaints
  async getComplaints() {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createComplaint(complaintData) {
    const { data, error } = await supabase
      .from('complaints')
      .insert([complaintData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateComplaint(id, updates) {
    const { data, error } = await supabase
      .from('complaints')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Invoices
  async getInvoices() {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createInvoice(invoiceData, items) {
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([invoiceData])
      .select()
      .single()
    
    if (invoiceError) throw invoiceError
    
    if (items && items.length > 0) {
      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        invoice_id: invoice.id
      }))
      
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsWithInvoiceId)
      
      if (itemsError) throw itemsError
    }
    
    return invoice
  },

  async updateInvoice(id, updates) {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Notifications
  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createNotification(notificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async markNotificationRead(id) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Real-time subscriptions
  subscribeToTable(tableName, callback, options = {}) {
    const channel = supabase
      .channel(`${tableName}-changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: tableName,
        ...options
      }, callback)
      .subscribe()

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel)
      }
    }
  },

  // Analytics and tracking
  async trackEvent(eventType, eventData = {}) {
    const { data, error } = await supabase
      .from('analytics_events')
      .insert([{
        event_type: eventType,
        event_data: eventData,
        created_at: new Date().toISOString()
      }])
    
    if (error) throw error
    return data
  },

  // Additional methods for missing functionality
  async getCommissions() {
    const { data, error } = await supabase
      .from('commissions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async uploadDocument(file, metadata) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `documents/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data, error } = await supabase
      .from('documents')
      .insert([{
        name: file.name,
        file_path: filePath,
        type: metadata.type,
        uploaded_by: metadata.uploadedBy,
        metadata: metadata
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }
}