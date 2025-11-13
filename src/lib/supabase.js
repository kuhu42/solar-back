
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
  
  // Map userData to actual database column names in 'users' table
  const profileData = {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    phone: userData.phone || null,
    role: userData.role || 'pending',
    status: userData.status || 'pending',
    
    // ✅ These columns exist in users table
    pincode: userData.pincode || null, // This should now work!
    address: userData.address || null,
    location: userData.location || null,
    education: userData.education || null,
    bank_details: userData.bankDetails || null,
    requested_role: userData.requestedRole || userData.requested_role || null,
    customer_ref_number: userData.customerRefNumber || null,
    
    // ✅ Store all customer-specific data in the customer_data JSONB column
    customer_data: {
      serviceNumber: userData.serviceNumber,
      coordinates: userData.coordinates,
      moduleType: userData.moduleType,
      kwCapacity: userData.kwCapacity,
      houseType: userData.houseType,
      floors: userData.floors,
      remarks: userData.remarks,
      // Include any other customer-specific fields here
    },
    
    // Standard timestamps
    created_at: userData.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Remove null/undefined values except for pincode which we want to preserve
  Object.keys(profileData).forEach(key => {
    if (profileData[key] === undefined || profileData[key] === '') {
      // Don't delete pincode or address even if they're empty strings
      if (key !== 'pincode' && key !== 'address') {
        delete profileData[key];
      }
    }
  });

  // Special validation for pincode - ensure it's preserved if valid
  if (userData.pincode && userData.pincode.length === 6) {
    profileData.pincode = userData.pincode;
    console.log('📍 Pincode explicitly preserved:', profileData.pincode);
  }

  // Clean up customer_data object - remove undefined values
  if (profileData.customer_data) {
    Object.keys(profileData.customer_data).forEach(key => {
      if (profileData.customer_data[key] === undefined || profileData.customer_data[key] === '') {
        delete profileData.customer_data[key];
      }
    });
    
    // If customer_data is empty after cleanup, set to null
    if (Object.keys(profileData.customer_data).length === 0) {
      profileData.customer_data = null;
    }
  }

  console.log('📄 Final profile data being inserted into USERS table:', profileData);
  
  const { data, error } = await supabase
    .from('users') // ✅ Explicitly targeting the 'users' table
    .insert([profileData])
    .select()
    .maybeSingle();
  
  if (error) {
    console.error('❌ Profile creation failed:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
  
  console.log('✅ Profile created successfully in users table:', data);
  return data;
},

  // ✅ Update user profile (used for approvals and role changes)
 // In your supabase.js, update the updateUserProfile method:

async updateUserProfile(id, updates) {
  console.log('📝 Updating user profile for ID:', id);
  console.log('📝 Update data:', updates);
  
  // Clean up the updates object
  const cleanUpdates = {};
  
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined && updates[key] !== '') {
      cleanUpdates[key] = updates[key];
    }
  });
  
  // Special handling for pincode - preserve it even if it's an empty string
  if (updates.pincode !== undefined) {
    cleanUpdates.pincode = updates.pincode;
    console.log('📍 Pincode being updated to:', cleanUpdates.pincode);
  }
  
  // Handle customer_data JSONB field
  if (updates.customer_data) {
    const customerData = {};
    Object.keys(updates.customer_data).forEach(key => {
      if (updates.customer_data[key] !== undefined && updates.customer_data[key] !== '') {
        customerData[key] = updates.customer_data[key];
      }
    });
    
    if (Object.keys(customerData).length > 0) {
      cleanUpdates.customer_data = customerData;
    }
  }
  
  // Add updated_at timestamp
  cleanUpdates.updated_at = new Date().toISOString();
  
  console.log('📝 Final update data being sent:', cleanUpdates);
  
  const { data, error } = await supabase
    .from('users')
    .update(cleanUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('❌ Profile update failed:', error);
    throw error;
  }
  
  console.log('✅ Profile updated successfully:', data);
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
// ===== DOCUMENT MANAGEMENT =====
  
  // Get all documents for a customer
  async getCustomerDocuments(customerId) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get customer with their documents
  async getCustomerWithDocs(customerId) {
    try {
      // Get customer info
      const { data: customer, error: customerError } = await supabase
        .from('users')
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (customerError) throw customerError;
      
      // Get customer documents
      const documents = await this.getCustomerDocuments(customerId);
      
      return {
        ...customer,
        documents
      };
    } catch (error) {
      console.error('Error fetching customer with docs:', error);
      throw error;
    }
  },

  // Upload customer document
