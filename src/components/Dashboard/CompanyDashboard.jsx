import React, { useState } from 'react';
import { useApp } from '../../hooks/useApp.js'
import { dbService, supabase } from '../../lib/supabase.js';
import InventoryManager from '../Common/InventoryManager.jsx';
import PerformanceChart from '../Common/PerformanceChart.jsx';
import TranslatedText from '../TranslatedText.jsx'; 
import LanguageSwitcher from '../../components/LanguageSwitcher.jsx';
import ProjectPipeline from '../Common/ProjectPipeline.jsx';
import GPSMap from '../Common/GPSMap.jsx';
import TeamsDisplay from '../Common/TeamsDisplay.jsx';
import ModeToggle from '../Common/ModeToggle.jsx';
//import TeamsDisplay from '../Common/TeamsDisplay.jsx';
import { PROJECT_STATUS, PIPELINE_STAGES, USER_STATUS, INVENTORY_STATUS } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';
import StatusUpdateModal from '../Common/StatusUpdateModal.jsx';
import { STAGE_LABELS, STAGE_COLORS, STAGE_PERMISSIONS } from '../../types/index.js';
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
  X,
  Eye,
  Settings,
  Trash2,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  UserPlus,
  User,     // ✅ ADD THIS
  Wrench,
  FileText,      // ADD THIS
  Download,
  Receipt  
} from 'lucide-react';

// --- Place at the top of your CompanyDashboard.jsx file ---
// (before function CompanyDashboard or export default ...)

