import { supabase, dbService } from './supabase.js';

// Update your auth.js file - specifically the signUp method

export const authService = {
  // Check if authentication service is available
  isAvailable() {
    return supabase && typeof supabase.auth !== 'undefined';
  },

  // Sign up with email and password - FIXED to properly store pincode
// Update your signUp method in auth.js with detailed logging

async signUp(email, password, userData) {
  try {
    console.log('🔍 Auth Service: signUp called with:', { email, userData });

    // Validate pincode before creating user
    if (userData.pincode && !this.validatePincode(userData.pincode)) {
      throw new Error('Invalid pincode or unsupported location');
    }

    console.log('🔍 Pincode validation passed, creating auth user...');

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
          ...userData
        }
      }
    });

    if (error) {
      console.error('🔍 Auth user creation failed:', error);
      throw error;
    }

    console.log('🔍 Auth user created successfully:', data.user?.id);

    // CREATE DATABASE PROFILE WITH ALL DATA INCLUDING PINCODE
    if (data.user) {
      const profileData = {
        id: data.user.id,
        email: data.user.email,
        name: userData.name,
        phone: userData.phone,
        role: userData.role || 'pending',
        status: userData.status || 'pending',
        pincode: userData.pincode, // Critical: Include pincode here
        address: userData.address, // Critical: Include address here
        location: userData.pincode ? this.getCityFromPincode(userData.pincode) : null,
        created_at: new Date().toISOString(),
        // Include all other user data fields
        education: userData.education,
        bankDetails: userData.bankDetails,
        requestedRole: userData.requestedRole,
        serviceNumber: userData.serviceNumber,
        coordinates: userData.coordinates,
        moduleType: userData.moduleType,
        kwCapacity: userData.kwCapacity,
        houseType: userData.houseType,
        floors: userData.floors,
        remarks: userData.remarks,
        customerRefNumber: userData.customerRefNumber
      };

      console.log('🔍 Creating database profile with data:', profileData);

      try {
        const profile = await dbService.createUserProfile(profileData);
        console.log('🔍 User profile created in database:', profile);
        
        // Auto-assign to team based on pincode and role if it's a professional
        if (userData.pincode && userData.role !== 'customer' && userData.role !== 'company') {
          try {
            console.log('🔍 Attempting team assignment...');
            await this.assignUserToTeam(profile);
            console.log('🔍 Team assignment completed');
          } catch (teamError) {
            console.error('🔍 Team assignment failed (non-critical):', teamError);
          }
        }
        
        return { ...data, profile };
      } catch (profileError) {
        console.error('🔍 Error creating user profile:', profileError);
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }
    }

    return data;
  } catch (error) {
    console.error('🔍 Signup error:', error);
    throw error;
  }
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