// Upload customer document - SIMPLIFIED VERSION
async uploadCustomerDocument(customerId, file, documentType, uploadedBy) {
  try {
    console.log('📤 Starting upload:', { customerId, documentType, fileName: file.name });
    
    if (!file || file.size === 0) {
      throw new Error('Invalid file');
    }
    
    // Create unique file path with random ID to avoid conflicts
    const fileExt = file.name.split('.').pop();
    const randomId = Math.random().toString(36).substring(7);
    const timestamp = Date.now();
    const fileName = `${documentType}_${timestamp}_${randomId}.${fileExt}`;
    const filePath = `${customerId}/${fileName}`;
    
    console.log('📁 Upload path:', filePath);
    
    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('customer-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true  // ✅ Allow overwrite
      });
    
    if (uploadError) {
      console.error('❌ Storage upload failed:', uploadError);
      throw uploadError;
    }
    
    console.log('✅ Storage upload success:', uploadData);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('customer-documents')
      .getPublicUrl(filePath);
    
    console.log('🔗 Public URL generated:', publicUrl);
    
    // Insert into database with UPSERT to handle conflicts
    // Insert into database with UPSERT to handle conflicts
const documentRecord = {
  name: file.name,
  type: documentType,
  file_path: filePath,
  file_size: file.size,
  mime_type: file.type || 'application/octet-stream',
  customer_id: customerId,
  uploaded_by: null,  // ✅ CHANGED: Set to null instead of uploadedBy
  is_public: false,
  metadata: {
    original_name: file.name,
    upload_timestamp: new Date().toISOString(),
    document_category: documentType,
    uploaded_during: 'registration',
    uploaded_by_user: uploadedBy  // ✅ Store in metadata instead
  }
};
    
    console.log('💾 Inserting to database:', documentRecord);
    
    // Use upsert with on_conflict to handle duplicates
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .upsert([documentRecord], {
        onConflict: 'id',  // This won't conflict since we're creating new records
        ignoreDuplicates: false
      })
      .select()
      .single();
    
    if (docError) {
      console.error('❌ Database insert failed:', docError);
      console.error('Full error:', JSON.stringify(docError, null, 2));
      
      // Don't delete the file - keep it in storage even if DB insert fails
      // Admin can manually link it later
      
      throw new Error(`Database insert failed: ${docError.message}`);
    }
    
    console.log('✅ Database record created:', docData);
    
    return {
      ...docData,
      public_url: publicUrl
    };
    
  } catch (error) {
    console.error('❌ Complete upload error:', error);
    console.error('Error details:', error.message, error.code, error.details);
    throw error;
  }
},

  // Update/Replace customer document
  async updateCustomerDocument(documentId, file, uploadedBy) {
    try {
      console.log('🔄 Updating document:', documentId);
      
      // Get existing document info
      const { data: existingDoc, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();
      
      if (fetchError) throw fetchError;
      
      console.log('📄 Existing document:', existingDoc);
      
      // Delete old file from storage
      if (existingDoc.file_path) {
        const { error: deleteError } = await supabase.storage
          .from('customer-documents')
          .remove([existingDoc.file_path]);
        
        if (deleteError) {
          console.warn('Warning: Could not delete old file:', deleteError);
        }
      }
      
      // Upload new file
      const fileExt = file.name.split('.').pop();
      const fileName = `${existingDoc.customer_id}_${existingDoc.type}_${Date.now()}.${fileExt}`;
      const filePath = `${existingDoc.customer_id}/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('customer-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      // Get new public URL
      const { data: { publicUrl } } = supabase.storage
        .from('customer-documents')
        .getPublicUrl(filePath);
      
      // Update document record
      const { data: updatedDoc, error: updateError } = await supabase
        .from('documents')
        .update({
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          metadata: {
            ...existingDoc.metadata,
            original_name: file.name,
            last_updated: new Date().toISOString(),
            updated_by: uploadedBy
          }
        })
        .eq('id', documentId)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      console.log('✅ Document updated successfully');
      
      return {
        ...updatedDoc,
        public_url: publicUrl
      };
    } catch (error) {
      console.error('❌ Update error:', error);
      throw error;
    }
  },

  // Delete customer document
  async deleteCustomerDocument(documentId) {
    try {
      // Get document info first
      const { data: doc, error: fetchError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Delete from storage
      if (doc.file_path) {
        const { error: storageError } = await supabase.storage
          .from('customer-documents')
          .remove([doc.file_path]);
        
        if (storageError) {
          console.warn('Warning: Could not delete file from storage:', storageError);
        }
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      if (dbError) throw dbError;
      
      console.log('✅ Document deleted successfully');
    } catch (error) {
      console.error('❌ Delete error:', error);
      throw error;
    }
  },

  // Get document by ID with public URL
  async getDocumentById(documentId) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (error) throw error;
    
    if (data && data.file_path) {
      const { data: { publicUrl } } = supabase.storage
        .from('customer-documents')
        .getPublicUrl(data.file_path);
      
      return {
        ...data,
        public_url: publicUrl
      };
    }
    
    return data;
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
// Replace the updateProjectWithStatusHistory method with this version that has better error handling
async updateProjectWithStatusHistory(id, updates) {
  console.log('🔄 Starting project update:', { id, updates });
  
  try {
    // Get current project first
    const { data: currentProject, error: fetchError } = await supabase
      .from('projects')
      .select('metadata')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('❌ Error fetching current project:', fetchError);
      throw new Error(`Failed to fetch project: ${fetchError.message}`);
    }
    
    console.log('📄 Current project metadata:', currentProject?.metadata);
    
    const currentMetadata = currentProject?.metadata || {};
    const statusHistory = currentMetadata.status_history || [];
    
    // Add new status history entry if stage is being updated
    if (updates.pipeline_stage) {
      const historyEntry = {
        stage: updates.pipeline_stage,
        updated_by: updates.updated_by || 'System',
        updated_at: new Date().toISOString(),
        comment: updates.status_comment || updates.comment || null
      };
      statusHistory.push(historyEntry);
      console.log('📝 Adding status history entry:', historyEntry);
    }
    
    // Clean up the updates object - remove any undefined or invalid fields
    const cleanUpdates = {};
    
    // Only include valid database columns
    const validColumns = [
      'pipeline_stage', 'status', 'title', 'description', 'location', 'value',
      'customer_id', 'customer_name', 'assigned_to', 'assigned_to_name',
      'installer_id', 'installer_name', 'installer_assigned', 'installation_complete',
      'completion_date', 'installer_notes', 'agent_id', 'pincode', 'customer_phone',
      'type', 'start_date', 'end_date', 'installation_approved', 'coordinates',
      'serial_numbers', 'customer_details', 'customer_ref_number'
    ];
    
    validColumns.forEach(column => {
      if (updates[column] !== undefined) {
        cleanUpdates[column] = updates[column];
      }
    });
    
    // Handle metadata separately
    cleanUpdates.metadata = {
      ...currentMetadata,
      ...updates.metadata,
      status_history: statusHistory
    };
    
    // Add timestamp
    cleanUpdates.updated_at = new Date().toISOString();
    
    console.log('🧹 Clean updates being sent:', cleanUpdates);
    
    const { data, error } = await supabase
      .from('projects')
      .update(cleanUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase update error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      throw new Error(`Database update failed: ${error.message}`);
    }
    
    console.log('✅ Project updated successfully:', data);
    return data;
    
  } catch (error) {
    console.error('❌ updateProjectWithStatusHistory failed:', error);
    throw error;
  }
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
