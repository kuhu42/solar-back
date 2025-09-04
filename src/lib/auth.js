import { supabase } from './supabase.js';

export const authService = {
  // Phone-based signup with OTP
  async signUpWithPhone(phone, userData) {
    try {
      // For demo purposes, we'll create a temporary email
      // In production, you'd integrate with SMS service
      const tempEmail = `${phone.replace(/[^0-9]/g, '')}@temp.greensolar.com`;
      const tempPassword = 'temp123456';
      
      const { data, error } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
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
          bank_details: userData.bankDetails || {},
          otp_verified: true // Skip OTP for demo
        });
      }

      return { data, user: data.user };
    } catch (error) {
      console.error('Phone signup error:', error);
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
        location: 'Bandra West, Mumbai'
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
  },

  // OTP verification for phone login
  async verifyOTP(phone, otp) {
    try {
      // In demo mode, accept 123456 as valid OTP
      if (otp === '123456') {
        // Find user by phone
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

  // Regular email/password signin
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
        .select();

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
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
        .select();

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
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

  // Get user profile by phone
  async getUserProfileByPhone(phone) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('phone', phone);

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Get profile by phone error:', error);
      throw error;
    }
  },

  // Send OTP (mock implementation)
  async sendOTP(phone) {
    try {
      // In production, integrate with SMS service
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in database
      const { data, error } = await supabase
        .from('user_sessions')
        .insert([{
          phone,
          otp_code: otp,
          otp_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
        }])
        .select();

      if (error) throw error;
      
      // In demo mode, return OTP for testing
      console.log(`Demo OTP for ${phone}: ${otp}`);
      return { success: true, otp }; // Remove OTP from return in production
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  },

  // Verify OTP and create session
  async verifyOTPAndSignIn(phone, otp) {
    try {
      // Check OTP in database
      const { data: sessions, error: sessionError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('phone', phone)
        .eq('otp_code', otp)
        .gt('otp_expires_at', new Date().toISOString())
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessionError) throw sessionError;
      
      if (!sessions || sessions.length === 0) {
        throw new Error('Invalid or expired OTP');
      }

      // Mark OTP as verified
      await supabase
        .from('user_sessions')
        .update({ verified: true })
        .eq('id', sessions[0].id);

      // Find user profile
      const profile = await this.getUserProfileByPhone(phone);
      if (!profile) {
        throw new Error('User profile not found');
      }

      // Update last login
      await this.updateUserProfile(profile.id, {
        last_login: new Date().toISOString(),
        otp_verified: true
      });

      return { user: profile, verified: true };
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  }
};