
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
window.supabase = supabase;

// Database service functions
export const dbService = {
  // ✅ Service availability check
  isAvailable() {
    return supabaseUrl && supabaseAnonKey && supabaseUrl !== 'placeholder';
  },

  // ===== USER MANAGEMENT =====
  
  // Get all user profiles
  async getUserProfiles() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

   async trackEvent(eventType, eventData = {}) {
    try {
      // For now, just log it - you can implement actual tracking later
      console.log('📊 Event tracked:', eventType, eventData);
      return { success: true };
    } catch (error) {
      console.error('Error tracking event:', error);
      return { success: false };
    }
  },

  // ✅ Create user profile (called during signup)
  // async createUserProfile(userData) {
  //   const { data, error } = await supabase
  //     .from('users')
  //     .insert([userData])
  //     .select()
  //     .maybeSingle(); // single();
    
  //   if (error) throw error;
  //   return data;
  // },

// Update your createUserProfile method in supabase.js

// Fix createUserProfile with better error handling and pincode support
// Update your createUserProfile method in supabase.js

async createUserProfile(userData) {
  console.log('📄 Creating profile with data:', userData);
  
  // Ensure all fields are properly mapped and not undefined
  const profileData = {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    phone: userData.phone || null,
    role: userData.role || 'pending',
    status: userData.status || 'pending',
    pincode: userData.pincode || null, // ✅ Critical: Ensure pincode is included
    address: userData.address || null, // ✅ Critical: Ensure address is included
    location: userData.location || null,
    education: userData.education || null,
    bank_details: userData.bankDetails || null,
    requested_role: userData.requestedRole || null,
    // Customer-specific fields
    customer_ref_number: userData.customerRefNumber || null,
    // Add any other fields that should be stored
    created_at: userData.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Remove any undefined values to avoid database errors
  Object.keys(profileData).forEach(key => {
    if (profileData[key] === undefined) {
      delete profileData[key];
    }
  });

  console.log('📄 Final profile data being inserted:', profileData);
  
  const { data, error } = await supabase
    .from('users')
    .insert([profileData])
    .select()
    .maybeSingle();
  
  if (error) {
    console.error('❌ Profile creation failed:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
  
  console.log('✅ Profile created successfully:', data);
  return data;
},

  // ✅ Update user profile (used for approvals and role changes)
  async updateUserProfile(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get user profile by email
  async getUserProfileByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);
    
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  },

  // ✅ Get user profile by ID (used in login flow)
  async getUserProfileById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get pending users for admin approval
  async getPendingUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // ===== PROJECT MANAGEMENT =====
  
  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createProject(projectData) {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProject(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ===== TASK MANAGEMENT =====
  
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createTask(taskData) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateTask(id, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ===== ATTENDANCE MANAGEMENT =====
  
  async getAttendance() {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createAttendance(attendanceData) {
    const { data, error } = await supabase
      .from('attendance')
      .insert([attendanceData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateAttendance(id, updates) {
    const { data, error } = await supabase
      .from('attendance')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ===== INVENTORY MANAGEMENT =====
  
  async getInventory() {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createInventoryItem(itemData) {
    const { data, error } = await supabase
      .from('inventory')
      .insert([itemData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateInventory(serialNumber, updates) {
    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('serial_number', serialNumber)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateInventoryById(id, updates) {
    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ===== LEADS MANAGEMENT =====
  
  async getLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createLead(leadData) {
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateLead(id, updates) {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ===== COMPLAINTS MANAGEMENT =====
  
  async getComplaints() {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createComplaint(complaintData) {
    const { data, error } = await supabase
      .from('complaints')
      .insert([complaintData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateComplaint(id, updates) {
    const { data, error } = await supabase
      .from('complaints')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ===== INVOICE MANAGEMENT =====
  
  async getInvoices() {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createInvoice(invoiceData, items) {
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([invoiceData])
      .select()
      .single();
    
    if (invoiceError) throw invoiceError;
    
    if (items && items.length > 0) {
      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        invoice_id: invoice.id
      }));
      
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsWithInvoiceId);
      
      if (itemsError) throw itemsError;
    }
    
    return invoice;
  },

  async updateInvoice(id, updates) {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ===== NOTIFICATIONS =====
  
  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createNotification(notificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async markNotificationRead(id) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ===== COMMISSIONS =====
  
  async getCommissions() {
    const { data, error } = await supabase
      .from('commissions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createCommission(commissionData) {
    const { data, error } = await supabase
      .from('commissions')
      .insert([commissionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCommission(id, updates) {
    const { data, error } = await supabase
      .from('commissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ===== REAL-TIME SUBSCRIPTIONS =====
  
  // Subscribe to table changes
  subscribeToTable(tableName, callback, options = {}) {
    if (!this.isAvailable()) return null;
    
    const subscription = supabase
      .channel(`${tableName}_changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: tableName,
        ...options
      }, callback)
      .subscribe();
    
    return {
      unsubscribe: () => {
        subscription.unsubscribe();
      }
    };
  },

  // Subscribe to user status changes (for pending approvals)
  subscribeToUserChanges(callback) {
    return this.subscribeToTable('users', callback, {
      filter: 'status=eq.pending'
    });
  },

  // ===== UTILITY METHODS =====
  
  // Batch operations
  async batchInsert(tableName, data) {
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(data)
      .select();
    
    if (error) throw error;
    return result;
  },

  async batchUpdate(tableName, updates, filter) {
    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
      .match(filter)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Search functionality
  async searchUsers(query) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async searchProjects(query) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // ===== FILE STORAGE =====
  
  async uploadFile(bucket, path, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) throw error;
    return data;
  },

  async deleteFile(bucket, paths) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(paths);
    
    if (error) throw error;
    return data;
  },

  getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  // ===== ANALYTICS & REPORTING =====
  
  async getProjectStats() {
    const { data, error } = await supabase
      .from('projects')
      .select('status, value, created_at');
    
    if (error) throw error;
    return data || [];
  },

  async getUserStats() {
    const { data, error } = await supabase
      .from('users')
      .select('role, status, created_at');
    
    if (error) throw error;
    return data || [];
  },

  async getInventoryStats() {
    const { data, error } = await supabase
      .from('inventory')
      .select('status, cost, category, created_at');
    
    if (error) throw error;
    return data || [];
  }
};
