import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { USER_STATUS, PROJECT_STATUS, INVENTORY_STATUS } from '../../types/index.js';
import InventoryManager from '../Common/InventoryManager.jsx';
import PerformanceChart from '../Common/PerformanceChart.jsx';
import ProjectPipeline from '../Common/ProjectPipeline.jsx';
import GPSMap from '../Common/GPSMap.jsx';
import ModeToggle from '../Common/ModeToggle.jsx';
import { dbService } from '../../lib/supabase.js';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Package,
  MapPin,
  UserCheck,
  UserX,
  Building,
  BarChart3,
  Plus,
  Eye,
  Settings,
  Trash2
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
  isLiveMode,
  toggleMode,
  dispatch, 
  showToast,
  createProject,        // Add this
  updateInventoryStatus,
  updateUserStatus, 
  deactivateUser,    // Add this
  reactivateUser 
} = useApp();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    location: '',
    value: 0,
    customerId: '',
    agentId: '',
    selectedEquipment: []
  });
  const [userFilter, setUserFilter] = useState('all'); // Add this state variabl

  const pendingUsers = users.filter(u => u.status === USER_STATUS.PENDING);
  const activeProjects = projects.filter(p => p.status === PROJECT_STATUS.IN_PROGRESS);
  const completedProjects = projects.filter(p => p.status === PROJECT_STATUS.COMPLETED);
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const activeStaff = users.filter(u => u.status === USER_STATUS.ACTIVE && u.role !== 'customer');
  const customers = users.filter(u => u.role === 'customer' && u.status === USER_STATUS.ACTIVE);
  const agents = users.filter(u => u.role === 'agent' && u.status === USER_STATUS.ACTIVE);
  const availableInventory = inventory.filter(i => i.status === INVENTORY_STATUS.IN_STOCK);

  const inventoryStats = {
    total: inventory.length,
    inStock: inventory.filter(i => i.status === INVENTORY_STATUS.IN_STOCK).length,
    assigned: inventory.filter(i => i.status === INVENTORY_STATUS.ASSIGNED).length,
    installed: inventory.filter(i => i.status === INVENTORY_STATUS.INSTALLED).length,
    totalValue: inventory.reduce((sum, i) => sum + (i.cost || 0), 0)
  };

// Replace your handleCreateProject function in CompanyDashboard.jsx with this:
const handleDeactivateUser = async (user) => {
  if (confirm(`Are you sure you want to deactivate ${user.name}? They will not be able to login until reactivated.`)) {
    try {
      await deactivateUser(user.id);
      showToast(`${user.name} has been deactivated`);
    } catch (error) {
      showToast('Error deactivating user: ' + error.message, 'error');
    }
  }
};

const handleReactivateUser = async (user) => {
  if (confirm(`Are you sure you want to reactivate ${user.name}? They will be able to login again.`)) {
    try {
      await reactivateUser(user.id);
      showToast(`${user.name} has been reactivated`);
    } catch (error) {
      showToast('Error reactivating user: ' + error.message, 'error');
    }
  }
};

const handleDeleteUser = async (user) => {
  if (confirm(`Are you sure you want to permanently delete ${user.name}? This action cannot be undone.`)) {
    // You can implement this later if needed
    alert('Delete functionality coming soon');
  }
};

// Add this computed property for filtered users
const filteredUsers = users.filter(user => {
  if (userFilter === 'all') return true;
  if (userFilter === 'active') return user.status === 'active';
  if (userFilter === 'inactive') return user.status === 'inactive';
  return true;
});
// Replace your handleCreateProject function in CompanyDashboard.jsx with this fixed version:

const handleCreateProject = async (e) => {
  e.preventDefault();
  
  console.log('=== CREATE PROJECT DEBUG ===');
  console.log('Selected customerId:', newProject.customerId);
  console.log('Selected agentId:', newProject.agentId);
  console.log('Selected equipment:', newProject.selectedEquipment);
  console.log('Available customers:', customers);
  console.log('Available agents:', agents);
  console.log('Available inventory:', availableInventory);
  
  // Validation
  if (!newProject.customerId || !newProject.agentId) {
    showToast('Please select both customer and agent', 'error');
    return;
  }

  // Allow projects without equipment for now (some projects might not need immediate equipment assignment)
  if (newProject.selectedEquipment.length === 0) {
    console.warn('⚠️ No equipment selected - creating project without equipment');
  }

  const customer = customers.find(c => c.id === newProject.customerId);
  const agent = agents.find(a => a.id === newProject.agentId);
  
  console.log('Found customer:', customer);
  console.log('Found agent:', agent);
  
  if (!customer) {
    showToast('Selected customer not found', 'error');
    return;
  }
  
  if (!agent) {
    showToast('Selected agent not found', 'error');
    return;
  }
  
  // Clean equipment selection - remove any undefined values
  const cleanEquipment = newProject.selectedEquipment.filter(item => 
    item !== undefined && item !== null && item !== ''
  );
  
  console.log('Cleaned equipment:', cleanEquipment);
  
  const project = {
    title: newProject.title,
    description: newProject.description,
    location: newProject.location,
    value: Number(newProject.value),
    customer_id: newProject.customerId,
    customer_name: customer.name,
    customer_ref_number: customer.customer_ref_number || customer.customerRefNumber || `CUST-${Date.now()}`,
    agent_id: newProject.agentId,
    assigned_to: newProject.agentId,
    assigned_to_name: agent.name,
    serial_numbers: cleanEquipment, // Use cleaned equipment list
    status: 'pending',
    pipeline_stage: 'lead_generated',
    type: 'solar',
    installation_approved: false,
    installer_assigned: false,
    installation_complete: false
  };

  console.log('Final project object to create:', project);

  try {
    console.log('🚀 Calling createProject...');
    const createdProject = await createProject(project);
    console.log('✅ Project created successfully:', createdProject);

    // Update inventory status to assigned (only if equipment was selected)
    if (cleanEquipment.length > 0) {
      console.log('📦 Updating inventory status for equipment...');
      for (const serialNumber of cleanEquipment) {
        try {
          await updateInventoryStatus(serialNumber, INVENTORY_STATUS.ASSIGNED, {
            assignedToProject: createdProject.id
          });
          console.log(`✅ Updated inventory ${serialNumber}`);
        } catch (inventoryError) {
          console.error(`❌ Failed to update inventory ${serialNumber}:`, inventoryError);
          // Don't fail the whole process for inventory issues
        }
      }
    }

    showToast('Project created successfully!');
    
    // Close modal and reset form
    setShowCreateProject(false);
    setNewProject({
      title: '',
      description: '',
      location: '',
      value: 0,
      customerId: '',
      agentId: '',
      selectedEquipment: []
    });

    // Force reload of projects data to show the new project
    console.log('🔄 Reloading projects data...');
    if (isLiveMode) {
      // Reload live data
      try {
        const updatedProjects = await dbService.getProjects();
        dispatch({ type: 'SET_PROJECTS', payload: updatedProjects });
        console.log('✅ Projects data reloaded');
      } catch (reloadError) {
        console.error('❌ Failed to reload projects:', reloadError);
      }
    }
    
  } catch (error) {
    console.error('💥 Error creating project:', error);
    showToast('Error creating project: ' + error.message, 'error');
    // Don't close modal if creation failed so user can try again
  }
};

// Replace your handleApproveUser and handleRejectUser functions in CompanyDashboard.jsx with these:

const handleApproveUser = async (userId, role) => {
  try {
    await updateUserStatus(userId, 'active', role);
    showToast('User approved successfully!');
  } catch (error) {
    showToast('Error approving user: ' + error.message, 'error');
  }
};

