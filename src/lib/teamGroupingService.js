// teamGroupingService.js - Simple team grouping based on pincode + role
import { supabase } from './supabase.js';

export const teamGroupingService = {
  
  // Get city name from pincode (basic mapping)
  getCityFromPincode(pincode) {
    if (!pincode || pincode.length !== 6) return 'Unknown';
    
    const firstDigit = pincode.charAt(0);
    const cityMapping = {
      '1': 'Delhi',
      '2': 'Punjab/Haryana', 
      '3': 'Rajasthan',
      '4': 'Maharashtra',
      '5': 'Telangana/AP',
      '6': 'Tamil Nadu',
      '7': 'West Bengal',
      '8': 'Odisha',
      '9': 'Gujarat'
    };
    
    return cityMapping[firstDigit] || 'Other';
  },

  // Group users by pincode and role
  async groupUsersByLocation() {
    try {
      // Get all users with pincode and role
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, phone, role, pincode, status, created_at')
        .not('pincode', 'is', null)
        .order('pincode');

      if (error) throw error;

      // Group users by location + role
      const teams = {};
      
      users.forEach(user => {
        if (!user.pincode || user.role === 'customer') return; // Skip customers
        
        const city = this.getCityFromPincode(user.pincode);
        const teamKey = `${city}_${user.role}`; // ✅ Fixed: Added backticks
        
        if (!teams[teamKey]) {
          teams[teamKey] = {
            id: teamKey,
            name: `${city} ${this.capitalizeRole(user.role)}s`, // ✅ Fixed: Added backticks
            location: city,
            pincode: user.pincode,
            role: user.role,
            members: [],
            totalMembers: 0,
            activeMembers: 0,
            pendingMembers: 0
          };
        }
        
        teams[teamKey].members.push(user);
        teams[teamKey].totalMembers++;
        
        if (user.status === 'active') teams[teamKey].activeMembers++;
        if (user.status === 'pending') teams[teamKey].pendingMembers++;
      });

      return Object.values(teams);
    } catch (error) {
      console.error('Error grouping users by location:', error);
      throw error;
    }
  },

  // Get team for a specific user
  async getUserTeam(userId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, role, pincode')
        .eq('id', userId)
        .single();

      if (error || !user || !user.pincode || user.role === 'customer') {
        return null;
      }

      const city = this.getCityFromPincode(user.pincode);
      
      // Get all users in the same location with same role
      const { data: teammates, error: teammatesError } = await supabase
        .from('users')
        .select('id, name, email, phone, status, created_at')
        .eq('role', user.role)
        .like('pincode', `${user.pincode.charAt(0)}%`) // ✅ Fixed: Added backticks
        .order('created_at');

      if (teammatesError) throw teammatesError;

      return {
        teamName: `${city} ${this.capitalizeRole(user.role)}s`, // ✅ Fixed: Added backticks
        location: city,
        role: user.role,
        members: teammates || [],
        totalMembers: teammates?.length || 0
      };
    } catch (error) {
      console.error('Error getting user team:', error);
      return null;
    }
  },

  // Get teams by role
  async getTeamsByRole(role) {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, phone, pincode, status, created_at')
        .eq('role', role)
        .not('pincode', 'is', null)
        .order('pincode');

      if (error) throw error;

      // Group by location
      const locationGroups = {};
      
      users.forEach(user => {
        const city = this.getCityFromPincode(user.pincode);
        
        if (!locationGroups[city]) {
          locationGroups[city] = {
            teamName: `${city} ${this.capitalizeRole(role)}s`, // ✅ Fixed: Added backticks
            location: city,
            role: role,
            members: [],
            totalMembers: 0,
            activeMembers: 0,
            pendingMembers: 0
          };
        }
        
        locationGroups[city].members.push(user);
        locationGroups[city].totalMembers++;
        
        if (user.status === 'active') locationGroups[city].activeMembers++;
        if (user.status === 'pending') locationGroups[city].pendingMembers++;
      });

      return Object.values(locationGroups);
    } catch (error) {
      console.error('Error getting teams by role:', error);
      throw error;
    }
  },

  // Get users in same location (for team view)
  async getUsersInLocation(pincode, role) {
    try {
      const city = this.getCityFromPincode(pincode);
      const regionPrefix = pincode.charAt(0);
      
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, phone, pincode, status, created_at')
        .eq('role', role)
        .like('pincode', `${regionPrefix}%`) // ✅ Fixed: Added backticks
        .order('created_at');

      if (error) throw error;

      return {
        teamName: `${city} ${this.capitalizeRole(role)}s`, // ✅ Fixed: Added backticks
        location: city,
        role: role,
        members: users || []
      };
    } catch (error) {
      console.error('Error getting users in location:', error);
      throw error;
    }
  },

  // Get team statistics for admin dashboard
  async getTeamStatistics() {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('role, pincode, status')
        .not('pincode', 'is', null)
        .neq('role', 'customer'); // Exclude customers from teams

      if (error) throw error;

      const stats = {
        totalTeams: 0,
        totalMembers: 0,
        byRole: {},
        byLocation: {},
        byStatus: {
          active: 0,
          pending: 0,
          inactive: 0
        }
      };

      const teamKeys = new Set();

      users.forEach(user => {
        const city = this.getCityFromPincode(user.pincode);
        const teamKey = `${city}_${user.role}`; // ✅ Fixed: Added backticks
        
        teamKeys.add(teamKey);
        stats.totalMembers++;
        
        // By role
        if (!stats.byRole[user.role]) stats.byRole[user.role] = 0;
        stats.byRole[user.role]++;
        
        // By location
        if (!stats.byLocation[city]) stats.byLocation[city] = 0;
        stats.byLocation[city]++;
        
        // By status
        if (stats.byStatus[user.status] !== undefined) {
          stats.byStatus[user.status]++;
        }
      });

      stats.totalTeams = teamKeys.size;

      return stats;
    } catch (error) {
      console.error('Error getting team statistics:', error);
      throw error;
    }
  },

  // Helper function
  capitalizeRole(role) {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }
};
