import { supabase, dbService } from './supabase.js';

// Update your auth.js file - specifically the signUp method

export const authService = {
  // Check if authentication service is available
  isAvailable() {
    return supabase && typeof supabase.auth !== 'undefined';
  },

async signUp(email, password, userData) {
  try {
    console.log('📝 Auth Service: signUp called with:', { email, userData });

    // Validate pincode before creating user
    if (userData.pincode && !this.validatePincode(userData.pincode)) {
      throw new Error('Invalid pincode or unsupported location');
    }

    console.log('📍 Pincode validation passed, creating auth user...');

    // Create auth user first
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
          phone: userData.phone,
          pincode: userData.pincode,
          status: userData.status || 'pending',
          requested_role: userData.requestedRole || userData.requested_role,
          ...userData
        }
      }
    });

    if (error) {
      console.error('❌ Auth user creation failed:', error);
      throw error;
    }

    console.log('✅ Auth user created successfully:', data.user?.id);

    // UPDATE the existing user record
    if (data.user) {
      console.log('📝 Updating user profile with complete data...');
      
      try {
        const profile = await dbService.updateUserProfile(data.user.id, {
          name: userData.name,
          phone: userData.phone,
          role: userData.role || 'pending',
          status: userData.status || 'pending',
          pincode: userData.pincode,
          address: userData.address,
          location: userData.pincode ? this.getCityFromPincode(userData.pincode) : null,
          education: userData.education,
          bank_details: userData.bankDetails,
          requested_role: userData.requestedRole || userData.requested_role,
          customer_ref_number: userData.customerRefNumber,
          customer_data: {
            serviceNumber: userData.serviceNumber,
            coordinates: userData.coordinates,
            moduleType: userData.moduleType,
            kwCapacity: userData.kwCapacity,
            houseType: userData.houseType,
            floors: userData.floors,
            remarks: userData.remarks,
          }
        });
        
        console.log('✅ User profile updated successfully:', profile);
        
        // ✅ NEW: Upload documents if they exist
        if (userData.documents && Object.keys(userData.documents).length > 0) {
          console.log('📤 Uploading customer documents...');
          await this.uploadCustomerDocuments(data.user.id, userData.documents, data.user.id);
        }
        
        // Auto-assign to team based on pincode and role if it's a professional
        if (userData.pincode && userData.role !== 'customer' && userData.role !== 'company') {
          try {
            console.log('👥 Attempting team assignment...');
            await this.assignUserToTeam(profile);
            console.log('✅ Team assignment completed');
          } catch (teamError) {
            console.error('⚠️ Team assignment failed (non-critical):', teamError);
          }
        }
        
        return { ...data, profile };
      } catch (profileError) {
        console.error('❌ Error updating user profile:', profileError);
        throw new Error(`Profile update failed: ${profileError.message}`);
      }
    }

    return data;
  } catch (error) {
    console.error('❌ Signup error:', error);
    throw error;
  }
},

// ✅ NEW METHOD: Upload multiple documents for a customer
// ✅ IMPROVED: Upload multiple documents for a customer
async uploadCustomerDocuments(userId, documents, uploadedBy) {
  console.log('📦 Starting batch document upload for user:', userId);
  console.log('📋 Documents to upload:', Object.keys(documents));
  
  const uploadPromises = [];
  const results = [];
  
  // Map of form field names to document types
  const documentTypeMap = {
    customerPhoto: 'customer_photo',
    signPhoto: 'signature',
    aadharPhoto: 'aadhar_card',
    panPhoto: 'pan_card',
    bankBookPhoto: 'bank_passbook'
  };
  
  // Upload documents one by one to better handle errors
  for (const [fieldName, file] of Object.entries(documents)) {
    if (file && file instanceof File) {
      const documentType = documentTypeMap[fieldName] || fieldName;
      console.log(`\n📤 Uploading ${documentType}...`);
      
      try {
        const result = await dbService.uploadCustomerDocument(
          userId, 
          file, 
          documentType, 
          uploadedBy
        );
        results.push({ success: true, type: documentType, result });
        console.log(`✅ ${documentType} uploaded successfully`);
      } catch (error) {
        console.error(`❌ Failed to upload ${documentType}:`, error.message);
        results.push({ success: false, type: documentType, error: error.message });
        // Continue with other uploads even if one fails
      }
    }
  }
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n📊 Upload Summary: ${successful.length} succeeded, ${failed.length} failed`);
  
  if (failed.length > 0) {
    console.warn('⚠️ Some documents failed to upload:', failed);
  }
  
  return {
    successful,
    failed,
    totalAttempted: results.length
  };
},

  // Validate pincode
  validatePincode(pincode) {
    if (!pincode || pincode.length !== 6) return false;
    
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(pincode)) return false;
    
    // Check if pincode belongs to supported cities
    const firstDigit = pincode.charAt(0);
    const supportedPincodes = {
      '1': 'Delhi',      // 110xxx
      '4': 'Mumbai',     // 400xxx, 401xxx
      '5': 'Hyderabad',  // 500xxx
      '6': 'Bangalore'   // 560xxx
    };
    
    return supportedPincodes.hasOwnProperty(firstDigit);
  },

  // Get city from pincode
  getCityFromPincode(pincode) {
    if (!pincode || pincode.length !== 6) return 'Unknown';
    
    const firstDigit = pincode.charAt(0);
    const cityMapping = {
      '1': 'Delhi',
      '4': 'Mumbai', 
      '5': 'Hyderabad',
      '6': 'Bangalore'
    };
    
    return cityMapping[firstDigit] || 'Other';
  },

  // Auto-assign user to team
  async assignUserToTeam(userProfile) {
    try {
      const city = this.getCityFromPincode(userProfile.pincode);
      if (city === 'Unknown' || city === 'Other') return;

      // Import team service
      const { teamGroupingService } = await import('./teamGroupingService.js');
      
      // This will create team if it doesn't exist and assign user
      await teamGroupingService.assignUserToTeam(userProfile.id, {
        city,
        role: userProfile.role === 'middleman' ? userProfile.requestedRole || userProfile.role : userProfile.role,
        pincode: userProfile.pincode
      });
      
      console.log(`✅ User ${userProfile.name} assigned to ${city} team`);
    } catch (error) {
      console.error('Error assigning user to team:', error);
      // Don't throw - team assignment is not critical for registration
    }
  },

  // ... rest of your existing auth methods remain the same
  async signIn(email, password) {
    if (!this.isAvailable()) {
      throw new Error('Authentication service not available');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  },

  async signOut() {
    if (!this.isAvailable()) return;
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    }
  },

  async getSession() {
    if (!this.isAvailable()) return null;
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    if (!this.isAvailable()) return null;
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  onAuthStateChange(callback) {
    if (!this.isAvailable()) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  },

  async updateUserProfile(userId, profileData) {
    return await dbService.updateUserProfile(userId, profileData);
  },

  async getUserProfileById(userId) {
    return await dbService.getUserProfileById(userId);
  }
};