const handleRejectUser = async (userId) => {
  try {
    await updateUserStatus(userId, 'rejected');
    showToast('User rejected');
  } catch (error) {
    showToast('Error rejecting user: ' + error.message, 'error');
  }
};

  const handleUpdatePipelineStage = (projectId, stage) => {
    dispatch({
      type: 'UPDATE_PROJECT_PIPELINE',
      payload: { projectId, pipelineStage: stage }
    });
    showToast('Project stage updated!');
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Mode Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Dashboard</h1>
          <p className="text-gray-600">Manage your solar business operations and team</p>
        </div>
        <ModeToggle 
          isLiveMode={isLiveMode} 
          onToggle={toggleMode}
          size="normal"
          showLabels={true}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Projects"
          value={projects.length}
          icon={Briefcase}
          color="bg-blue-500"
          subtitle={`${activeProjects.length} active`}
          trend="+12% this month"
        />
        <StatCard
          title="Active Staff"
          value={activeStaff.length}
          icon={Users}
          color="bg-green-500"
          subtitle={`${pendingUsers.length} pending approval`}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-purple-500"
          subtitle="From completed projects"
          trend="+8% this month"
        />
        <StatCard
          title="Inventory Items"
          value={inventoryStats.total}
          icon={Package}
          color="bg-orange-500"
          subtitle={`₹${inventoryStats.totalValue.toLocaleString()} total value`}
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
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'inventory'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Inventory Management
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
              onClick={() => setActiveTab('tracking')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'tracking'
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
              {/* Pending Approvals Alert */}
              {pendingUsers.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-yellow-900">
                        {pendingUsers.length} User{pendingUsers.length > 1 ? 's' : ''} Pending Approval
                      </h4>
                      <p className="text-sm text-yellow-700">
                        Review and approve new user registrations in the User Management tab.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900">Active Projects</h4>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{activeProjects.length}</p>
                  <p className="text-sm text-blue-700">In progress</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900">Completed Projects</h4>
                  <p className="text-2xl font-bold text-green-600 mt-2">{completedProjects.length}</p>
                  <p className="text-sm text-green-700">This month</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900">Inventory Value</h4>
                  <p className="text-2xl font-bold text-purple-600 mt-2">₹{inventoryStats.totalValue.toLocaleString()}</p>
                  <p className="text-sm text-purple-700">{inventoryStats.total} items</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900">Open Complaints</h4>
                  <p className="text-2xl font-bold text-orange-600 mt-2">
                    {complaints.filter(c => c.status === 'open').length}
                  </p>
                  <p className="text-sm text-orange-700">Need attention</p>
                </div>
              </div>

              {/* Project Pipeline */}
              <ProjectPipeline projects={projects} />

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Project Completed</p>
                      <p className="text-xs text-green-700">Solar installation in Mumbai completed successfully</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Inventory Updated</p>
                      <p className="text-xs text-blue-700">5 new solar panels added to Tata Solar inventory</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Users className="w-5 h-5 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">New User Registration</p>
                      <p className="text-xs text-yellow-700">Technician registration pending approval</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Project Management</h3>
                <button
                  onClick={() => setShowCreateProject(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Project
                </button>
              </div>
              
              <div className="grid gap-6">
                {projects.map(project => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                          {(project.installation_complete || project.installationComplete) && (
                            <div className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Installation Complete
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 mt-1">{project.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
  <span className="flex items-center">
    <Users className="w-4 h-4 mr-1" />
    Customer: {project.customer_name || 'Not assigned'} 
    (Ref: {project.customer_ref_number || 'Not set'})
  </span>
  <span className="flex items-center">
    <Users className="w-4 h-4 mr-1" />
    Agent: {project.assigned_to_name || 'Not assigned'}
  </span>
  <span className="flex items-center">
    <MapPin className="w-4 h-4 mr-1" />
    {project.location}
  </span>
  <span className="flex items-center">
    <DollarSign className="w-4 h-4 mr-1" />
    ₹{project.value.toLocaleString()}
  </span>
</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
  const customer = users.find(u => 
    (u.id === project.customer_id || u.id === project.customerId) && 
    u.role === 'customer'
  );
  setShowCustomerDetails(customer);
}}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                          title="View Customer Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === PROJECT_STATUS.COMPLETED
                            ? 'bg-green-100 text-green-800'
                            : project.status === PROJECT_STATUS.IN_PROGRESS
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Assigned Equipment */}
                    {project.serial_numbers && project.serial_numbers.length > 0 && (
  <div className="bg-gray-50 rounded-lg p-4 mt-4">
    <h5 className="font-medium text-gray-900 mb-2">Assigned Equipment:</h5>
    <div className="flex flex-wrap gap-2">
      {project.serial_numbers.map(serial => {
        const item = inventory.find(i => i.serialNumber === serial || i.serial_number === serial);
        return (
          <div key={serial} className="flex items-center space-x-2 bg-white border border-gray-200 rounded px-3 py-1">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-mono">{serial}</span>
            {item && (
              <span className={`w-2 h-2 rounded-full ${
                item.status === INVENTORY_STATUS.INSTALLED ? 'bg-green-500' :
                item.status === INVENTORY_STATUS.ASSIGNED ? 'bg-blue-500' : 'bg-gray-400'
              }`}></span>
            )}
          </div>
        );
      })}
    </div>
  </div>
)}

                    {/* Pipeline Stage */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pipeline Stage:
                      </label>
                      <select
                        value={project.pipelineStage || 'lead_generated'}
                        onChange={(e) => handleUpdatePipelineStage(project.id, e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="lead_generated">Lead Generated</option>
                        <option value="quotation_sent">Quotation Sent</option>
                        <option value="bank_process">Bank Process</option>
                        <option value="meter_applied">Meter Applied</option>
                        <option value="ready_for_installation">Ready for Installation</option>
                        <option value="installation_complete">Installation Complete</option>
                        <option value="commissioned">Commissioned</option>
                        <option value="active">Active</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <InventoryManager />
          )}

{activeTab === 'users' && (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
    
    {/* Pending Professional Approvals */}
    {pendingUsers.filter(u => u.role === 'middleman').length > 0 && (
      <div>
        <h4 className="font-medium text-gray-900 mb-4">
          Pending Professional Approvals ({pendingUsers.filter(u => u.role === 'middleman').length})
        </h4>
        <div className="space-y-4">
          {pendingUsers.filter(u => u.role === 'middleman').map(user => (
            <div key={user.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">{user.name}</h5>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      Requested Role: <span className="capitalize font-medium text-blue-600">
                        {user.requestedRole || 'Not specified'}
                      </span>
                    </p>
                    {user.phone && (
                      <p className="text-sm text-gray-500">Phone: {user.phone}</p>
                    )}
                    {user.education && (
                      <p className="text-sm text-gray-500">Education: {user.education}</p>
                    )}
                    {user.address && (
                      <p className="text-sm text-gray-500">Address: {user.address}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    defaultValue={user.requestedRole || 'agent'}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      handleApproveUser(user.id, newRole);
                    }}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="agent">Agent</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="installer">Installer</option>
                    <option value="technician">Technician</option>
                  </select>
                  <button
                    onClick={() => handleApproveUser(user.id, user.requestedRole || 'agent')}
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
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Other Pending Approvals (if any legacy users exist) */}
    {pendingUsers.filter(u => u.role !== 'middleman').length > 0 && (
      <div>
        <h4 className="font-medium text-gray-900 mb-4">
          Other Pending Approvals ({pendingUsers.filter(u => u.role !== 'middleman').length})
        </h4>
        <div className="space-y-4">
          {pendingUsers.filter(u => u.role !== 'middleman').map(user => (
            <div key={user.id} className="border border-gray-200 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">{user.name}</h5>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      Role: <span className="capitalize font-medium">{user.role}</span>
                    </p>
                    {user.phone && (
                      <p className="text-sm text-gray-500">Phone: {user.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleApproveUser(user.id, user.role)}
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
            </div>
          ))}
        </div>
      </div>
    )}

    {/* No Pending Approvals Message */}
    {pendingUsers.length === 0 && (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-8 h-8 text-green-600" />
        </div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h4>
        <p className="text-gray-600">No pending user approvals at this time.</p>
      </div>
    )}

    {/* User Status Filter */}
    <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
      <span className="text-sm font-medium text-gray-700">Filter by status:</span>
      <div className="flex space-x-2">
        <button
          onClick={() => setUserFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            userFilter === 'all' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          All Users
        </button>
        <button
          onClick={() => setUserFilter('active')}
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            userFilter === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setUserFilter('inactive')}
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            userFilter === 'inactive' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Inactive
        </button>
      </div>
    </div>

    {/* All Users Table */}
    <div>
      <h4 className="font-medium text-gray-900 mb-4">
        All Users ({filteredUsers.length})
      </h4>
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
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <tr key={user.id} className={user.status === 'inactive' ? 'bg-gray-50 opacity-75' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {user.avatar ? (
                      <img className="h-10 w-10 rounded-full object-cover" src={user.avatar} alt="" />
                    ) : (
                      <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                    <div className="ml-4">
                      <div className={`text-sm font-medium ${user.status === 'inactive' ? 'text-gray-500' : 'text-gray-900'}`}>
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.customerRefNumber && (
                        <div className="text-xs text-blue-600">Ref: {user.customerRefNumber}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                    user.role === 'customer' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'company' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' :
                    user.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.location || user.address || 'Not provided'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phone || 'Not provided'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {user.role !== 'company' && (
                    <div className="flex items-center space-x-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          alert('Edit user functionality coming soon');
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Edit User"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      
                      {/* Deactivate/Reactivate Button */}
                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleDeactivateUser(user)}
                          className="text-orange-600 hover:text-orange-900 p-1"
                          title="Deactivate User"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      ) : user.status === 'inactive' ? (
                        <button
                          onClick={() => handleReactivateUser(user)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Reactivate User"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      ) : null}
                      
                      {/* Delete Button (for rejected users or extreme cases) */}
                      {(user.status === 'rejected' || user.status === 'inactive') && (
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h4>
          <p className="text-gray-600">No users match the current filter criteria.</p>
        </div>
      )}
    </div>

    {/* Registration Info */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-blue-900 mb-2">User Management Info:</h4>
      <div className="text-sm text-blue-700 space-y-1">
        <p>• <strong>Active:</strong> User can login and access the system</p>
        <p>• <strong>Inactive:</strong> User account is disabled but data is preserved</p>
        <p>• <strong>Pending:</strong> Professional registration awaiting approval</p>
        <p>• <strong>Rejected:</strong> Registration was denied</p>
      </div>
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
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <PerformanceChart 
                  title="Inventory Usage"
                  type="bar"
                />
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Key Metrics</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Projects</span>
                      <span className="font-bold text-gray-900">{projects.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-bold text-green-600">
                        {projects.length > 0 ? Math.round((completedProjects.length / projects.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Project Value</span>
                      <span className="font-bold text-blue-600">
                        ₹{projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.value, 0) / projects.length).toLocaleString() : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Active Staff</span>
                      <span className="font-bold text-purple-600">{activeStaff.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Staff Location Tracking</h3>
              <GPSMap 
                staff={activeStaff}
                selectedStaff={selectedStaff}
                onStaffSelect={setSelectedStaff}
              />
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={newProject.title}
                    onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Value (₹) *
                  </label>
                  <input
                    type="number"
                    value={newProject.value}
                    onChange={(e) => setNewProject({...newProject, value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  value={newProject.location}
                  onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Customer *
                  </label>
                  <select
                    value={newProject.customerId}
                    onChange={(e) => setNewProject({...newProject, customerId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} (Ref: {customer.customerRefNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Agent *
                  </label>
                  <select
                    value={newProject.agentId}
                    onChange={(e) => setNewProject({...newProject, agentId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Agent</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Equipment * ({newProject.selectedEquipment.length} selected)
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {availableInventory.length > 0 ? (
                    <div className="space-y-2">
                      {availableInventory.map(item => (
                        <label key={item.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newProject.selectedEquipment.includes(item.serialNumber)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewProject({
                                  ...newProject,
                                  selectedEquipment: [...newProject.selectedEquipment, item.serialNumber]
                                });
                              } else {
                                setNewProject({
                                  ...newProject,
                                  selectedEquipment: newProject.selectedEquipment.filter(s => s !== item.serialNumber)
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">
                            {item.serialNumber} - {item.model} ({item.type.replace('_', ' ')})
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No equipment available in stock</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateProject(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Name:</span>
                <p className="text-gray-900">{showCustomerDetails.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Email:</span>
                <p className="text-gray-900">{showCustomerDetails.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Phone:</span>
                <p className="text-gray-900">{showCustomerDetails.phone}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Reference Number:</span>
                <p className="text-gray-900">{showCustomerDetails.customerRefNumber}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Location:</span>
                <p className="text-gray-900">{showCustomerDetails.location}</p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowCustomerDetails(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
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