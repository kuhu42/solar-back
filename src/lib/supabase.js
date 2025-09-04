import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database service functions
export const dbService = {
  // Users
  async getUserProfiles() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createUserProfile(userData) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([userData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateUserProfile(id, updates) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getUserProfileByEmail(email) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
    
    if (error) throw error
    return data && data.length > 0 ? data[0] : null
  },

  async getUserProfileById(id) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
    
    if (error) throw error
    return data && data.length > 0 ? data[0] : null
  },

  async getUserProfileByPhone(phone) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('phone', phone)
    
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

  async createProject(projectData) {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateProject(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
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
      .upsert([attendanceData], { 
        onConflict: 'user_id,date',
        ignoreDuplicates: false 
      })
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

  async createInventoryItem(inventoryData) {
    const { data, error } = await supabase
      .from('inventory')
      .insert([inventoryData])
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

  async createInvoice(invoiceData, items = []) {
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

  // Commissions
  async getCommissions(freelancerId = null) {
    let query = supabase
      .from('commissions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (freelancerId) {
      query = query.eq('freelancer_id', freelancerId);
    }
    
    const { data, error } = await query;
    if (error) throw error
    return data || []
  },

  // Notifications
  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
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

  // Documents
  async getDocuments(filters = {}) {
    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (filters.projectId) {
      query = query.eq('project_id', filters.projectId);
    }
    if (filters.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    const { data, error } = await query;
    if (error) throw error
    return data || []
  },

  async uploadDocument(file, metadata) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${metadata.type}/${fileName}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert([{
          name: file.name,
          type: metadata.type,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: metadata.uploadedBy,
          project_id: metadata.projectId,
          customer_id: metadata.customerId,
          metadata: metadata.additional || {}
        }])
        .select()
        .single();

      if (docError) throw docError;
      return docData;
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  },

  // Analytics
  async trackEvent(eventType, eventData = {}) {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .insert([{
          user_id: eventData.userId || null,
          event_type: eventType,
          event_data: eventData,
          session_id: eventData.sessionId || null
        }]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Analytics tracking error:', error);
      // Don't throw - analytics shouldn't break the app
    }
  },

  // Real-time subscriptions
  subscribeToTable(table, callback, filters = {}) {
    let subscription = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: table,
          ...filters 
        }, 
        callback
      )
      .subscribe();

    return subscription;
  },

  // File upload to storage
  async uploadFile(bucket, path, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) throw error;
    return data;
  },

  // Get file URL from storage
  async getFileUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }
}