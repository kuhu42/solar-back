import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { USER_STATUS, USER_ROLES, PROJECT_STATUS, TASK_STATUS } from '../../types/index.js';
import WhatsAppPreview from '../Common/WhatsAppPreview.jsx';
import PDFPreview from '../Common/PDFPreview.jsx';
import GPSMap from '../Common/GPSMap.jsx';
import ProjectPipeline from '../Common/ProjectPipeline.jsx';
import PerformanceChart from '../Common/PerformanceChart.jsx';
import { 
  Users, 
  Briefcase, 
  MapPin, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  UserCheck,
  UserX,
  Calendar,
  BarChart3,
  MessageSquare,
  FileText,
  Settings,
  Percent,
  Download,
  Phone,
  Mail,
  Home,
  Building,
  Zap,
  User,
  CreditCard,
  RefreshCw,
  Edit
} from 'lucide-react';

const CompanyDashboard = () => {
  const { users, projects, tasks, attendance, inventory, invoices, dispatch, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showUserPerformance, setShowUserPerformance] = useState(false);
  const [commissionRates, setCommissionRates] = useState({
    freelancer: 10,
    agent: 8,
    installer: 5,
    technician: 6
  });

  const pendingUsers = users.filter(u => u.status === USER_STATUS.PENDING);
  const activeProjects = projects.filter(p => p.status === PROJECT_STATUS.IN_PROGRESS);
  const completedTasks = tasks.filter(t => t.status === TASK_STATUS.COMPLETED);
  const todayAttendance = attendance.filter(a => a.date === new Date().toISOString().split('T')[0]);
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);

  const handleApproveUser = (userId) => {
    dispatch({
      type: 'UPDATE_USER_STATUS',
      payload: { userId, status: USER_STATUS.ACTIVE }
    });
    showToast('User approved successfully!');
  };

  const handleRejectUser = (userId) => {
    dispatch({
      type: 'UPDATE_USER_STATUS',
      payload: { userId, status: USER_STATUS.REJECTED }
    });
    showToast('User rejected');
  };

  const handleUpdateUserRole = (userId, newRole) => {
    dispatch({
      type: 'UPDATE_USER_ROLE_AND_STATUS',
      payload: { 
        userId, 
        role: newRole,
        status: USER_STATUS.ACTIVE 
      }
    });
    showToast(`User role updated to ${newRole}!`);
  };

  const handleDeactivateUser = (userId) => {
    dispatch({
      type: 'UPDATE_USER_STATUS',
      payload: { userId, status: 'inactive' }
    });
    showToast('User deactivated');
  };

  const handleReactivateUser = (userId) => {
    dispatch({
      type: 'UPDATE_USER_STATUS',
      payload: { userId, status: USER_STATUS.ACTIVE }
    });
    showToast('User reactivated successfully!');
  };

  const handleUpdatePaymentStatus = (userId, status) => {
    // Mock payment status update
    showToast(`Payment status updated to ${status} for user`);
  };

  const handleUpdateProjectStatus = (projectId, status) => {
    dispatch({
      type: 'UPDATE_PROJECT_STATUS',
      payload: { projectId, status }
    });
    showToast('Project status updated!');
  };

  const handleApproveInstallation = (projectId) => {
    dispatch({
      type: 'UPDATE_PROJECT_STATUS',
      payload: { projectId, status: PROJECT_STATUS.COMPLETED }
    });
    showToast('Installation approved and project completed!');
  };

  const handleSendInvoice = (project) => {
    setShowWhatsApp(true);
    setTimeout(() => {
      setShowWhatsApp(false);
      showToast('Invoice sent via WhatsApp successfully!');
    }, 2000);
  };

  const handleUpdateCommission = (role, rate) => {
    setCommissionRates(prev => ({ ...prev, [role]: rate }));
    showToast(`Commission rate updated for ${role}: ${rate}%`);
  };

  const handleDownloadProjectDocuments = () => {
    showToast('Downloading all project documents as PDF...');
    setTimeout(() => {
      showToast('Project documents downloaded successfully!');
    }, 2000);
  };

  const getUserPerformanceData = (user) => {
    const userProjects = projects.filter(p => p.assignedTo === user.id);
    const userTasks = tasks.filter(t => t.assignedTo === user.id);
    const completedProjects = userProjects.filter(p => p.status === PROJECT_STATUS.COMPLETED);
    const totalValue = userProjects.reduce((sum, p) => sum + p.value, 0);
    const commission = totalValue * (commissionRates[user.role] || 0) / 100;

    return {
      totalProjects: userProjects.length,
      completedProjects: completedProjects.length,
      totalTasks: userTasks.length,
      completedTasks: userTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length,
      totalValue,
      commission,
      conversionRate: userProjects.length > 0 ? Math.round((completedProjects.length / userProjects.length) * 100) : 0
    };
  };

  const activeStaff = users.filter(u => u.status === USER_STATUS.ACTIVE && u.role !== 'company' && u.role !== 'customer');

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Dashboard</h1>
        <p className="text-gray-600">Manage your solar/wind installation business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Projects"
          value={activeProjects.length}
          icon={Briefcase}
          color="bg-blue-500"
          trend="+12% this month"
        />
        <StatCard
          title="Total Users"
          value={users.length}
          icon={Users}
          color="bg-green-500"
          trend="+3 new this week"
        />
        <StatCard
          title="Today's Attendance"
          value={todayAttendance.length}
          icon={MapPin}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-yellow-500"
          trend="+8% this month"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex space-x-2 overflow-x-auto">
            <TabButton
              id="overview"
              label="Overview"
              isActive={activeTab === 'overview'}
              onClick={setActiveTab}
            />
            <TabButton
              id="projects"
              label="Projects"
              isActive={activeTab === 'projects'}
              onClick={setActiveTab}
            />
            <TabButton
              id="staff-map"
              label="Staff Map"
              isActive={activeTab === 'staff-map'}
              onClick={setActiveTab}
            />
            <TabButton
              id="analytics"
              label="Analytics"
              isActive={activeTab === 'analytics'}
              onClick={setActiveTab}
            />
            <TabButton
              id="commission"
              label="Commission"
              isActive={activeTab === 'commission'}
              onClick={setActiveTab}
            />
            <TabButton
              id="users"
              label="User Management"
              isActive={activeTab === 'users'}
              onClick={setActiveTab}
            />
            <TabButton
              id="attendance"
              label="Attendance"
              isActive={activeTab === 'attendance'}
              onClick={setActiveTab}
            />
            <TabButton
              id="inventory"
              label="Inventory"
              isActive={activeTab === 'inventory'}
              onClick={setActiveTab}
            />
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Recent Projects */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h3>
                <div className="space-y-3">
                  {projects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{project.title}</h4>
                        <p className="text-sm text-gray-600">{project.customerName} • Agent: {project.assignedToName || 'Unassigned'}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === PROJECT_STATUS.COMPLETED
                            ? 'bg-green-100 text-green-800'
                            : project.status === PROJECT_STATUS.IN_PROGRESS
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          ₹{project.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Approvals */}
              {pendingUsers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Pending Middleman Approvals ({pendingUsers.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{user.name}</h4>
                            <p className="text-sm text-gray-600">Middleman • {user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex flex-col space-y-1">
                            <select
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                              defaultValue=""
                              onChange={(e) => {
                                user.selectedRole = e.target.value;
                              }}
                            >
                              <option value="">Assign Role</option>
                              <option value="agent">Agent</option>
                              <option value="freelancer">Freelancer</option>
                              <option value="installer">Installer</option>
                              <option value="technician">Technician</option>
                            </select>
                          </div>
                          <button
                            onClick={() => {
                              if (user.selectedRole) {
                                dispatch({
                                  type: 'UPDATE_USER_ROLE_AND_STATUS',
                                  payload: { 
                                    userId: user.id, 
                                    role: user.selectedRole,
                                    status: USER_STATUS.ACTIVE 
                                  }
                                });
                                showToast(`User approved as ${user.selectedRole}!`);
                              } else {
                                showToast('Please select a role first', 'error');
                              }
                            }}
                            className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectUser(user.id)}
                            className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
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

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowPDF(true)}
                  className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <FileText className="w-6 h-6 text-blue-600 mr-3" />
                  <span className="font-medium text-blue-900">Generate Reports</span>
                </button>
                
                <button
                  onClick={() => setShowWhatsApp(true)}
                  className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <MessageSquare className="w-6 h-6 text-green-600 mr-3" />
                  <span className="font-medium text-green-900">Send Notifications</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('staff-map')}
                  className="flex items-center justify-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <MapPin className="w-6 h-6 text-purple-600 mr-3" />
                  <span className="font-medium text-purple-900">Track Staff</span>
                </button>

                <button
                  onClick={handleDownloadProjectDocuments}
                  className="flex items-center justify-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <Download className="w-6 h-6 text-orange-600 mr-3" />
                  <span className="font-medium text-orange-900">Download All Docs</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'staff-map' && (
            <div>
              <GPSMap 
                staff={activeStaff.map(user => ({
                  ...user,
                  status: 'active'
                }))}
                selectedStaff={selectedStaff}
                onStaffSelect={setSelectedStaff}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PerformanceChart 
                  title="Monthly Project Leads"
                  type="bar"
                />
                <PerformanceChart 
                  title="Conversion Rate Trend"
                  type="line"
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PerformanceChart 
                  title="Revenue Growth"
                  type="line"
                />
                <PerformanceChart 
                  title="Staff Performance"
                  type="bar"
                />
              </div>
            </div>
          )}

          {activeTab === 'commission' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Commission Rate Management</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(commissionRates).map(([role, rate]) => (
                  <div key={role} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Percent className="w-5 h-5 text-blue-600" />
                        <h4 className="font-medium text-gray-900 capitalize">{role} Commission</h4>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{rate}%</span>
                    </div>
                    
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={rate}
                        onChange={(e) => handleUpdateCommission(role, parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>1%</span>
                        <span>20%</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-700">
                        Current {role}s earn <strong>{rate}%</strong> commission on completed projects
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Commission Summary */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Commission Payouts This Month</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projects</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeStaff.filter(user => user.role === 'freelancer' || user.role === 'technician').map((user) => {
                        const userProjects = projects.filter(p => p.assignedTo === user.id);
                        const commission = userProjects.reduce((sum, p) => sum + (p.value * (commissionRates[user.role] || 0) / 100), 0);
                        
                        return (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                              {user.role}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {userProjects.length}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{commission.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {user.paymentStatus || 'pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <select
                                onChange={(e) => handleUpdatePaymentStatus(user.id, e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                                defaultValue={user.paymentStatus || 'pending'}
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="paid">Paid</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedUser(users.find(u => u.role === 'agent'));
                      setShowUserPerformance(true);
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                  >
                    View Agent Performance
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(users.find(u => u.role === 'freelancer'));
                      setShowUserPerformance(true);
                    }}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                  >
                    View Freelancer Performance
                  </button>
                </div>
              </div>
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
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => {
                      const performance = getUserPerformanceData(user);
                      return (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                  <Users className="w-5 h-5 text-gray-600" />
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="capitalize text-sm text-gray-900">{user.role}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.status === USER_STATUS.ACTIVE
                                ? 'bg-green-100 text-green-800'
                                : user.status === USER_STATUS.PENDING
                                ? 'bg-yellow-100 text-yellow-800'
                                : user.status === 'inactive'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.role !== 'company' && user.role !== 'customer' && (
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserPerformance(true);
                                }}
                                className="flex items-center text-blue-600 hover:text-blue-800"
                              >
                                <BarChart3 className="w-4 h-4 mr-1" />
                                View
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {user.status === USER_STATUS.PENDING && (
                              <div className="flex space-x-2">
                                <select
                                  className="text-xs border border-gray-300 rounded px-2 py-1 mr-2"
                                  defaultValue=""
                                  onChange={(e) => {
                                    user.selectedRole = e.target.value;
                                  }}
                                >
                                  <option value="">Assign Role</option>
                                  <option value="agent">Agent</option>
                                  <option value="freelancer">Freelancer</option>
                                  <option value="installer">Installer</option>
                                  <option value="technician">Technician</option>
                                </select>
                                <button
                                  onClick={() => {
                                    if (user.selectedRole) {
                                      dispatch({
                                        type: 'UPDATE_USER_ROLE_AND_STATUS',
                                        payload: { 
                                          userId: user.id, 
                                          role: user.selectedRole,
                                          status: USER_STATUS.ACTIVE 
                                        }
                                      });
                                      showToast(`User approved as ${user.selectedRole}!`);
                                    } else {
                                      showToast('Please select a role first', 'error');
                                    }
                                  }}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectUser(user.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {user.status === USER_STATUS.ACTIVE && user.role !== USER_ROLES.COMPANY && user.role !== USER_ROLES.CUSTOMER && (
                              <div className="flex space-x-2">
                                <select
                                  value={user.role}
                                  onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                  className="text-xs border border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="agent">Agent</option>
                                  <option value="freelancer">Freelancer</option>
                                  <option value="installer">Installer</option>
                                  <option value="technician">Technician</option>
                                </select>
                                <button
                                  onClick={() => handleDeactivateUser(user.id)}
                                  className="text-red-600 hover:text-red-900 text-xs"
                                >
                                  Deactivate
                                </button>
                              </div>
                            )}
                            {user.status === 'inactive' && (
                              <button
                                onClick={() => handleReactivateUser(user.id)}
                                className="flex items-center text-green-600 hover:text-green-800 text-xs"
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Reactivate
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Projects Management</h3>
                <button
                  onClick={handleDownloadProjectDocuments}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All Documents
                </button>
              </div>
              <div className="grid gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{project.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Customer: {project.customerName}</span>
                          <span>Agent: {project.assignedToName || 'Unassigned'}</span>
                          <span>Value: ₹{project.value.toLocaleString()}</span>
                          <span className="capitalize">Stage: {project.pipelineStage?.replace('_', ' ') || 'Lead Generated'}</span>
                        </div>
                        
                        {/* Pipeline Progress */}
                        <div className="mt-4 bg-gray-50 rounded-lg p-3">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Pipeline Progress</h5>
                          <div className="flex items-center space-x-1 overflow-x-auto">
                            {[
                              'lead_generated',
                              'quotation_sent', 
                              'bank_process',
                              'meter_applied',
                              'ready_for_installation',
                              'installation_complete',
                              'commissioned',
                              'active'
                            ].map((stage, index) => {
                              const stages = [
                                'lead_generated',
                                'quotation_sent',
                                'bank_process',
                                'meter_applied',
                                'ready_for_installation',
                                'installation_complete',
                                'commissioned',
                                'active'
                              ];
                              const currentIndex = stages.indexOf(project.pipelineStage);
                              const isCompleted = currentIndex >= index;
                              const isCurrent = project.pipelineStage === stage;
                              
                              return (
                                <div key={stage} className="flex items-center">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                    isCompleted 
                                      ? 'bg-green-500 text-white' 
                                      : isCurrent
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-300 text-gray-600'
                                  }`}>
                                    {isCompleted ? '✓' : index + 1}
                                  </div>
                                  {index < 7 && (
                                    <div className={`w-4 h-1 ${
                                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                                    }`}></div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-xs text-gray-600 mt-2 capitalize">
                            Current: {project.pipelineStage?.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-2">
                          <select
                            value={project.status}
                            onChange={(e) => handleUpdateProjectStatus(project.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => {
                              setSelectedProject(project);
                              setShowProjectDetails(true);
                            }}
                            className="flex items-center px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </button>
                        </div>
                        {project.status === PROJECT_STATUS.IN_PROGRESS && project.pipelineStage === 'installation_complete' && !project.installationApproved && (
                          <button
                            onClick={() => handleApproveInstallation(project.id)}
                            className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve Installation
                          </button>
                        )}
                        {project.status === PROJECT_STATUS.COMPLETED && (
                          <button
                            onClick={() => handleSendInvoice(project)}
                            className="flex items-center px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Send Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check In
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check Out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {todayAttendance.map((att) => (
                      <tr key={att.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {att.userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {att.checkIn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {att.checkOut || 'Not checked out'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {att.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            att.checkOut
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {att.checkOut ? 'Completed' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Overview</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Serial Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Model
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventory.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.serialNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {item.type.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.model}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.status === 'in_stock'
                              ? 'bg-green-100 text-green-800'
                              : item.status === 'assigned'
                              ? 'bg-blue-100 text-blue-800'
                              : item.status === 'installed'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.location}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Details Modal */}
      {showProjectDetails && selectedProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
                <button
                  onClick={() => setShowProjectDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Project Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{selectedProject.title}</h4>
                <p className="text-gray-600 mb-4">{selectedProject.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="ml-2 capitalize">{selectedProject.status.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Value:</span>
                    <span className="ml-2">₹{selectedProject.value.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Start Date:</span>
                    <span className="ml-2">{selectedProject.startDate}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Assigned Agent:</span>
                    <span className="ml-2">{selectedProject.assignedToName || 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              {selectedProject.customerDetails && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Customer Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-800">Customer Name:</span>
                      <p className="text-blue-700">{selectedProject.customerDetails.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Phone No:</span>
                      <p className="text-blue-700">{selectedProject.customerDetails.phone}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Service Number:</span>
                      <p className="text-blue-700">{selectedProject.customerDetails.serviceNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Email ID:</span>
                      <p className="text-blue-700">{selectedProject.customerDetails.email}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-blue-800">Address:</span>
                      <p className="text-blue-700">{selectedProject.customerDetails.address}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Module Type:</span>
                      <p className="text-blue-700">{selectedProject.customerDetails.moduleType}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">KW Capacity:</span>
                      <p className="text-blue-700">{selectedProject.customerDetails.kwCapacity}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">House Type:</span>
                      <p className="text-blue-700">{selectedProject.customerDetails.houseType}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">No of Floors:</span>
                      <p className="text-blue-700">{selectedProject.customerDetails.floors}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-blue-800">Remarks/Requirements:</span>
                      <p className="text-blue-700">{selectedProject.customerDetails.remarks}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Project Actions */}
              <div className="flex items-center space-x-3 pt-4 border-t">
                <select
                  value={selectedProject.status}
                  onChange={(e) => {
                    handleUpdateProjectStatus(selectedProject.id, e.target.value);
                    setSelectedProject({...selectedProject, status: e.target.value});
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {selectedProject.status === PROJECT_STATUS.IN_PROGRESS && 
                 selectedProject.pipelineStage === 'installation_complete' && 
                 !selectedProject.installationApproved && (
                  <button
                    onClick={() => {
                      handleApproveInstallation(selectedProject.id);
                      setSelectedProject({...selectedProject, installationApproved: true, status: PROJECT_STATUS.COMPLETED});
                    }}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Installation
                  </button>
                )}

                <button
                  onClick={() => {
                    showToast('Project documents downloaded!');
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Docs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Performance Modal */}
      {showUserPerformance && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedUser.name} - Performance Dashboard
                </h3>
                <button
                  onClick={() => setShowUserPerformance(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {(() => {
                const performance = getUserPerformanceData(selectedUser);
                return (
                  <>
                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900">Total Projects</h4>
                        <p className="text-2xl font-bold text-blue-600 mt-2">{performance.totalProjects}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-medium text-green-900">Completed</h4>
                        <p className="text-2xl font-bold text-green-600 mt-2">{performance.completedProjects}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-medium text-purple-900">Total Value</h4>
                        <p className="text-2xl font-bold text-purple-600 mt-2">₹{performance.totalValue.toLocaleString()}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="font-medium text-orange-900">Commission</h4>
                        <p className="text-2xl font-bold text-orange-600 mt-2">₹{performance.commission.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Performance Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <PerformanceChart 
                        title={`${selectedUser.name} - Monthly Performance`}
                        type="bar"
                      />
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="font-medium text-gray-900 mb-4">Performance Metrics</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Conversion Rate:</span>
                            <span className="font-bold text-green-600">{performance.conversionRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Average Project Value:</span>
                            <span className="font-bold text-blue-600">
                              ₹{performance.totalProjects > 0 ? Math.round(performance.totalValue / performance.totalProjects).toLocaleString() : 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Task Completion Rate:</span>
                            <span className="font-bold text-purple-600">
                              {performance.totalTasks > 0 ? Math.round((performance.completedTasks / performance.totalTasks) * 100) : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Projects */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Recent Projects</h4>
                      <div className="space-y-3">
                        {projects.filter(p => p.assignedTo === selectedUser.id).slice(0, 5).map((project) => (
                          <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <h5 className="font-medium text-gray-900">{project.title}</h5>
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
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <WhatsAppPreview
        isOpen={showWhatsApp}
        onClose={() => setShowWhatsApp(false)}
        type="invoice"
        customerName="David Customer"
        amount={25000}
      />

      <PDFPreview
        isOpen={showPDF}
        onClose={() => setShowPDF(false)}
        type="invoice"
        data={{
          customerName: "David Customer",
          amount: 25000,
          invoiceNumber: "INV-2024-001"
        }}
      />
    </div>
  );
};

export default CompanyDashboard;