import { supabase, dbService } from './supabase.js';

export const authService = {
  // Check if Supabase auth is available
  isAvailable() {
    return supabase !== null;
  },

  // Email/password sign up
  async signUp(email, password, userData) {
    if (!this.isAvailable()) {
      throw new Error('Authentication service not available');
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone
          }
        }
      });

      if (error) throw error;

      // Create user profile if signup successful
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          email,
          name: userData.name,
          phone: userData.phone,
          role: userData.role || 'customer',
          status: userData.role === 'customer' ? 'active' : 'pending'
        });
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  // Email/password sign in
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

  async getCurrentUser() {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  async getUserProfileById(userId) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      return await dbService.getUserProfileById(userId);
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  },

  async createUserProfile(userId, profileData) {
    if (!this.isAvailable()) {
      return profileData;
    }

    try {
      const profile = await dbService.createUserProfile({
        id: userId,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      return profile;
    } catch (error) {
      console.error('Profile creation error:', error);
      throw error;
    }
  },

  async updateUserProfile(userId, updates) {
    if (!this.isAvailable()) {
      return updates;
    }

    try {
      return await dbService.updateUserProfile(userId, {
        ...updates,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },

  onAuthStateChange(callback) {
    if (!this.isAvailable()) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    return supabase.auth.onAuthStateChange(callback);
  },

  // Phone-based OTP authentication
  async sendOTP(phone) {
    if (!this.isAvailable()) {
      throw new Error('Authentication service not available');
    }

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phone
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  },

  async verifyOTP(phone, token) {
    if (!this.isAvailable()) {
      throw new Error('Authentication service not available');
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: token,
        type: 'sms'
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  }
};