function ReportsTable({ users, projects }) {
  const reportRoles = ["agent", "installer", "freelancer"];
  const reportUsers = users.filter(u => reportRoles.includes(u.role));

  function getProjectCount(user) {
    if (user.role === "agent") return projects.filter(p => p.agent_id === user.id).length;
    if (user.role === "installer") return projects.filter(p => p.installer_id === user.id).length;
    if (user.role === "freelancer")
      return projects.filter(p => p.metadata && p.metadata.freelancer_id === user.id).length;
    return 0;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Reports</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2 text-center">Total Projects</th>
            </tr>
          </thead>
          <tbody>
            {reportUsers.map(user => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2 capitalize">{user.role}</td>
                <td className="px-4 py-2 text-center">{getProjectCount(user)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {reportUsers.length === 0 && (
        <div className="text-center py-8">
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Reportable Users Found</h4>
          <p className="text-gray-600">No agents, installers, or freelancers are currently registered.</p>
        </div>
      )}
    </div>
  );
}



const CompanyDashboard = () => {
  const { t, currentLanguage } = useLanguage();
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
    createProject,
    approveProject,
    updateProject,
    assignInstallerToProject,
    markInstallationComplete,
    updateInventoryStatus,
    updateUserStatus,
    showToast 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(null);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [showAssignInstaller, setShowAssignInstaller] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [userFilter, setUserFilter] = useState('all');
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
const [selectedProjectForStatus, setSelectedProjectForStatus] = useState(null);
const [showTeamDetails, setShowTeamDetails] = useState(null); 
const [selectedInstaller, setSelectedInstaller] = useState('');
const [showCustomerDocs, setShowCustomerDocs] = useState(null);
const [showQuotationModal, setShowQuotationModal] = useState(null);
const [savingQuotation, setSavingQuotation] = useState(false);
const [showUploadDoc, setShowUploadDoc] = useState(null);
const [showUpdateDoc, setShowUpdateDoc] = useState(null);
const [uploadingDoc, setUploadingDoc] = useState(false);



const [createProjectForm, setCreateProjectForm] = useState({
  title: '',
  value: '',
  description: '',
  location: '',
  customerId: '',
  installerId: '', // Add this
  agentId: '',     // Keep this for agent assignment
  type: 'solar'
  // Remove selectedEquipment array
});
 const pendingAdminReview = projects.filter(p => 
  p.status === 'pending_admin_review' && 
  p.metadata?.requires_admin_review === true &&
  p.metadata?.agent_enhanced === true
);

  const pendingUsers = users.filter(u => u.status === USER_STATUS.PENDING);
  const activeProjects = projects.filter(p => p.status === PROJECT_STATUS.IN_PROGRESS);
  const completedProjects = projects.filter(p => p.status === PROJECT_STATUS.COMPLETED);
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const activeStaff = users.filter(u => u.status === USER_STATUS.ACTIVE && u.role !== 'customer');
  const activeCustomers = users.filter(u => u.status === USER_STATUS.ACTIVE && u.role === 'customer');
  const activeAgents = users.filter(u => u.status === USER_STATUS.ACTIVE && u.role === 'agent');
  const availableEquipment = inventory.filter(i => i.status === INVENTORY_STATUS.IN_STOCK);
  const availableInstallers = users.filter(u => 
    (u.role === 'installer' || u.role === 'technician') && 
    u.status === 'active'
  );
  
  const inventoryStats = {
    total: inventory.length,
    inStock: inventory.filter(i => i.status === INVENTORY_STATUS.IN_STOCK).length,
    assigned: inventory.filter(i => i.status === INVENTORY_STATUS.ASSIGNED).length,
    installed: inventory.filter(i => i.status === INVENTORY_STATUS.INSTALLED).length,
    totalValue: inventory.reduce((sum, i) => sum + (i.cost || 0), 0)
  };

  // const filteredUsers = users.filter(user => {
  //   if (userFilter === 'all') return true;
  //   if (userFilter === 'active') return user.status === 'active';
  //   if (userFilter === 'inactive') return user.status === 'inactive';
  //   return true;
  // });
  const filteredUsers = users.filter(user => {
    if (userFilter === "all") return true;
    if (userFilter === "active") return user.status === "active";
    if (userFilter === "inactive") return user.status === "inactive";
    if (userFilter === "installer") return user.role === "installer";
    if (userFilter === "agent") return user.role === "agent";
    if (userFilter === "customer") return user.role === "customer";
    return true;
  });

  // ===== HANDLERS =====
// In CompanyDashboard.jsx and AgentDashboard.jsx
const handleUpdateProjectStatus = async (projectId, statusUpdate) => {
  try {
    console.log('📊 Updating project status:', { projectId, statusUpdate });
    
    // Call updateProject which will handle both database and local state
    await updateProject(projectId, statusUpdate);
    
    showToast('Project status updated successfully!');
    
    // If in live mode, refresh the projects to get the latest data
    if (isLiveMode && dbService?.isAvailable()) {
      try {
        const updatedProjects = await dbService.getProjects();
        dispatch({ type: 'SET_PROJECTS', payload: updatedProjects });
      } catch (reloadError) {
        console.error('Failed to reload projects after update:', reloadError);
      }
    }
  } catch (error) {
    console.error('❌ Error updating project status:', error);
    showToast('Error updating project status: ' + error.message, 'error');
  }
};
  const handleApproveUser = async (userId, role) => {
    try {
      await updateUserStatus(userId, 'active', role);
      showToast(t('userApprovedSuccess')); 
    } catch (error) {
      console.error('Error approving user:', error);
      showToast(`${t('errorApprovingUser')}: ${error.message}`, 'error');
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      await updateUserStatus(userId, 'rejected');
      showToast(t('userRejected'));
    } catch (error) {
      console.error('Error rejecting user:', error);
      showToast(`${t('errorRejectingUser')}: ${error.message}`, 'error');
    }
  };

  // Admin approval for both project flows
const handleAdminApprove = async (project) => {
  try {
    await approveProject(project.id, {
      status: 'approved',
      pipeline_stage: 'approved',
      installation_approved: true,
      metadata: {
        ...project.metadata,
        admin_approved: true,
        admin_approved_at: new Date().toISOString(),
        fully_approved: true,
        requires_admin_review: false,
        ready_for_installer_assignment: true,
        flow_stage: 'admin_approved'
      }
    });
    showToast('Project approved! You can now assign an installer.', 'success');
  } catch (error) {
    showToast('Error approving project: ' + error.message, 'error');
  }
};
// Handle quotation save
const handleSaveQuotation = async (e) => {
  e.preventDefault();
  if (!showQuotationModal) return;
  
  setSavingQuotation(true);
  const formData = new FormData(e.target);
  
  try {
    const quotationData = {
      total_amount: parseFloat(formData.get('totalAmount')) || 0,
      breakdown: {},
      created_at: new Date().toISOString(),
      created_by: currentUser.id,
      created_by_name: currentUser.name
    };
    
    // Add freelancer amount if exists
    if (showQuotationModal.metadata?.freelancer_id) {
      quotationData.breakdown.freelancer = {
        id: showQuotationModal.metadata.freelancer_id,
        name: showQuotationModal.metadata.freelancer_name,
        amount: parseFloat(formData.get('freelancerAmount')) || 0
      };
    }
    
    // Add agent amount if exists
    if (showQuotationModal.metadata?.agent_id || showQuotationModal.agent_id) {
      quotationData.breakdown.agent = {
        id: showQuotationModal.metadata?.agent_id || showQuotationModal.agent_id,
        name: showQuotationModal.metadata?.agent_name || showQuotationModal.agent_name,
        amount: parseFloat(formData.get('agentAmount')) || 0
      };
    }
    
    // Add installer amount if exists
    if (showQuotationModal.installer_id) {
      quotationData.breakdown.installer = {
        id: showQuotationModal.installer_id,
        name: showQuotationModal.installer_name,
        amount: parseFloat(formData.get('installerAmount')) || 0
      };
    }
    
    // Update project with quotation
    await updateProject(showQuotationModal.id, {
      metadata: {
        ...showQuotationModal.metadata,
        quotation: quotationData
      }
    });
    
    showToast('Quotation saved successfully', 'success');
    setShowQuotationModal(null);
  } catch (error) {
    showToast('Failed to save quotation', 'error');
    console.error('Quotation save error:', error);
  } finally {
    setSavingQuotation(false);
  }
};
  const handleAdminReject = async (projectId) => {
    try {
      await updateProject(projectId, {
        status: 'admin_rejected',
        pipeline_stage: 'admin_rejected',
        metadata: {
          admin_rejected_by: currentUser.id,
          admin_rejected_date: new Date().toISOString()
        }
      });
      showToast('Project rejected. Relevant parties will be notified.');
    } catch (error) {
      showToast('Error rejecting project: ' + error.message, 'error');
    }
  };

  // Flow #1: Admin creates project directly
const handleCreateProject = async (e) => {
  e.preventDefault();
  
  if (!createProjectForm.title || !createProjectForm.value || !createProjectForm.description || 
      !createProjectForm.location || !createProjectForm.customerId || !createProjectForm.agentId || 
      !createProjectForm.installerId) {
    showToast(t('pleaseFillFields'), 'error'); 
    return;
  }

  try {
    const customer = users.find(u => u.id === createProjectForm.customerId);
    const agent = users.find(u => u.id === createProjectForm.agentId);
    const installer = users.find(u => u.id === createProjectForm.installerId);

    const projectData = {
      title: createProjectForm.title,
      value: parseFloat(createProjectForm.value),
      description: createProjectForm.description,
      location: createProjectForm.location,
      customer_id: createProjectForm.customerId,
      customer_name: customer.name,
      agent_id: createProjectForm.agentId,
      assigned_to: createProjectForm.agentId,
      assigned_to_name: agent.name,
      installer_id: createProjectForm.installerId,
      installer_name: installer.name,
      installer_assigned: true, // Set to true immediately
      status: PROJECT_STATUS.APPROVED,
      pipeline_stage: PIPELINE_STAGES.INSTALLER_ASSIGNED, // Change to installer assigned
      type: createProjectForm.type,
      installation_approved: true,
      installation_complete: false,
      metadata: {
        created_by_role: 'company',
        project_source: 'admin',
        flow_type: 'admin_direct',
        admin_approved: true,
        admin_approved_at: new Date().toISOString()
      }
    };

    const newProject = await createProject(projectData);
    showToast(t('projectCreatedSuccess'));
    setShowCreateProject(false);
    setCreateProjectForm({
      title: '',
      value: '',
      description: '',
      location: '',
      customerId: '',
      agentId: '',
      installerId: '',
      type: 'solar'
    });

    if (isLiveMode) {
      try {
        const updatedProjects = await dbService.getProjects();
        dispatch({ type: 'SET_PROJECTS', payload: updatedProjects });
      } catch (reloadError) {
        console.error('Failed to reload projects:', reloadError);
      }
    }
    
  } catch (error) {
    console.error('Error creating project:', error);
    showToast(`${t('errorCreatingProject')}: ${error.message}`, 'error');
  }
};

  // Flow #1: Admin project editing
  const handleEditProjectAsAdmin = (project) => {
    setEditingProject({
      id: project.id,
      title: project.title,
      description: project.description,
      location: project.location,
      value: project.value,
      type: project.type || 'solar'
    });
    setShowEditProject(true);
  };

  const handleEditCustomerAsAdmin = (project) => {
    const customer = users.find(u => 
      u.id === project.customer_id || u.id === project.customerId
    );
    
    if (customer) {
      setEditingCustomer({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address || '',
        pincode: customer.pincode || '',
        serviceNumber: customer.serviceNumber || '',
        moduleType: customer.moduleType || '',
        kwCapacity: customer.kwCapacity || '',
        houseType: customer.houseType || '',
        floors: customer.floors || '',
        remarks: customer.remarks || ''
      });
      setShowEditCustomer(true);
    } else {
      showToast('Customer details not found', 'error');
    }
  };

  const handleSaveProjectEditsAsAdmin = async () => {
    try {
      await updateProject(editingProject.id, {
        title: editingProject.title,
        description: editingProject.description,
        location: editingProject.location,
        value: editingProject.value,
        type: editingProject.type
      });
      
      showToast('Project details updated successfully!');
      setShowEditProject(false);
      setEditingProject(null);
    } catch (error) {
      showToast('Error updating project: ' + error.message, 'error');
    }
  };

  const handleSaveCustomerEditsAsAdmin = async () => {
    try {
      await updateUserStatus(editingCustomer.id, 'active', 'customer');
      showToast('Customer details updated successfully!');
      setShowEditCustomer(false);
      setEditingCustomer(null);
    } catch (error) {
      showToast('Error updating customer: ' + error.message, 'error');
    }
  };

//const handleAssignInstallerAsAdmin = async (projectId, installerId) => {
 // const installer = availableInstallers.find(i => i.id === installerId);
  
  //if (!installer) {
    //showToast('Installer not found', 'error');
    //return;
  //}

 // try {
  //  await assignInstallerToProject(projectId, installerId, installer.name);
    
   // await updateProject(projectId, {
     // pipeline_stage: 'installer_assigned',
     // installer_assigned: true,
     // status: 'in_progress',
     // metadata: {
     //   installer_assigned_at: new Date().toISOString(),
      //  flow_stage: 'installer_assigned'
     // }
   // });
    
 //   showToast(`Installer ${installer.name} assigned successfully! Project is now active.`);
 // } catch (error) {
  //  showToast('Error assigning installer: ' + error.message, 'error');
 // }
  
 // setShowAssignInstaller(false);
 // setSelectedProject(null);
//};
const handleAssignInstallerAsAdmin = async (projectId, installerId) => {
  const installer = availableInstallers.find(i => i.id === installerId);
  
  if (!installer) {
    showToast('Installer not found', 'error');
    return;
  }

  try {
    await assignInstallerToProject(projectId, installerId, installer.name);
    
    await updateProject(projectId, {
      pipeline_stage: 'installer_assigned',
      installer_assigned: true,
      status: 'in_progress',
      metadata: {
        installer_assigned_at: new Date().toISOString(),
        flow_stage: 'installer_assigned'
      }
    });
    
    showToast(`Installer ${installer.name} assigned successfully! Project is now active.`);
    setShowAssignInstaller(false);
    setSelectedProject(null);
  } catch (error) {
    showToast('Error assigning installer: ' + error.message, 'error');
  }
};
  const handleDeactivateUser = async (user) => {
    if (confirm(`Are you sure you want to deactivate ${user.name}?`)) {
      try {
        await updateUserStatus(user.id, 'inactive');
        showToast(`${user.name} has been deactivated`);
      } catch (error) {
        showToast('Error deactivating user: ' + error.message, 'error');
      }
    }
  };

  const handleReactivateUser = async (user) => {
    if (confirm(`Are you sure you want to reactivate ${user.name}?`)) {
      try {
        await updateUserStatus(user.id, 'active');
        showToast(`${user.name} has been reactivated`);
      } catch (error) {
        showToast('Error reactivating user: ' + error.message, 'error');
      }
    }
  };

  const handleDeleteUser = async (user) => {
    if (confirm(`Are you sure you want to permanently delete ${user.name}?`)) {
      alert('Delete functionality coming soon');
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
          <h1 className="text-2xl font-bold text-gray-900">
            {t('companyDashboard')} 
          </h1>
          <p className="text-gray-600">
            {t('manageOperations')}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <ModeToggle 
            isLiveMode={isLiveMode} 
            onToggle={toggleMode}
            size="normal"
            showLabels={true}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('totalProjects')}
          value={projects.length}
          icon={Briefcase}
          color="bg-blue-500"
          subtitle={`${activeProjects.length} ${t('active')}`}
          trend={`+12% ${t('thisMonth')}`}
        />
        <StatCard
          title={t('pendingAdminReview')}
          value={pendingAdminReview.length}
          icon={AlertTriangle}
          color="bg-orange-500"
          subtitle={`${pendingUsers.length} ${t('userApprovals')}`}
        />
        <StatCard
          title={t('totalRevenue')}
          value={`â‚¹${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-purple-500"
          subtitle={t('fromCompletedProjects')}
          trend={`+8% ${t('thisMonth')}`}
        />
        <StatCard
          title={t('inventoryItems')}
          value={inventoryStats.total}
          icon={Package}
          color="bg-green-500"
          subtitle={`â‚¹${inventoryStats.totalValue.toLocaleString()} ${t('totalValue')}`}
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
              {t('overview')}
            </button>
            <button
              onClick={() => setActiveTab('admin-review')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'admin-review'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('adminReview')} ({pendingAdminReview.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'projects'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('projectManagement')}
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'inventory'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('inventoryManagement')}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('userManagement')}
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'teams'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <UserCheck className="h-4 w-4 mr-2 inline" />
              {t('teams')}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('analytics')}
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'tracking'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('staffTracking')}
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeTab === "reports" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
            >
              Reports
            </button>

          </div>
        </div>


        {activeTab === "reports" && (
          <ReportsTable users={users} projects={projects} />
        )}


        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Pending Admin Reviews Alert */}
              {pendingAdminReview.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-orange-900">
                        {pendingAdminReview.length} project{pendingAdminReview.length > 1 ? 's' : ''} awaiting admin review
                      </h4>
                      <p className="text-sm text-orange-700">
                        Projects from agents/freelancers that need final admin approval.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('admin-review')}
                      className="ml-auto px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                    >
                      Review Now
                    </button>
                  </div>
                </div>
              )}

              {/* Pending User Approvals Alert */}
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
                  <h4 className="font-medium text-blue-900">{t('activeProjects')}</h4>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{activeProjects.length}</p>
                  <p className="text-sm text-blue-700">{t('inProgress')}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900">{t('completedProjects')}</h4>
                  <p className="text-2xl font-bold text-green-600 mt-2">{completedProjects.length}</p>
                  <p className="text-sm text-green-700">{t('thisMonth')}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900">{t('inventoryValue')}</h4>
                  <p className="text-2xl font-bold text-purple-600 mt-2">â‚¹{inventoryStats.totalValue.toLocaleString()}</p>
                  <p className="text-sm text-purple-700">{inventoryStats.total} items</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900">{t('openComplaints')}</h4>
                  <p className="text-2xl font-bold text-orange-600 mt-2">
                    {complaints.filter(c => c.status === 'open').length}
                  </p>
                  <p className="text-sm text-orange-700">{t('needAttention')}</p>
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
{activeTab === 'admin-review' && (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">Projects Enhanced by Agents ({pendingAdminReview.length})</h3>
    {pendingAdminReview.map((project) => (
      <div key={project.id} className="border border-orange-200 rounded-lg p-6 bg-orange-50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
              <div className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Enhanced by Agent: {project.metadata?.agent_name || 'Unknown'}
              </div>
              <div className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                From Freelancer: {project.metadata?.freelancer_name || 'Unknown'}
              </div>
            </div>
            <p className="text-gray-600 mt-1">{project.description}</p>
            
            {/* Project Details Grid */}
<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3 text-sm bg-white p-4 rounded-lg">
  <div>
    <span className="font-medium text-gray-700">Customer:</span>
    <p>{project.customer_name}</p>
  </div>
  <div>
    <span className="font-medium text-gray-700">Phone:</span>
    <p>{project.customer_phone}</p>
  </div>
  <div>
    <span className="font-medium text-gray-700">Project Value:</span>
    <p className="font-bold text-green-600">₹{project.value?.toLocaleString() || '0'}</p>
  </div>
  <div>
    <span className="font-medium text-gray-700">Location:</span>
    <p>{project.location}</p>
  </div>
  <div>
    <span className="font-medium text-gray-700">Pincode:</span>
    <p>{project.pincode}</p>
  </div>
  <div>
    <span className="font-medium text-gray-700">Type:</span>
    <p className="capitalize">{project.type}</p>
  </div>
  
  {/* ✅ NEW: Show Freelancer Info */}
  {project.metadata?.freelancer_name && (
    <div>
      <span className="font-medium text-gray-700">Freelancer:</span>
      <p className="text-blue-600">{project.metadata.freelancer_name}</p>
    </div>
  )}
  
  {/* ✅ NEW: Show Agent Info */}
  {project.metadata?.agent_name && (
    <div>
      <span className="font-medium text-gray-700">Agent:</span>
      <p className="text-green-600">{project.metadata.agent_name}</p>
    </div>
  )}
</div>
            
            {/* Timeline */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs">
              <div className="font-medium text-gray-700 mb-2">Project Timeline:</div>
              <div className="space-y-1 text-gray-600">
                <div>Created by: {project.metadata?.freelancer_name} on {new Date(project.created_at).toLocaleDateString()}</div>
                <div>Enhanced by: {project.metadata?.agent_name} on {new Date(project.metadata?.agent_enhanced_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => {
              const customer = users.find(u => u.id === project.customer_id);
              setShowCustomerDetails(customer);
            }}
            className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Customer Details
          </button>
          <button
  onClick={() => setShowTeamDetails(project)}
  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
>
  <Users className="w-4 h-4 mr-2" />
  View Team
</button>
          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={() => handleAdminReject(project.id)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Reject
            </button>
            
            <button
              onClick={() => handleAdminApprove(project)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Approve Project
            </button>
          </div>
        </div>

        {/* Show assign installer button if project is approved */}
        {project.status === 'approved' && !project.installer_assigned && (
          <div className="mt-4 pt-4 border-t border-orange-200">
            <button
              onClick={() => {
                setSelectedProject(project);
                setSelectedInstaller('');
                setShowAssignInstaller(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Assign Installer
            </button>
          </div>
        )}

        {/* Show installer assigned status */}
        {project.installer_assigned && (
          <div className="mt-4 pt-4 border-t border-orange-200">
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-green-700 font-medium">
                Installer Assigned: {project.installer_name}
              </span>
            </div>
          </div>
        )}
      </div>
    ))}
    
    {pendingAdminReview.length === 0 && (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h4 className="font-medium text-gray-900 mb-2">No Projects Pending Review</h4>
        <p className="text-gray-600">All agent-enhanced projects have been reviewed.</p>
      </div>
    )}
  </div>
)}

{activeTab === 'teams' && (
  <div className="space-y-6">
    <TeamsDisplay />
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
    
    {/* Approved Projects Section */}
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h4 className="font-medium text-green-900 mb-3">
        Approved Projects ({projects.filter(p => p.status === 'approved' || p.status === 'in_progress').length})
      </h4>
      <div className="grid gap-4">
        {projects.filter(p => p.status === 'approved' || p.status === 'in_progress').map(project => (
          <div key={project.id} className="bg-white border border-green-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h5 className="font-medium text-gray-900">{project.title}</h5>
                  {project.installer_assigned && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      Installer: {project.installer_name}
                    </span>
                  )}
                  {project.installation_complete && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Installation Complete
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                  <div>Customer: {project.customer_name}</div>
                  <div>Value: â‚¹{project.value?.toLocaleString()}</div>
                  <div>Location: {project.location}</div>
                  <div>Status: {project.status}</div>
                </div>
              </div>
            </div>
            
            {project.status === 'approved' && !project.installer_assigned && (
  <button
    onClick={() => {
      console.log('🔧 Assign Installer clicked for project:', project.id);
      console.log('📋 Project details:', project);
      console.log('👷 Available installers:', availableInstallers.length);
      setSelectedProject(project);
      setShowAssignInstaller(true);
      console.log('✅ Modal should now be visible');
    }}
    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
  >
    Assign Installer
  </button>
)}
          </div>
        ))}
      </div>
    </div>
    
{/* All Projects List */}
    <div className="grid gap-6">
      {projects.map(project => (
        <div key={project.id} className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  STAGE_COLORS[project.pipeline_stage] || 'bg-gray-100 text-gray-800'
                }`}>
                  {STAGE_LABELS[project.pipeline_stage] || 'Unknown Status'}
                </span>
              </div>
              <p className="text-gray-600 mt-1">{project.description}</p>
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
  <span>Customer: {project.customer_name}</span>
  <span>Value: ₹{project.value?.toLocaleString()}</span>
  <span>Location: {project.location}</span>
  
  {/* ✅ NEW: Show Team Members */}
  {project.metadata?.freelancer_name && (
    <span className="text-blue-600">
      Freelancer: {project.metadata.freelancer_name}
    </span>
  )}
  {project.metadata?.agent_name && (
    <span className="text-green-600">
      Agent: {project.metadata.agent_name}
    </span>
  )}
  {project.installer_name && (
    <span className="text-purple-600">
      Installer: {project.installer_name}
    </span>
  )}
</div>
            </div>
          </div>
          
          {/* Action buttons */}
          {/* Action buttons */}
<div className="flex items-center space-x-3 mt-4">
  <button
    onClick={() => {
      setSelectedProjectForStatus(project);
      setShowStatusUpdate(true);
    }}
    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
  >
    Update Status
  </button>
  
  <button
    onClick={() => handleEditProjectAsAdmin(project)}
    className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
  >
    <Edit3 className="w-4 h-4 mr-2" />
    Edit
  </button>
  
  {/* ADD THIS NEW QUOTATION BUTTON */}
  <button
    onClick={() => setShowQuotationModal(project)}
    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
    title="Manage Quotation"
  >
    <Receipt className="w-4 h-4 mr-2" />
    Quotation
  </button>
</div>

          {/* Status History */}
          {project.metadata?.status_history && project.metadata.status_history.length > 0 && (
            <div className="mt-4 bg-gray-50 rounded-lg p-3">
              <h6 className="font-medium text-gray-900 mb-2 text-sm">Recent Status Updates</h6>
              <div className="space-y-1">
                {project.metadata.status_history.slice(-2).map((history, index) => (
                  <div key={index} className="text-xs text-gray-600">
                    <span className="font-medium">{STAGE_LABELS[history.stage]}</span> - {history.updated_by}
                    {history.comment && <span className="italic"> • "{history.comment}"</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
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
    {user.requested_role || user.requestedRole || 'Not specified'}
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
  defaultValue={user.requested_role || user.requestedRole || 'agent'}
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
  onClick={() => handleApproveUser(user.id, user.requested_role || user.requestedRole || 'agent')}
  className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
>
                              <UserCheck className="w-4 h-4 mr-1" />
                              {t('approve')}
                            </button>
                            <button
                              onClick={() => handleRejectUser(user.id)}
                              className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              {t('reject')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Pending Approvals */}
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
                              {t('approve')}
                            </button>
                            <button
                              onClick={() => handleRejectUser(user.id)}
                              className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              {t('reject')}
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
              {/* <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
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
              </div> */}
              <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
  <span className="text-sm font-medium text-gray-700">Filter by status & role</span>
  <div className="flex space-x-2">
    {/* Status Filter Buttons */}
    <button onClick={() => setUserFilter("all")}
      className={`px-3 py-1 rounded-full text-xs font-medium ${userFilter === "all" ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>
      All Users
    </button>
    <button onClick={() => setUserFilter("active")}
      className={`px-3 py-1 rounded-full text-xs font-medium ${userFilter === "active" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>
      Active
    </button>
    <button onClick={() => setUserFilter("inactive")}
      className={`px-3 py-1 rounded-full text-xs font-medium ${userFilter === "inactive" ? "bg-red-100 text-red-800" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>
      Inactive
    </button>
    {/* Role Filter Buttons */}
    <button onClick={() => setUserFilter("installer")}
      className={`px-3 py-1 rounded-full text-xs font-medium ${userFilter === "installer" ? "bg-purple-100 text-purple-800" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>
      Installers
    </button>
    <button onClick={() => setUserFilter("agent")}
      className={`px-3 py-1 rounded-full text-xs font-medium ${userFilter === "agent" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>
      Agents
    </button>
    <button onClick={() => setUserFilter("customer")}
      className={`px-3 py-1 rounded-full text-xs font-medium ${userFilter === "customer" ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>
      Customers
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
                                
                                
                                {/* ADD THESE BUTTONS FOR CUSTOMERS ONLY */}
                                {user.role === 'customer' && (
                                  <>
                                    {/* View Documents Button */}
                                    <button
                                      onClick={async () => {
                                        try {
                                          const customerWithDocs = await dbService.getCustomerWithDocs(user.id);
                                          setShowCustomerDocs(customerWithDocs);
                                        } catch (error) {
                                          showToast('Failed to load documents', 'error');
                                          console.error(error);
                                        }
                                      }}
                                      className="text-purple-600 hover:text-purple-900 p-1"
                                      title="View Documents"
                                    >
                                      <FileText className="w-4 h-4" />
                                    </button>

                                    {/* Download Customer Details Button */}
                                    <button
                                      onClick={() => {
                                        const customerData = user.customer_data || {};
                                        const csvRows = [
                                          ['Field', 'Value'],
                                          ['Name', user.name || ''],
                                          ['Email', user.email || ''],
                                          ['Phone', user.phone || ''],
                                          ['Location', user.location || ''],
                                          ['Pincode', user.pincode || ''],
                                          ['Address', user.address || ''],
                                          ['Customer Ref', user.customer_ref_number || ''],
                                          ['Service Number', customerData.serviceNumber || ''],
                                          ['KW Capacity', customerData.kwCapacity || ''],
                                          ['Module Type', customerData.moduleType || ''],
                                          ['House Type', customerData.houseType || ''],
                                          ['Floors', customerData.floors || ''],
                                          ['Remarks', customerData.remarks || '']
                                        ];
                                        
                                        const csv = csvRows.map(row => 
                                          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
                                        ).join('\n');
                                        
                                        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = `customer_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(url);
                                        showToast('Customer details downloaded', 'success');
                                      }}
                                      className="text-green-600 hover:text-green-900 p-1"
                                      title="Download Customer Details"
                                    >
                                      <Download className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                {/* END OF ADDED CUSTOMER BUTTONS */}
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
                  <p>â€¢ <strong>Active:</strong> User can login and access the system</p>
                  <p>â€¢ <strong>Inactive:</strong> User account is disabled but data is preserved</p>
                  <p>â€¢ <strong>Pending:</strong> Professional registration awaiting approval</p>
                  <p>â€¢ <strong>Rejected:</strong> Registration was denied</p>
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
                        â‚¹{projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.value || 0), 0) / projects.length).toLocaleString() : 0}
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

      {/* Create Project Modal (Flow #1) */}
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
                    value={createProjectForm.title}
                    onChange={(e) => setCreateProjectForm({...createProjectForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Value (â‚¹) *
                  </label>
                  <input
                    type="number"
                    value={createProjectForm.value}
                    onChange={(e) => setCreateProjectForm({...createProjectForm, value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={createProjectForm.description}
                  onChange={(e) => setCreateProjectForm({...createProjectForm, description: e.target.value})}
                  rows="3"
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
                  value={createProjectForm.location}
                  onChange={(e) => setCreateProjectForm({...createProjectForm, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Type *
                </label>
                <select
                  value={createProjectForm.type}
                  onChange={(e) => setCreateProjectForm({...createProjectForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="solar">Solar Installation</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="repair">Repair</option>
                  <option value="upgrade">System Upgrade</option>
                </select>
              </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Customer *
    </label>
    <select
      value={createProjectForm.customerId}
      onChange={(e) => setCreateProjectForm({...createProjectForm, customerId: e.target.value})}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      required
    >
      <option value="">Select Customer</option>
      {activeCustomers.map(customer => (
        <option key={customer.id} value={customer.id}>
          {customer.name} - {customer.email}
        </option>
      ))}
    </select>
  </div>
  
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Assign Agent *
    </label>
    <select
      value={createProjectForm.agentId}
      onChange={(e) => setCreateProjectForm({...createProjectForm, agentId: e.target.value})}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      required
    >
      <option value="">Select Agent</option>
      {activeAgents.map(agent => (
        <option key={agent.id} value={agent.id}>
          {agent.name} - {agent.email}
        </option>
      ))}
    </select>
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Assign Installer *
    </label>
    <select
      value={createProjectForm.installerId}
      onChange={(e) => setCreateProjectForm({...createProjectForm, installerId: e.target.value})}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      required
    >
      <option value="">Select Installer</option>
      {availableInstallers.map(installer => (
        <option key={installer.id} value={installer.id}>
          {installer.name} - {installer.role}
        </option>
      ))}
    </select>
  </div>
</div>


              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateProject(false);
                    setCreateProjectForm({
                      title: '',
                      value: '',
                      description: '',
                      location: '',
                      customerId: '',
                      agentId: '',
                      installerId: '',
                      type: 'solar'
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditProject && editingProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Project Details</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Value (â‚¹) *
                  </label>
                  <input
                    type="number"
                    value={editingProject.value}
                    onChange={(e) => setEditingProject({...editingProject, value: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                  rows="3"
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
                  value={editingProject.location}
                  onChange={(e) => setEditingProject({...editingProject, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Type
                </label>
                <select
                  value={editingProject.type || 'solar'}
                  onChange={(e) => setEditingProject({...editingProject, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="solar">Solar Installation</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="repair">Repair</option>
                  <option value="upgrade">System Upgrade</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProject(false);
                    setEditingProject(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProjectEditsAsAdmin}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditCustomer && editingCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Customer Details</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editingCustomer.email}
                    onChange={(e) => setEditingCustomer({...editingCustomer, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.pincode}
                    onChange={(e) => setEditingCustomer({...editingCustomer, pincode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={editingCustomer.address}
                  onChange={(e) => setEditingCustomer({...editingCustomer, address: e.target.value})}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditCustomer(false);
                    setEditingCustomer(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomerEditsAsAdmin}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

{/* Assign Installer Modal */}
{showAssignInstaller && selectedProject && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-[100]">
    <div className="bg-white rounded-lg max-w-md w-full p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Installer</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Project: <strong>{selectedProject.title}</strong></p>
        <p className="text-sm text-gray-600">Customer: <strong>{selectedProject.customer_name}</strong></p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Installer *
        </label>
        <select
          value={selectedInstaller}
          onChange={(e) => setSelectedInstaller(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Choose an installer...</option>
          {availableInstallers.map(installer => (
            <option key={installer.id} value={installer.id}>
              {installer.name} - {installer.role}
            </option>
          ))}
        </select>
        
        {availableInstallers.length === 0 && (
          <p className="text-sm text-red-600 mt-2">No installers available. Please register installers first.</p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            setShowAssignInstaller(false);
            setSelectedProject(null);
            setSelectedInstaller('');
          }}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            if (!selectedInstaller) {
              showToast('Please select an installer', 'error');
              return;
            }
            handleAssignInstallerAsAdmin(selectedProject.id, selectedInstaller);
          }}
          disabled={!selectedInstaller}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Assign Installer
        </button>
      </div>
    </div>
  </div>
)}
<StatusUpdateModal
  isOpen={showStatusUpdate}
  onClose={() => setShowStatusUpdate(false)}
  project={selectedProjectForStatus}
  currentUser={currentUser}
  onUpdate={handleUpdateProjectStatus}
/>
      {/* Customer Details Modal */}
      {showCustomerDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{showCustomerDetails.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{showCustomerDetails.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{showCustomerDetails.phone || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Reference</label>
                  <p className="mt-1 text-sm text-gray-900">{showCustomerDetails.customerRefNumber || 'Not set'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900">{showCustomerDetails.address || showCustomerDetails.location || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pincode</label>
                  <p className="mt-1 text-sm text-gray-900">{showCustomerDetails.pincode || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service Number</label>
                  <p className="mt-1 text-sm text-gray-900">{showCustomerDetails.serviceNumber || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Module Type</label>
                  <p className="mt-1 text-sm text-gray-900">{showCustomerDetails.moduleType || 'Not specified'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">KW Capacity</label>
                  <p className="mt-1 text-sm text-gray-900">{showCustomerDetails.kwCapacity || 'Not specified'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">House Type</label>
                  <p className="mt-1 text-sm text-gray-900">{showCustomerDetails.houseType || 'Not specified'}</p>
                </div>
              </div>
            </div>
            
            {showCustomerDetails.remarks && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">Remarks</label>
                <p className="mt-1 text-sm text-gray-900">{showCustomerDetails.remarks}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => setShowCustomerDetails(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Team Details Modal */}
{showTeamDetails && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Team Details</h3>
      
      <div className="space-y-6">
        {/* Project Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">{showTeamDetails.title}</h4>
          <p className="text-sm text-blue-700">Status: {STAGE_LABELS[showTeamDetails.pipeline_stage]}</p>
          <p className="text-sm text-blue-700">Value: ₹{showTeamDetails.value?.toLocaleString()}</p>
        </div>

        {/* Customer Details */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <User className="w-5 h-5 text-gray-600 mr-2" />
            <h4 className="font-medium text-gray-900">Customer</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <span className="ml-2">{showTeamDetails.customer_name}</span>
            </div>
            {showTeamDetails.customer_phone && (
              <div>
                <span className="font-medium text-gray-700">Phone:</span>
                <span className="ml-2">{showTeamDetails.customer_phone}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Location:</span>
              <span className="ml-2">{showTeamDetails.location}</span>
            </div>
          </div>
        </div>

        {/* Freelancer Details */}
        {showTeamDetails.metadata?.freelancer_name && (
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center mb-3">
              <UserPlus className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-blue-900">Freelancer (Project Creator)</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-blue-800">Name:</span>
                <span className="ml-2 text-blue-700">{showTeamDetails.metadata.freelancer_name}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Created:</span>
                <span className="ml-2 text-blue-700">
                  {new Date(showTeamDetails.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Agent Details */}
        {showTeamDetails.metadata?.agent_name && (
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <div className="flex items-center mb-3">
              <Users className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="font-medium text-green-900">Agent (Project Manager)</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-green-800">Name:</span>
                <span className="ml-2 text-green-700">{showTeamDetails.metadata.agent_name}</span>
              </div>
              {showTeamDetails.metadata.agent_enhanced_at && (
                <div>
                  <span className="font-medium text-green-800">Enhanced:</span>
                  <span className="ml-2 text-green-700">
                    {new Date(showTeamDetails.metadata.agent_enhanced_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Installer Details */}
        {showTeamDetails.installer_name && (
          <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
            <div className="flex items-center mb-3">
              <Wrench className="w-5 h-5 text-purple-600 mr-2" />
              <h4 className="font-medium text-purple-900">Installer</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-purple-800">Name:</span>
                <span className="ml-2 text-purple-700">{showTeamDetails.installer_name}</span>
              </div>
              {showTeamDetails.installer_assigned && (
                <div>
                  <span className="font-medium text-purple-800">Status:</span>
                  <span className="ml-2 text-purple-700">
                    {showTeamDetails.installation_complete ? 'Installation Complete' : 'Assigned'}
                  </span>
                </div>
              )}
              {showTeamDetails.completion_date && (
                <div>
                  <span className="font-medium text-purple-800">Completed:</span>
                  <span className="ml-2 text-purple-700">{showTeamDetails.completion_date}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Project Flow Timeline */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Project Flow</h4>
          <div className="space-y-2 text-sm">
            {showTeamDetails.metadata?.freelancer_name && (
              <div className="flex items-center text-blue-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Created by {showTeamDetails.metadata.freelancer_name}</span>
              </div>
            )}
            {showTeamDetails.metadata?.agent_enhanced && (
              <div className="flex items-center text-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Enhanced by {showTeamDetails.metadata.agent_name}</span>
              </div>
            )}
            {showTeamDetails.metadata?.admin_approved && (
              <div className="flex items-center text-purple-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Approved by Admin</span>
              </div>
            )}
            {showTeamDetails.installer_assigned && (
              <div className="flex items-center text-orange-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Assigned to {showTeamDetails.installer_name}</span>
              </div>
            )}
            {showTeamDetails.installation_complete && (
              <div className="flex items-center text-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Installation Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6">
        <button
          type="button"
          onClick={() => setShowTeamDetails(null)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
{/* Quotation Modal */}
{showQuotationModal && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Manage Quotation</h3>
          <p className="text-sm text-gray-600 mt-1">{showQuotationModal.title}</p>
        </div>
        <button
          onClick={() => setShowQuotationModal(null)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Show existing quotation if available */}
      {showQuotationModal.metadata?.quotation && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Receipt className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="font-semibold text-blue-900">Current Quotation</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Total Project Value:</span>
              <span className="font-bold text-blue-900">
                ₹{showQuotationModal.metadata.quotation.total_amount?.toLocaleString()}
              </span>
            </div>
            {showQuotationModal.metadata.quotation.breakdown && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="font-medium text-gray-700 mb-2">Commission Breakdown:</p>
                {showQuotationModal.metadata.quotation.breakdown.freelancer && (
                  <div className="flex justify-between text-gray-600">
                    <span>Freelancer ({showQuotationModal.metadata.quotation.breakdown.freelancer.name}):</span>
                    <span className="font-medium">₹{showQuotationModal.metadata.quotation.breakdown.freelancer.amount?.toLocaleString()}</span>
                  </div>
                )}
                {showQuotationModal.metadata.quotation.breakdown.agent && (
                  <div className="flex justify-between text-gray-600">
                    <span>Agent ({showQuotationModal.metadata.quotation.breakdown.agent.name}):</span>
                    <span className="font-medium">₹{showQuotationModal.metadata.quotation.breakdown.agent.amount?.toLocaleString()}</span>
                  </div>
                )}
                {showQuotationModal.metadata.quotation.breakdown.installer && (
                  <div className="flex justify-between text-gray-600">
                    <span>Installer ({showQuotationModal.metadata.quotation.breakdown.installer.name}):</span>
                    <span className="font-medium">₹{showQuotationModal.metadata.quotation.breakdown.installer.amount?.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-gray-500">
              Created by {showQuotationModal.metadata.quotation.created_by_name} on{' '}
              {new Date(showQuotationModal.metadata.quotation.created_at).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSaveQuotation}>
        <div className="space-y-6">
          {/* Total Project Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Project Value *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">₹</span>
              <input
                type="number"
                name="totalAmount"
                placeholder="0"
                min="0"
                step="0.01"
                defaultValue={showQuotationModal.metadata?.quotation?.total_amount || showQuotationModal.value || ''}
                required
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Enter the total project value</p>
          </div>

          {/* Team Commission Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Team Commission Breakdown
            </h4>
            
            <div className="space-y-4">
              {/* Freelancer */}
              {showQuotationModal.metadata?.freelancer_name && (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <UserPlus className="w-4 h-4 mr-2 text-blue-600" />
                        Freelancer: {showQuotationModal.metadata.freelancer_name}
                      </span>
                      {showQuotationModal.metadata.quotation?.breakdown?.freelancer && (
                        <span className="text-xs text-blue-600">
                          Current: ₹{showQuotationModal.metadata.quotation.breakdown.freelancer.amount?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-sm">₹</span>
                    <input
                      type="number"
                      name="freelancerAmount"
                      placeholder="0"
                      min="0"
                      defaultValue={showQuotationModal.metadata?.quotation?.breakdown?.freelancer?.amount || ''}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
              
              {/* Agent */}
              {(showQuotationModal.metadata?.agent_name || showQuotationModal.agent_name) && (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-green-600" />
                        Agent: {showQuotationModal.metadata?.agent_name || showQuotationModal.agent_name}
                      </span>
                      {showQuotationModal.metadata?.quotation?.breakdown?.agent && (
                        <span className="text-xs text-green-600">
                          Current: ₹{showQuotationModal.metadata.quotation.breakdown.agent.amount?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-sm">₹</span>
                    <input
                      type="number"
                      name="agentAmount"
                      placeholder="0"
                      min="0"
                      defaultValue={showQuotationModal.metadata?.quotation?.breakdown?.agent?.amount || ''}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              )}
              
              {/* Installer */}
              {showQuotationModal.installer_name && (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Wrench className="w-4 h-4 mr-2 text-purple-600" />
                        Installer: {showQuotationModal.installer_name}
                      </span>
                      {showQuotationModal.metadata?.quotation?.breakdown?.installer && (
                        <span className="text-xs text-purple-600">
                          Current: ₹{showQuotationModal.metadata.quotation.breakdown.installer.amount?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-sm">₹</span>
                    <input
                      type="number"
                      name="installerAmount"
                      placeholder="0"
                      min="0"
                      defaultValue={showQuotationModal.metadata?.quotation?.breakdown?.installer?.amount || ''}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Info message if no team members */}
            {!showQuotationModal.metadata?.freelancer_name && 
             !showQuotationModal.metadata?.agent_name && 
             !showQuotationModal.agent_name &&
             !showQuotationModal.installer_name && (
              <div className="text-center py-4 text-gray-500 text-sm">
                <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-gray-400" />
                No team members assigned yet. Assign team members to add their commission.
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
          <button
            type="button"
            onClick={() => setShowQuotationModal(null)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={savingQuotation}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={savingQuotation}
          >
            {savingQuotation ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Receipt className="w-4 h-4 mr-2" />
                Save Quotation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
{/* Customer Documents Modal */}
{showCustomerDocs && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-5xl w-full p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Customer Documents</h3>
          <p className="text-sm text-gray-600 mt-1">
            {showCustomerDocs.name} • {showCustomerDocs.email}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUploadDoc(showCustomerDocs)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Document
          </button>
          <button
            onClick={() => setShowCustomerDocs(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Customer Info Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-900">Phone:</span>
            <span className="ml-2 text-blue-700">{showCustomerDocs.phone || 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium text-blue-900">Location:</span>
            <span className="ml-2 text-blue-700">{showCustomerDocs.location || 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium text-blue-900">Pincode:</span>
            <span className="ml-2 text-blue-700">{showCustomerDocs.pincode || 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium text-blue-900">Ref Number:</span>
            <span className="ml-2 text-blue-700">{showCustomerDocs.customer_ref_number || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {showCustomerDocs.documents && showCustomerDocs.documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {showCustomerDocs.documents.map((doc) => (
            <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1 capitalize">
                    {doc.type.replace(/_/g, ' ')}
                  </h4>
                  <p className="text-xs text-gray-500 mb-1">{doc.name}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(doc.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {doc.file_size && (
                    <p className="text-xs text-gray-400 mt-1">
                      Size: {(doc.file_size / 1024).toFixed(2)} KB
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-3">
                {doc.file_path && (
                  <>
                    
                      <a href={`${supabase.storage.from('customer-documents').getPublicUrl(doc.file_path).data.publicUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-xs font-medium"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </a>
                    
                    <button
                      onClick={() => setShowUpdateDoc(doc)}
                      className="flex items-center justify-center px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-xs font-medium"
                      title="Replace Document"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to delete "${doc.name}"?`)) {
                          try {
                            await dbService.deleteCustomerDocument(doc.id);
                            const updatedCustomer = await dbService.getCustomerWithDocs(showCustomerDocs.id);
                            setShowCustomerDocs(updatedCustomer);
                            showToast('Document deleted successfully', 'success');
                          } catch (error) {
                            showToast('Failed to delete document', 'error');
                            console.error(error);
                          }
                        }
                      }}
                      className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-xs font-medium"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 font-medium text-lg">No documents uploaded yet</p>
          <p className="text-gray-500 text-sm mt-2">Click "Upload Document" to add documents for this customer</p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
        <button
          onClick={() => setShowCustomerDocs(null)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

{/* Upload Document Modal */}
{showUploadDoc && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center p-4 z-[60]">
    <div className="bg-white rounded-lg max-w-md w-full p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Upload New Document
      </h3>
      
      <form onSubmit={async (e) => {
        e.preventDefault();
        setUploadingDoc(true);
        
        const formData = new FormData(e.target);
        const docType = formData.get('docType');
        const file = formData.get('file');
        
        // Validate file
        if (!file || file.size === 0) {
          showToast('Please select a file', 'error');
          setUploadingDoc(false);
          return;
        }
        
        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          showToast('File size must be less than 10MB', 'error');
          setUploadingDoc(false);
          return;
        }
        
        try {
          await dbService.uploadCustomerDocument(
            showUploadDoc.id,
            file,
            docType,
            currentUser.id
          );
          
          showToast('Document uploaded successfully', 'success');
          
          // Refresh customer docs
          const updatedCustomer = await dbService.getCustomerWithDocs(showUploadDoc.id);
          setShowCustomerDocs(updatedCustomer);
          setShowUploadDoc(null);
          e.target.reset();
        } catch (error) {
          showToast(`Failed to upload: ${error.message}`, 'error');
          console.error(error);
        } finally {
          setUploadingDoc(false);
        }
      }}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type *
            </label>
            <select
              name="docType"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select document type...</option>
              <option value="aadhar_card">Aadhar Card</option>
              <option value="pan_card">PAN Card</option>
              <option value="voter_id">Voter ID</option>
              <option value="driving_license">Driving License</option>
              <option value="electricity_bill">Electricity Bill</option>
              <option value="property_document">Property Document</option>
              <option value="bank_statement">Bank Statement</option>
              <option value="installation_photo">Installation Photo</option>
              <option value="agreement">Agreement/Contract</option>
              <option value="invoice">Invoice</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File *
            </label>
            <input
              type="file"
              name="file"
              required
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-2">
              Accepted: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={() => setShowUploadDoc(null)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={uploadingDoc}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={uploadingDoc}
          >
            {uploadingDoc ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Upload
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{/* Update/Replace Document Modal */}
{showUpdateDoc && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center p-4 z-[60]">
    <div className="bg-white rounded-lg max-w-md w-full p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Replace Document
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Current: {showUpdateDoc.name}
      </p>
      
      <form onSubmit={async (e) => {
        e.preventDefault();
        setUploadingDoc(true);
        
        const formData = new FormData(e.target);
        const file = formData.get('file');
        
        if (!file || file.size === 0) {
          showToast('Please select a file', 'error');
          setUploadingDoc(false);
          return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
          showToast('File size must be less than 10MB', 'error');
          setUploadingDoc(false);
          return;
        }
        
        try {
          await dbService.updateCustomerDocument(
            showUpdateDoc.id,
            file,
            currentUser.id
          );
          
          showToast('Document updated successfully', 'success');
          
          // Refresh customer docs
          const updatedCustomer = await dbService.getCustomerWithDocs(showCustomerDocs.id);
          setShowCustomerDocs(updatedCustomer);
          setShowUpdateDoc(null);
        } catch (error) {
          showToast(`Failed to update: ${error.message}`, 'error');
          console.error(error);
        } finally {
          setUploadingDoc(false);
        }
      }}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload New File *
            </label>
            <input
              type="file"
              name="file"
              required
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            <p className="text-xs text-gray-500 mt-2">
              This will replace the existing file
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={() => setShowUpdateDoc(null)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={uploadingDoc}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={uploadingDoc}
          >
            {uploadingDoc ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 mr-2" />
                Replace
              </>
            )}
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