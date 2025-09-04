import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { USER_ROLES, USER_STATUS, PROJECT_STATUS } from '../../types/index.js';
import PerformanceChart from '../Common/PerformanceChart.jsx';
import ProjectPipeline from '../Common/ProjectPipeline.jsx';
import GPSMap from '../Common/GPSMap.jsx';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  UserX,
  MapPin,
  FileText,
  Package,
  MessageSquare,
  Calendar,
  Phone,
  Mail,
  Settings,
  Download,
  Eye,
  Zap
} from 'lucide-react';

const CompanyDashboard = () => {
  const { 
    currentUser, 
    users, 
    projects, 
    tasks, 
    attendance, 
    inventory, 
    leads, 
    complaints, 
    invoices,
    commissions,
    updateUserStatus, 
    showToast,
    isLiveMode,
    trackEvent
  } = useApp();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Track page view
  useEffect(() => {
    trackEvent('dashboard_view', { dashboard: 'company' });
  }, []);

  const pendingUsers = users.filter(u => u.status === USER_STATUS.PENDING);
  const activeStaff = users.filter(u => u.status === USER_STATUS.ACTIVE && u.role !== USER_ROLES.CUSTOMER);
  const totalRevenue = projects.reduce((sum, p) => sum + (p.value || 0), 0);
  const totalCommissions = commissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0);

  const handleApproveUser = async (userId, role) => {
    try {
      await updateUserStatus(userId, USER_STATUS.ACTIVE, role);
      showToast('User approved successfully!');
      
      // Track approval event
      await trackEvent('user_approved', { 
        approvedUserId: userId, 
        approvedRole: role,
        approvedBy: currentUser.id 
      });
    } catch (error) {
      showToast('Error approving user', 'error');
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      await updateUserStatus(userId, USER_STATUS.REJECTED);
      showToast('User rejected');
      
      await trackEvent('user_rejected', { 
        rejectedUserId: userId,
        rejectedBy: currentUser.id 
      });
    } catch (error) {
      showToast('Error rejecting user', 'error');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
          {isLiveMode && <Zap className="w-3 h-3 text-white absolute ml-6 -mt-6" />}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Dashboard</h1>
          <p className="text-gray-600">
            Manage your solar business operations
            {isLiveMode && <span className="ml-2 text-green-600 font-medium">• Live Data</span>}
          </p>
        </div>
        
        {pendingUsers.length > 0 && (
          <div className="flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-lg">
            <AlertTriangle className="w-4 h-4 mr-2" />
            {pendingUsers.length} pending approval{pendingUsers.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={users.length}
          icon={Users}
          color="bg-blue-500"
          subtitle={`${activeStaff.length} active staff`}
          trend="+12% this month"
        />
        <StatCard
          title="Active Projects"
          value={projects.filter(p => p.status === PROJECT_STATUS.IN_PROGRESS).length}
          icon={Briefcase}
          color="bg-green-500"
          subtitle={`${projects.length} total projects`}
          trend="+8% this month"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-purple-500"
          subtitle="This year"
          trend="+15% this month"
        />
        <StatCard
          title="Commissions Paid"
          value={`₹${totalCommissions.toLocaleString()}`}
          icon={TrendingUp}
          color="bg-orange-500"
          subtitle="To freelancers"
          trend="+22% this month"
        />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex space-x-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              User Management
              {pendingUsers.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                  {pendingUsers.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'projects'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('staff-tracking')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'staff-tracking'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Staff Tracking
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-4">Today's Highlights</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Active Staff</span>
                      <span className="font-bold">{attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && !a.checkOut).length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tasks Completed</span>
                      <span className="font-bold">{tasks.filter(t => t.status === 'completed').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>New Complaints</span>
                      <span className="font-bold">{complaints.filter(c => c.status === 'open').length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-4">Business Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Conversion Rate</span>
                      <span className="font-bold">
                        {leads.length > 0 ? Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Avg Project Value</span>
                      <span className="font-bold">
                        ₹{projects.length > 0 ? Math.round(totalRevenue / projects.length).toLocaleString() : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Customer Satisfaction</span>
                      <span className="font-bold">94%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Pipeline */}
              <ProjectPipeline projects={projects} />

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h3>
                  <div className="space-y-3">
                    {projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{project.title}</h4>
                          <p className="text-sm text-gray-600">{project.customerName}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === PROJECT_STATUS.COMPLETED
                              ? 'bg-green-100 text-green-800'
                              : project.status === PROJECT_STATUS.IN_PROGRESS
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.status.replace('_', ' ')}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">₹{project.value.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h3>
                  <div className="space-y-3">
                    {pendingUsers.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{user.name}</h4>
                            <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApproveUser(user.id, user.role)}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectUser(user.id)}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <div className="flex items-center space-x-2">
                  {isLiveMode && <Zap className="w-4 h-4 text-green-600" />}
                  <span className="text-sm text-gray-600">
                    {users.length} total users
                  </span>
                </div>
              </div>

              {/* Pending Approvals */}
              {pendingUsers.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h4 className="font-medium text-orange-900 mb-4">
                    Pending Approvals ({pendingUsers.length})
                  </h4>
                  <div className="grid gap-4">
                    {pendingUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">{user.name}</h5>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-sm text-gray-500 capitalize">Applied for: {user.role}</p>
                            {user.phone && (
                              <p className="text-sm text-gray-500">{user.phone}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleApproveUser(user.id, user.role)}
                            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectUser(user.id)}
                            className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Users */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Active Users</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.filter(u => u.status === USER_STATUS.ACTIVE).map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.location || 'Not specified'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Phone className="w-4 h-4" />
                              </button>
                              <button className="text-blue-600 hover:text-blue-900">
                                <Mail className="w-4 h-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <Settings className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Project Management</h3>
              
              <div className="grid gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                        <p className="text-gray-600 mt-1">{project.description}</p>
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {project.customerName}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {project.location}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            ₹{project.value.toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {project.startDate}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === PROJECT_STATUS.COMPLETED
                            ? 'bg-green-100 text-green-800'
                            : project.status === PROJECT_STATUS.IN_PROGRESS
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {project.pipelineStage?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {project.serialNumbers && project.serialNumbers.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Equipment:</h5>
                        <div className="flex flex-wrap gap-2">
                          {project.serialNumbers.map((serial) => (
                            <span key={serial} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono">
                              {serial}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Business Analytics</h3>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <PerformanceChart 
                  title="Monthly Revenue"
                  type="bar"
                />
                <PerformanceChart 
                  title="Project Completion Rate"
                  type="line"
                />
                <PerformanceChart 
                  title="Lead Conversion Trend"
                  type="line"
                />
                <PerformanceChart 
                  title="Staff Performance"
                  type="bar"
                />
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-medium text-blue-900 mb-2">Revenue Growth</h4>
                  <p className="text-2xl font-bold text-blue-600">+24%</p>
                  <p className="text-sm text-blue-700">vs last quarter</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="font-medium text-green-900 mb-2">Customer Satisfaction</h4>
                  <p className="text-2xl font-bold text-green-600">94%</p>
                  <p className="text-sm text-green-700">based on feedback</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="font-medium text-purple-900 mb-2">Project Success Rate</h4>
                  <p className="text-2xl font-bold text-purple-600">98%</p>
                  <p className="text-sm text-purple-700">on-time completion</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'staff-tracking' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Staff Tracking & Attendance</h3>
              
              <GPSMap 
                staff={activeStaff}
                selectedStaff={selectedStaff}
                onStaffSelect={setSelectedStaff}
              />

              {/* Attendance Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Today's Attendance</h4>
                  <div className="space-y-3">
                    {attendance.filter(a => a.date === new Date().toISOString().split('T')[0]).map((att) => (
                      <div key={att.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${att.checkOut ? 'bg-gray-400' : 'bg-green-500'}`}></div>
                          <div>
                            <h5 className="font-medium text-gray-900">{att.userName}</h5>
                            <p className="text-sm text-gray-600">{att.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {att.checkIn} {att.checkOut && `- ${att.checkOut}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {att.checkOut ? 'Completed' : 'Active'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Performance Summary</h4>
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="font-medium text-green-900">On Time Performance</h5>
                      <p className="text-2xl font-bold text-green-600 mt-1">96%</p>
                      <p className="text-sm text-green-700">Staff punctuality rate</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900">Average Hours</h5>
                      <p className="text-2xl font-bold text-blue-600 mt-1">8.2</p>
                      <p className="text-sm text-blue-700">Hours per day</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h5 className="font-medium text-purple-900">Overtime</h5>
                      <p className="text-2xl font-bold text-purple-600 mt-1">12%</p>
                      <p className="text-sm text-purple-700">Of total hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedUser.name}</div>
                  <div><span className="font-medium">Email:</span> {selectedUser.email}</div>
                  <div><span className="font-medium">Phone:</span> {selectedUser.phone}</div>
                  <div><span className="font-medium">Role:</span> <span className="capitalize">{selectedUser.role}</span></div>
                  <div><span className="font-medium">Status:</span> <span className="capitalize">{selectedUser.status}</span></div>
                  <div><span className="font-medium">Location:</span> {selectedUser.location}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Additional Details</h4>
                <div className="space-y-2 text-sm">
                  {selectedUser.education && (
                    <div><span className="font-medium">Education:</span> {selectedUser.education}</div>
                  )}
                  {selectedUser.customerRefNumber && (
                    <div><span className="font-medium">Customer Ref:</span> {selectedUser.customerRefNumber}</div>
                  )}
                  {selectedUser.bankDetails && (
                    <div><span className="font-medium">Bank Details:</span> Provided</div>
                  )}
                  <div><span className="font-medium">Joined:</span> {new Date(selectedUser.createdAt || Date.now()).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-6 pt-6 border-t">
              <button
                onClick={() => handleApproveUser(selectedUser.id, selectedUser.role)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Approve
              </button>
              <button
                onClick={() => handleRejectUser(selectedUser.id)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <UserX className="w-4 h-4 mr-2" />
                Reject
              </button>
              <button
                onClick={() => setShowUserModal(false)}
                className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;