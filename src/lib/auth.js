import { supabase, dbService } from './supabase.js';
import { mockUsers } from '../data/mockData.js';

export const authService = {
  // Check if Supabase auth is available
  isAvailable() {
    return supabase !== null;
  },

  // Phone-based OTP authentication
  async signUpWithPhone(phone, userData) {
    if (!this.isAvailable()) {
      // Demo mode - return mock OTP
      return { success: true, otp: '123456' };
    }

    try {
      // Send OTP via Supabase
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phone,
        options: {
          shouldCreateUser: true
        }
      });

      if (error) throw error;

      // Store additional user data for profile creation
      const sessionData = {
        phone,
        userData,
        timestamp: Date.now()
      };
      localStorage.setItem('pendingUserData', JSON.stringify(sessionData));

      return { success: true, session: data.session };
    } catch (error) {
      console.error('Phone signup error:', error);
      throw error;
    }
  },

  async verifyOTP(phone, otp) {
    if (!this.isAvailable()) {
      // Demo mode
      if (otp === '123456') {
        return { verified: true };
      }
      throw new Error('Invalid OTP');
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms'
      });

      if (error) throw error;

      return { verified: true, user: data.user, session: data.session };
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  },

  async createUserProfile(userId, profileData) {
    if (!this.isAvailable()) {
      return profileData;
    }

    try {
      const profile = await dbService.createUserProfile({
        id: userId,
        ...profileData
      });

      return profile;
    } catch (error) {
      console.error('Profile creation error:', error);
      throw error;
    }
  },

  // Email/password sign in (for existing users)
  async signIn(email, password) {
    if (!this.isAvailable()) {
      // Demo mode
      const user = mockUsers.find(u => u.email === email);
      if (user && password === 'demo123') {
        return { user };
      }
      throw new Error('Invalid credentials');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  async signOut() {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  async getSession() {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },

  async getUserProfileById(userId) {
    if (!this.isAvailable()) {
      return mockUsers.find(u => u.id === userId);
    }

    try {
      return await dbService.getUserProfileById(userId);
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  },

  onAuthStateChange(callback) {
    if (!this.isAvailable()) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    return supabase.auth.onAuthStateChange(callback);
  },

  // Create demo users in Supabase (for testing)
  async createDemoUsers() {
    if (!this.isAvailable()) {
      throw new Error('Supabase not available');
    }

    const results = [];
    
    for (const user of mockUsers) {
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: 'demo123',
          phone: user.phone,
          email_confirm: true,
          phone_confirm: true
        });

        if (authError) {
          console.error(`Error creating auth user ${user.email}:`, authError);
          results.push({ email: user.email, success: false, error: authError.message });
          continue;
        }

        // Create user profile
        const profileData = {
          id: authData.user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          status: user.status,
          location: user.location,
          avatar_url: user.avatar,
          customer_ref_number: user.customerRefNumber
        };

        const profile = await dbService.createUserProfile(profileData);
        results.push({ email: user.email, success: true, profile });

      } catch (error) {
        console.error(`Error creating demo user ${user.email}:`, error);
        results.push({ email: user.email, success: false, error: error.message });
      }
    }

    return results;
  }
};