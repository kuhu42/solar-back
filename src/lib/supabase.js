import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Allow demo mode to work without Supabase credentials
const hasSupabaseCredentials = supabaseUrl && supabaseAnonKey;

export const supabase = hasSupabaseCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database service functions
export const dbService = {
  // Check if Supabase is available
  isAvailable() {
    return supabase !== null;
  },

  // Users
  async getUserProfiles() {
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createUserProfile(userData) {
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([userData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateUserProfile(id, updates) {
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
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
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
    
    if (error) throw error
    return data && data.length > 0 ? data[0] : null
  },

  async getUserProfileById(id) {
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
    
    if (error) throw error
    return data && data.length > 0 ? data[0] : null
  },

  async getUserProfileByPhone(phone) {
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('phone', phone)
    
    if (error) throw error
    return data && data.length > 0 ? data[0] : null
  },

  // Projects
  async getProjects() {
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createProject(projectData) {
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateProject(id, updates) {
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
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
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createTask(taskData) {
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateTask(id, updates) {
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
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
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createLead(leadData) {
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateLead(id, updates) {
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
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
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createComplaint(complaintData) {
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
    const { data, error } = await supabase
      .from('complaints')
      .insert([complaintData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateComplaint(id, updates) {
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
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
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createAttendance(attendanceData) {
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
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
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
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
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async updateInventory(serialNumber, updates) {
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
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
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
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
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
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
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
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
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
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
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
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
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createNotification(notificationData) {
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async markNotificationRead(id) {
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
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
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
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
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
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
    if (!this.isAvailable()) {
      // In demo mode, just log to console
      console.log('Demo Analytics Event:', eventType, eventData);
      return;
    }
    
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
    if (!this.isAvailable()) {
      console.warn('Supabase not available - real-time subscriptions disabled');
      return { unsubscribe: () => {} };
    }
    
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
    if (!this.isAvailable()) {
      throw new Error('Supabase not configured - use demo mode');
    }
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) throw error;
    return data;
  },

  // Get file URL from storage
  async getFileUrl(bucket, path) {
    if (!this.isAvailable()) {
      // Return a placeholder URL for demo mode
      return `https://via.placeholder.com/400x300?text=Demo+File`;
    }
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

  // OTP Management
  async sendOTP(phone) {
    if (!this.isAvailable()) {
      // Demo mode - return mock OTP
      return { success: true, otp: '123456' };
    }
    
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      const { data, error } = await supabase
        .from('user_sessions')
        .insert([{
          phone,
          otp_code: otp,
          otp_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
        }])
        .select();

      if (error) throw error;
      
      // In production, integrate with SMS service here
      console.log(`OTP for ${phone}: ${otp}`);
      return { success: true, otp }; // Remove OTP from return in production
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  },

  async verifyOTP(phone, otp) {
    if (!this.isAvailable()) {
      // Demo mode - accept 123456
      if (otp === '123456') {
        return { verified: true };
      }
      throw new Error('Invalid OTP');
    }
    
    try {
      const { data: sessions, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('phone', phone)
        .eq('otp_code', otp)
        .gt('otp_expires_at', new Date().toISOString())
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      
      if (!sessions || sessions.length === 0) {
        throw new Error('Invalid or expired OTP');
      }
    return data.publicUrl;
      // Mark OTP as verified
      await supabase
        .from('user_sessions')
        .update({ verified: true })
        .eq('id', sessions[0].id);
  }
      return { verified: true };
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  }
}