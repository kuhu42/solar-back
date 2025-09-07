
import React, { useState } from 'react';
import { useApp } from '../../hooks/useApp.js'
import { dbService } from '../../lib/supabase.js';
import { USER_STATUS, PROJECT_STATUS, INVENTORY_STATUS } from '../../types/index.js';
import InventoryManager from '../Common/InventoryManager.jsx';
import PerformanceChart from '../Common/PerformanceChart.jsx';
import ProjectPipeline from '../Common/ProjectPipeline.jsx';
import GPSMap from '../Common/GPSMap.jsx';
import ModeToggle from '../Common/ModeToggle.jsx';
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
  X
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
    showToast 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [createProjectForm, setCreateProjectForm] = useState({
    title: '',
    value: '',
    description: '',
    location: '',
    customerId: '',
    agentId: '',
    selectedEquipment: [],
    type: 'solar'
  });

  const pendingUsers = users.filter(u => u.status === USER_STATUS.PENDING);
  const activeProjects = projects.filter(p => p.status === PROJECT_STATUS.IN_PROGRESS);
  const completedProjects = projects.filter(p => p.status === PROJECT_STATUS.COMPLETED);
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const activeStaff = users.filter(u => u.status === USER_STATUS.ACTIVE && u.role !== 'customer');
  const activeCustomers = users.filter(u => u.status === USER_STATUS.ACTIVE && u.role === 'customer');
  const activeAgents = users.filter(u => u.status === USER_STATUS.ACTIVE && u.role === 'agent');
  const availableEquipment = inventory.filter(i => i.status === INVENTORY_STATUS.IN_STOCK);
  
  const inventoryStats = {
    total: inventory.length,
    inStock: inventory.filter(i => i.status === INVENTORY_STATUS.IN_STOCK).length,
    assigned: inventory.filter(i => i.status === INVENTORY_STATUS.ASSIGNED).length,
    installed: inventory.filter(i => i.status === INVENTORY_STATUS.INSTALLED).length,
    totalValue: inventory.reduce((sum, i) => sum + (i.cost || 0), 0)
  };

  const handleApproveUser = async (userId, role) => {
    try {
      console.log('🔄 Approving user:', userId, 'with role:', role);
      
      const updatedUser = await dbService.updateUserProfile(userId, {
        status: 'active',
        role: role
      });

      console.log('✅ User approved:', updatedUser);

      dispatch({
        type: 'UPDATE_USER_STATUS',
        payload: { userId, status: 'active', role }
      });

      showToast('User approved successfully!');
    } catch (error) {
      console.error('Error approving user:', error);
      showToast(`Error approving user: ${error.message}`, 'error');
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      console.log('🔄 Rejecting user:', userId);
      
      const updatedUser = await dbService.updateUserProfile(userId, {
        status: 'rejected'
      });

      console.log('✅ User rejected:', updatedUser);

      dispatch({
        type: 'UPDATE_USER_STATUS',
        payload: { userId, status: 'rejected' }
      });

      showToast('User rejected');
    } catch (error) {
      console.error('Error rejecting user:', error);
      showToast(`Error rejecting user: ${error.message}`, 'error');
    }
  };

  // const handleCreateProject = async (e) => {
  //   e.preventDefault();
    
  //   // Validation
  //   if (!createProjectForm.title || !createProjectForm.value || !createProjectForm.description || 
  //       !createProjectForm.location || !createProjectForm.customerId || !createProjectForm.agentId) {
  //     showToast('Please fill in all required fields', 'error');
  //     return;
  //   }

  //   if (createProjectForm.selectedEquipment.length === 0) {
  //     showToast('Please select at least one piece of equipment', 'error');
  //     return;
  //   }

  //   try {
  //     const customer = users.find(u => u.id === createProjectForm.customerId);
  //     const agent = users.find(u => u.id === createProjectForm.agentId);

  //     const projectData = {
  //       title: createProjectForm.title,
  //       value: parseFloat(createProjectForm.value),
  //       description: createProjectForm.description,
  //       location: createProjectForm.location,
  //       customerId: createProjectForm.customerId,
  //       customerName: customer.name,
  //       customerRefNumber: customer.customerRefNumber || `REF${Date.now()}`,
  //       agentId: createProjectForm.agentId,
  //       agentName: agent.name,
  //       serialNumbers: createProjectForm.selectedEquipment,
  //       status: PROJECT_STATUS.PENDING,
  //       pipelineStage: 'lead_generated',
  //       createdAt: new Date().toISOString(),
  //       assignedAt: new Date().toISOString()
  //     };

  //     if (isLiveMode) {
  //       // Create project in database
  //       const newProject = await dbService.createProject(projectData);
        
  //       // Update equipment status to assigned
  //       for (const serialNumber of createProjectForm.selectedEquipment) {
  //         const item = inventory.find(i => i.serialNumber === serialNumber);
  //         if (item) {
  //           await dbService.updateInventoryItem(item.id, {
  //             status: INVENTORY_STATUS.ASSIGNED,
  //             projectId: newProject.id,
  //             assignedAt: new Date().toISOString()
  //           });
  //         }
  //       }
        
  //       showToast('Project created successfully!');
  //     } else {
  //       // Demo mode - update local state
  //       const newProject = {
  //         id: `project-${Date.now()}`,
  //         ...projectData
  //       };
        
  //       dispatch({ type: 'SET_PROJECTS', payload: [...projects, newProject] });
        
  //       // Update equipment status in demo mode
  //       const updatedInventory = inventory.map(item => {
  //         if (createProjectForm.selectedEquipment.includes(item.serialNumber)) {
  //           return {
  //             ...item,
  //             status: INVENTORY_STATUS.ASSIGNED,
  //             projectId: newProject.id,
  //             assignedAt: new Date().toISOString()
  //           };
  //         }
  //         return item;
  //       });
        
  //       dispatch({ type: 'SET_INVENTORY', payload: updatedInventory });
  //       showToast('Project created successfully!');
  //     }

  //     // Reset form and close modal
  //     setCreateProjectForm({
  //       title: '',
  //       value: '',
  //       description: '',
  //       location: '',
  //       customerId: '',
  //       agentId: '',
  //       selectedEquipment: []
  //     });
  //     setShowCreateProject(false);

  //   } catch (error) {
  //     console.error('Error creating project:', error);
  //     showToast(`Error creating project: ${error.message}`, 'error');
  //   }
  // };
  const handleCreateProject = async (e) => {
  e.preventDefault();
  
  // Validation
  if (!createProjectForm.title || !createProjectForm.value || !createProjectForm.description || 
      !createProjectForm.location || !createProjectForm.customerId || !createProjectForm.agentId) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  if (createProjectForm.selectedEquipment.length === 0) {
    showToast('Please select at least one piece of equipment', 'error');
    return;
  }

  try {
    const customer = users.find(u => u.id === createProjectForm.customerId);
    const agent = users.find(u => u.id === createProjectForm.agentId);

    // ✅ Fixed: Use snake_case column names to match your schema
    const projectData = {
      title: createProjectForm.title,
      value: parseFloat(createProjectForm.value),
      description: createProjectForm.description,
      location: createProjectForm.location,
      customer_id: createProjectForm.customerId,           // ✅ snake_case
      customer_name: customer.name,                        // ✅ snake_case
      customer_ref_number: customer.customerRefNumber || `REF${Date.now()}`, // ✅ snake_case
      agent_id: createProjectForm.agentId,                 // ✅ snake_case (not agentId)
      assigned_to: createProjectForm.agentId,              // ✅ This also exists in your schema
      assigned_to_name: agent.name,                        // ✅ snake_case
      serial_numbers: createProjectForm.selectedEquipment, // ✅ snake_case
      status: 'pending',                                   // ✅ Use string, not PROJECT_STATUS.PENDING
      pipeline_stage: 'lead_generated',                    // ✅ snake_case
      // type: 'solar',                                 // ✅ REQUIRED field - add this!
      type: createProjectForm.type, 
      created_at: new Date().toISOString()                 // ✅ snake_case
    };

    if (isLiveMode) {
      // Create project in database
      const newProject = await dbService.createProject(projectData);
      
      // Update equipment status to assigned
      for (const serialNumber of createProjectForm.selectedEquipment) {
        const item = inventory.find(i => i.serialNumber === serialNumber);
        if (item) {
          await dbService.updateInventoryItem(item.id, {
            status: INVENTORY_STATUS.ASSIGNED,
            project_id: newProject.id,  // ✅ Use snake_case if your inventory table uses it
            assigned_at: new Date().toISOString()
          });
        }
      }
      
      showToast('Project created successfully!');
    } else {
      // Demo mode - update local state (keep existing logic)
      const newProject = {
        id: `project-${Date.now()}`,
        // Convert back to camelCase for frontend consistency
        customerId: projectData.customer_id,
        customerName: projectData.customer_name,
        customerRefNumber: projectData.customer_ref_number,
        agentId: projectData.agent_id,
        agentName: projectData.assigned_to_name,
        serialNumbers: projectData.serial_numbers,
        pipelineStage: projectData.pipeline_stage,
        createdAt: projectData.created_at,
        // Keep other fields as-is
        title: projectData.title,
        value: projectData.value,
        description: projectData.description,
        location: projectData.location,
        status: projectData.status,
        type: projectData.type
      };
      
      dispatch({ type: 'SET_PROJECTS', payload: [...projects, newProject] });
      
      // Update equipment status in demo mode
      const updatedInventory = inventory.map(item => {
        if (createProjectForm.selectedEquipment.includes(item.serialNumber)) {
          return {
            ...item,
            status: INVENTORY_STATUS.ASSIGNED,
            projectId: newProject.id,
            assignedAt: new Date().toISOString()
          };
        }
        return item;
      });
      
      dispatch({ type: 'SET_INVENTORY', payload: updatedInventory });
      showToast('Project created successfully!');
    }

    // Reset form and close modal
    setCreateProjectForm({
      title: '',
      value: '',
      description: '',
      location: '',
      customerId: '',
      agentId: '',
      selectedEquipment: [],
      type: 'solar'
    });
    setShowCreateProject(false);

  } catch (error) {
    console.error('Error creating project:', error);
    showToast(`Error creating project: ${error.message}`, 'error');
  }
};


  const handleEquipmentToggle = (serialNumber) => {
    setCreateProjectForm(prev => ({
      ...prev,
      selectedEquipment: prev.selectedEquipment.includes(serialNumber)
        ? prev.selectedEquipment.filter(s => s !== serialNumber)
        : [...prev.selectedEquipment, serialNumber]
    }));
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

          {activeTab === 'inventory' && (
            <InventoryManager />
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
              
              {/* Pending Approvals */}
              {pendingUsers.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Pending Approvals ({pendingUsers.length})</h4>
                  <div className="space-y-4">
                    {pendingUsers.map(user => (
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
                                Requested Role: <span className="capitalize font-medium">{user.role}</span>
                              </p>
                              {user.phone && (
                                <p className="text-sm text-gray-500">Phone: {user.phone}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <select
                              defaultValue={user.role}
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
                          Contact
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.filter(u => u.status === USER_STATUS.ACTIVE).map(user => (
                        <tr key={user.id}>
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
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                {user.customerRefNumber && (
                                  <div className="text-xs text-blue-600">Ref: {user.customerRefNumber}</div>
                                )}
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
                            {user.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.phone}
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
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Project Management</h3>
                <button
                  onClick={() => setShowCreateProject(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                        <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                        <p className="text-gray-600 mt-1">{project.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {project.customerName} (Ref: {project.customerRefNumber})
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
                    {project.serialNumbers && project.serialNumbers.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 mt-4">
                        <h5 className="font-medium text-gray-900 mb-2">Assigned Equipment:</h5>
                        <div className="flex flex-wrap gap-2">
                          {project.serialNumbers.map(serial => {
                            const item = inventory.find(i => i.serialNumber === serial);
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
                        onChange={(e) => {
                          dispatch({
                            type: 'UPDATE_PROJECT_PIPELINE',
                            payload: { projectId: project.id, pipelineStage: e.target.value }
                          });
                          showToast('Project stage updated');
                        }}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
              <button
                onClick={() => setShowCreateProject(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6 space-y-6">
              {/* Basic Project Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Project Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={createProjectForm.title}
                      onChange={(e) => setCreateProjectForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter project title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Value (₹) *
                    </label>
                    <input
                      type="number"
                      value={createProjectForm.value}
                      onChange={(e) => setCreateProjectForm(prev => ({ ...prev, value: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter project value"
                      required
                    />
                  </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      rows={3}
                      value={createProjectForm.description}
                      onChange={(e) => setCreateProjectForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter project description"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={createProjectForm.location}
                      onChange={(e) => setCreateProjectForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter project location"
                      required
                    />
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Type *
                  </label>
                  <select
                    value={createProjectForm.type}
                    onChange={(e) => setCreateProjectForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="solar">Solar</option>
                    <option value="wind">Wind</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

              </div>

              {/* Assignment Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign Customer *
                    </label>
                    <select
                      value={createProjectForm.customerId}
                      onChange={(e) => setCreateProjectForm(prev => ({ ...prev, customerId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a customer</option>
                      {activeCustomers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} (Ref: {customer.customerRefNumber || 'N/A'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign Agent *
                    </label>
                    <select
                      value={createProjectForm.agentId}
                      onChange={(e) => setCreateProjectForm(prev => ({ ...prev, agentId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select an agent</option>
                      {activeAgents.map(agent => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Equipment Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Equipment Selection * ({createProjectForm.selectedEquipment.length} selected)
                </h3>
                <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                  {availableEquipment.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No equipment available in stock</p>
                  ) : (
                    <div className="p-4 space-y-2">
                      {availableEquipment.map(item => (
                        <label key={item.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={createProjectForm.selectedEquipment.includes(item.serialNumber)}
                            onChange={() => handleEquipmentToggle(item.serialNumber)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <Package className="w-4 h-4 text-gray-500" />
                          <span className="flex-1 text-sm">
                            <span className="font-mono font-medium">{item.serialNumber}</span>
                            <span className="text-gray-500 ml-2">- {item.model} ({item.equipmentType})</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateProject(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
