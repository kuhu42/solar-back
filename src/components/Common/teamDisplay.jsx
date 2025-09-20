import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, MapPin, UserCheck, UserX, Clock, RefreshCw } from 'lucide-react';

const TeamsDisplay = () => {
  const { 
    getTeamsByRole, 
    getUsersInSameLocation, 
    refreshTeamData, 
    currentUser, 
    userTeam, 
    teamStats,
    isLiveMode 
  } = useApp();
  
  const [selectedRole, setSelectedRole] = useState('agent');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const roles = ['agent', 'installer', 'technician', 'freelancer'];

  useEffect(() => {
    loadTeams();
  }, [selectedRole]);

  const loadTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const roleTeams = await getTeamsByRole(selectedRole);
      setTeams(roleTeams);
    } catch (err) {
      setError('Failed to load teams');
      console.error('Load teams error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamClick = async (team) => {
    try {
      const teamDetails = await getUsersInSameLocation(
        team.members[0]?.pincode || '000000', 
        selectedRole
      );
      setSelectedTeam(teamDetails);
    } catch (err) {
      console.error('Load team details error:', err);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshTeamData();
      await loadTeams();
    } catch (err) {
      setError('Failed to refresh teams');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
              <p className="text-gray-600 mt-1">
                Location-based teams grouped by pincode and role
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Mode indicator */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">
                {isLiveMode ? 'Live Mode' : 'Demo Mode'}:
              </span> 
              {isLiveMode 
                ? ' Showing real user data grouped by pincode'
                : ' Showing mock data for demonstration'
              }
            </p>
          </div>
        </div>

        {/* Current User's Team */}
        {currentUser && userTeam && (
          <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Your Team</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">{userTeam.teamName}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-blue-700">{userTeam.location}</span>
              </div>
              <div className="flex items-center">
                <UserCheck className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-blue-700">{userTeam.totalMembers} members</span>
              </div>
            </div>
          </div>
        )}

        {/* Role Selector */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-2">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  selectedRole === role
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {role}s
              </button>
            ))}
          </div>
        </div>

        {/* Teams Grid */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading teams...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadTeams}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No teams found for {selectedRole}s</p>
              <p className="text-sm text-gray-400 mt-2">
                Teams are created when users register with pincode data
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team, index) => (
                <div
                  key={team.id || index}
                  onClick={() => handleTeamClick(team)}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {team.teamName || team.name}
                      </h3>
                      <div className="flex items-center text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{team.location}</span>
                      </div>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Members</span>
                      <span className="font-semibold text-gray-900">
                        {team.totalMembers || team.members?.length || 0}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <UserCheck className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-sm text-gray-600">Active</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        {team.activeMembers || 0}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-yellow-600 mr-1" />
                        <span className="text-sm text-gray-600">Pending</span>
                      </div>
                      <span className="text-sm font-medium text-yellow-600">
                        {team.pendingMembers || 0}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Click to view team members
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Team Details Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedTeam.teamName}
                </h3>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {selectedTeam.location} • {selectedTeam.members.length} members
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-80">
              <div className="space-y-3">
                {selectedTeam.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      {member.phone && (
                        <p className="text-sm text-gray-600">{member.phone}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          member.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : member.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {member.status}
                      </span>
                      {member.pincode && (
                        <p className="text-xs text-gray-500 mt-1">
                          {member.pincode}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsDisplay;