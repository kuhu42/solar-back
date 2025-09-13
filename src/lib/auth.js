

import { supabase, dbService } from './supabase.js';

export const authService = {
  // Check if authentication service is available
  isAvailable() {
    return supabase && typeof supabase.auth !== 'undefined';
  },

  // Sign up with email and password - ✅ FIXED to create database profile
  async signUp(email, password, userData) {
    try {
      // Create auth user first
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
            phone: userData.phone,
            status: userData.status || 'pending',
            ...userData
          }
        }
      });

      if (error) throw error;

      // ✅ CREATE DATABASE PROFILE USING YOUR EXISTING METHOD
      if (data.user) {
        const profileData = {
          id: data.user.id, // Use auth user ID
          email: data.user.email,
          name: userData.name,
          phone: userData.phone,
          role: userData.role || 'pending',
          status: userData.status || 'pending',
          created_at: new Date().toISOString(),
          ...userData
        };

        // Call your existing createUserProfile method
        try {
          const profile = await dbService.createUserProfile(profileData);
          console.log('✅ User profile created in database:', profile);
          return { ...data, profile };
        } catch (profileError) {
          console.error('❌ Error creating user profile:', profileError);
          // Don't throw error here, auth user is already created
        }
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  // Sign in with email and password
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

  // Sign out
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

  // Get current session
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

  // Get current user
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

  // Listen to auth state changes
  onAuthStateChange(callback) {
    if (!this.isAvailable()) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  },

  // Update user profile after registration
  async updateUserProfile(userId, profileData) {
    return await dbService.updateUserProfile(userId, profileData);
  },

  // Get user profile by ID
  async getUserProfileById(userId) {
    return await dbService.getUserProfileById(userId);
  }
};
