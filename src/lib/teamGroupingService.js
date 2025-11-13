// teamGroupingService.js - Enhanced team grouping based on pincode + role
import { supabase } from './supabase.js';

export const teamGroupingService = {
  
  // UPDATED: Get city name from pincode (focused on 4 main cities)
  getCityFromPincode(pincode) {
    if (!pincode || pincode.length !== 6) return 'Unknown';
    
    const firstThree = pincode.substring(0, 3);
    const firstDigit = pincode.charAt(0);
    
    // Specific mapping for main cities
    const cityMapping = {
      '110': 'Delhi',    // Delhi NCR
      '400': 'Mumbai',   // Mumbai
      '401': 'Mumbai',   // Navi Mumbai
      '500': 'Hyderabad', // Hyderabad
      '560': 'Bangalore'  // Bangalore
    };
    
    // Check specific 3-digit codes first
    if (cityMapping[firstThree]) {
      return cityMapping[firstThree];
    }
    
    // Fallback to first digit mapping
    const generalMapping = {
      '1': 'Delhi',
      '4': 'Mumbai', 
      '5': 'Hyderabad',
      '6': 'Bangalore'
    };
    
    return generalMapping[firstDigit] || 'Other';
  },

  // NEW: Assign user to team (called during registration)
  async assignUserToTeam(userId, teamData) {
    try {
      const { city, role, pincode } = teamData;
      
      // Skip customers and company users
      if (role === 'customer' || role === 'company') return;
      
      // Find or create team
      const team = await this.findOrCreateTeam(city, role, pincode);
      
      // Check if user is already in a team
      const { data: existingMembership } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!existingMembership && team) {
        // Add user to team
        const { error } = await supabase
          .from('team_members')
          .insert([{
            team_id: team.id,
            user_id: userId
          }]);
        
        if (error) throw error;
        
        console.log(`✅ User assigned to team: ${team.name}`);
      }
      
      return team;
    } catch (error) {
      console.error('Error assigning user to team:', error);
      throw error;
    }
  },

  // NEW: Find or create team for city + role combination
  async findOrCreateTeam(city, role, pincode) {
    try {
      const teamName = `${city} ${this.capitalizeRole(role)}s`;
      
      // Try to find existing team
      const { data: existingTeam } = await supabase
        .from('teams')
        .select('*')
        .eq('location', city)
        .eq('role', role)
        .single();
      
      if (existingTeam) {
        return existingTeam;
      }
      
      // Create new team
      const { data: newTeam, error } = await supabase
        .from('teams')
        .insert([{
          name: teamName,
          location: city,
          role: role,
          pincode: pincode.substring(0, 3) // Store first 3 digits as region identifier
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      console.log(`✅ Created new team: ${teamName}`);
      return newTeam;
      
    } catch (error) {
      console.error('Error finding/creating team:', error);
      throw error;
    }
  },

  // Group users by pincode and role
  async groupUsersByLocation() {
    try {
      // Get all users with pincode and role (exclude customers)
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, phone, role, pincode, status, created_at')
        .not('pincode', 'is', null)
        .neq('role', 'customer')
        .neq('role', 'company')
        .order('pincode');

      if (error) throw error;

      // Group users by location + role
      const teams = {};
      
      users.forEach(user => {
        if (!user.pincode) return;
        
        const city = this.getCityFromPincode(user.pincode);
        if (city === 'Unknown' || city === 'Other') return; // Skip unsupported locations
        
        const teamKey = `${city}_${user.role}`;
        
        if (!teams[teamKey]) {
          teams[teamKey] = {
            id: teamKey,
            name: `${city} ${this.capitalizeRole(user.role)}s`,
            location: city,
            pincode: user.pincode.substring(0, 3),
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

      if (error || !user || !user.pincode || user.role === 'customer' || user.role === 'company') {
        return null;
      }

      const city = this.getCityFromPincode(user.pincode);
      if (city === 'Unknown' || city === 'Other') return null;
      
      // Get all users in the same location with same role
      const { data: teammates, error: teammatesError } = await supabase
        .from('users')
        .select('id, name, email, phone, status, created_at, pincode')
        .eq('role', user.role)
        .not('pincode', 'is', null)
        .order('created_at');

      if (teammatesError) throw teammatesError;

      // Filter teammates by city (since pincode can vary within city)
      const cityTeammates = teammates.filter(teammate => 
        this.getCityFromPincode(teammate.pincode) === city
      );

      return {
        teamName: `${city} ${this.capitalizeRole(user.role)}s`,
        location: city,
        role: user.role,
        members: cityTeammates || [],
        totalMembers: cityTeammates?.length || 0
      };
    } catch (error) {
      console.error('Error getting user team:', error);
      return null;
    }
  },

  // Get teams by role (UPDATED to only show supported cities)
  async getTeamsByRole(role) {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, phone, pincode, status, created_at')
        .eq('role', role)
        .not('pincode', 'is', null)
        .order('pincode');

      if (error) throw error;

      // Group by location (only supported cities)
      const locationGroups = {};
      
      users.forEach(user => {
        const city = this.getCityFromPincode(user.pincode);
        
        // Only include supported cities
        if (!['Delhi', 'Mumbai', 'Hyderabad', 'Bangalore'].includes(city)) return;
        
        if (!locationGroups[city]) {
          locationGroups[city] = {
            teamName: `${city} ${this.capitalizeRole(role)}s`,
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

  // Get users in same location
  async getUsersInLocation(pincode, role) {
    try {
      const city = this.getCityFromPincode(pincode);
      if (!['Delhi', 'Mumbai', 'Hyderabad', 'Bangalore'].includes(city)) {
        return { teamName: 'Unsupported Location', location: city, role: role, members: [] };
      }
      
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, phone, pincode, status, created_at')
        .eq('role', role)
        .not('pincode', 'is', null)
        .order('created_at');

      if (error) throw error;

      // Filter users by city
      const cityUsers = users.filter(user => 
        this.getCityFromPincode(user.pincode) === city
      );

      return {
        teamName: `${city} ${this.capitalizeRole(role)}s`,
        location: city,
        role: role,
        members: cityUsers || []
      };
    } catch (error) {
      console.error('Error getting users in location:', error);
      throw error;
    }
  },

  // Get team statistics for admin dashboard (UPDATED)
  async getTeamStatistics() {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('role, pincode, status')
        .not('pincode', 'is', null)
        .neq('role', 'customer')
        .neq('role', 'company');

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
        },
        supportedCities: ['Delhi', 'Mumbai', 'Hyderabad', 'Bangalore']
      };

      const teamKeys = new Set();

      users.forEach(user => {
        const city = this.getCityFromPincode(user.pincode);
        
        // Only count supported cities
        if (!stats.supportedCities.includes(city)) return;
        
        const teamKey = `${city}_${user.role}`;
        
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