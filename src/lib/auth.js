import { supabase } from './supabase.js';

export const authService = {
  // OTP-based signup with phone number
  async signUpWithPhone(phone, userData) {
    try {
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // In demo mode, we'll use email/password for simplicity
      // In production, you'd integrate with SMS service
      const email = `${phone.replace(/[^0-9]/g, '')}@temp.greensolar.com`;
      const password = 'temp123456';
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        phone,
        options: {
          data: {
            phone,
            name: userData.name,
            role: userData.role || 'customer'
          }
        }
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          phone,
          name: userData.name,
          role: userData.role || 'customer',
          status: userData.role === 'customer' ? 'active' : 'pending',
          location: userData.location,
          education: userData.education,
          address: userData.address,
          bank_details: userData.bankDetails ? { details: userData.bankDetails } : {}
        });
      }

      return { data, otp }; // In production, OTP would be sent via SMS
    } catch (error) {
      console.error('Phone signup error:', error);
      throw error;
    }
  },

  // Demo login with predefined credentials
  async signInDemo(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Demo signin error:', error);
      throw error;
    }
  },

  // OTP verification for phone login
  async verifyOTP(phone, otp) {
    try {
      // In demo mode, accept 123456 as valid OTP
      if (otp === '123456') {
        // Find user by phone and sign them in
        const { data: profiles, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('phone', phone)
          .limit(1);

        if (profileError) throw profileError;
        
        if (profiles && profiles.length > 0) {
          const profile = profiles[0];
          
          // Update OTP verification status
          await supabase
            .from('user_profiles')
            .update({ otp_verified: true, last_login: new Date().toISOString() })
            .eq('id', profile.id);

          return { user: profile, verified: true };
        }
      }
      
      throw new Error('Invalid OTP');
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  },

  // Regular email/password signin (for demo accounts)
  async signIn(email, password) {
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

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Create user profile
  async createUserProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          id: userId,
          ...profileData
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create profile error:', error);
      throw error;
    }
  },

  // Update user profile
  async updateUserProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Get user profile by ID
  async getUserProfileById(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId);

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Create demo users with auth accounts
  async createDemoUsers() {
    const demoUsers = [
      {
        email: 'admin@greensolar.com',
        password: 'admin123',
        phone: '+91 98765 00001',
        name: 'John Admin',
        role: 'admin',
        status: 'active',
        location: 'Mumbai Head Office'
      },
      {
        email: 'agent@greensolar.com',
        password: 'agent123',
        phone: '+91 98765 00002',
        name: 'Sarah Agent',
        role: 'agent',
        status: 'active',
        location: 'Mumbai Field Office'
      },
      {
        email: 'freelancer@greensolar.com',
        password: 'freelancer123',
        phone: '+91 98765 00003',
        name: 'Mike Freelancer',
        role: 'freelancer',
        status: 'active',
        location: 'Bangalore Remote'
      },
      {
        email: 'installer@greensolar.com',
        password: 'installer123',
        phone: '+91 98765 00004',
        name: 'Tom Installer',
        role: 'installer',
        status: 'active',
        location: 'Delhi Installation Team'
      },
      {
        email: 'tech@greensolar.com',
        password: 'tech123',
        phone: '+91 98765 00005',
        name: 'Lisa Technician',
        role: 'technician',
        status: 'active',
        location: 'Pune Maintenance Team'
      },
      {
        email: 'customer@example.com',
        password: 'customer123',
        phone: '+91 98765 00006',
        name: 'David Customer',
        role: 'customer',
        status: 'active',
        location: 'Bandra West, Mumbai',
        customerRefNumber: 'CUST-2024-001'
      }
    ];

    const results = [];
    
    for (const user of demoUsers) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              phone: user.phone,
              name: user.name,
              role: user.role
            }
          }
        });

        if (data.user) {
          // Create profile
          await this.createUserProfile(data.user.id, {
            phone: user.phone,
            name: user.name,
            role: user.role,
            status: user.status,
            location: user.location,
            customer_ref_number: user.customerRefNumber,
            otp_verified: true
          });
          
          results.push({ success: true, email: user.email });
        }
      } catch (error) {
        console.log(`Demo user ${user.email} might already exist:`, error.message);
        results.push({ success: false, email: user.email, error: error.message });
      }
    }
    
    return results;
  }
};