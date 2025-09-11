import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { LEAD_STATUS, USER_ROLES } from '../../types/index.js';
import PerformanceChart from '../Common/PerformanceChart.jsx';
import ProjectPipeline from '../Common/ProjectPipeline.jsx';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Eye,
  UserPlus,
  CheckCircle,
  Wallet,
  CreditCard,
  Clock,
  Briefcase,
  Package
} from 'lucide-react';

const FreelancerDashboard = () => {
  const { 
    currentUser, 
    leads, 
    projects, 
    inventory,
    dispatch, 
    showToast, 
    createProject,
    register
  } = useApp();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddLead, setShowAddLead] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  
  const [newLead, setNewLead] = useState({
    customerName: '',
    email: '',
    phone: '',
    location: '',
    type: 'solar',
    estimatedValue: '',
    notes: ''
  });

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    location: '',
    value: 0,
    customerId: '',
    customerName: '',
    selectedEquipment: []
  });

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    serviceNumber: '',
    email: '',
    address: '',
    pincode: '',
    moduleType: '',
    kwCapacity: '',
    houseType: '',
    floors: '',
    remarks: '',
    coordinates: { lat: null, lng: null }
  });

  const myLeads = leads.filter(l => l.assignedTo === currentUser?.id);
  const myProjects = projects.filter(p => 
    p.created_by === currentUser?.id || 
    p.createdBy === currentUser?.id ||
    p.freelancer_id === currentUser?.id
  );
  const availableLeads = leads.filter(l => !l.assignedTo);
  const totalEarnings = myLeads
    .filter(l => l.status === LEAD_STATUS.CONVERTED)
    .reduce((sum, l) => sum + (l.estimatedValue * 0.1), 0);

  const availableInventory = inventory.filter(i => i.status === 'in_stock');

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewCustomer(prev => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
          showToast('Location captured successfully!');
        },
        (error) => {
          showToast('Unable to get location. Please enable location services.', 'error');
        }
      );
    } else {
      showToast('Geolocation is not supported by this browser.', 'error');
    }
  };

const handleAddCustomer = async (e) => {
  e.preventDefault();
  
  if (!newCustomer.coordinates.lat || !newCustomer.coordinates.lng) {
    showToast('Please capture location coordinates.', 'error');
    return;
  }
  
  if (!/^[0-9]{6}$/.test(newCustomer.pincode)) {
    showToast('Please enter a valid 6-digit pincode.', 'error');
    return;
  }

  try {
    const tempPassword = `temp${Math.random().toString(36).slice(-8)}`; // Generate random temp password
    
    const customerData = {
      email: newCustomer.email,
      password: tempPassword,
      name: newCustomer.name,
      phone: newCustomer.phone,
      role: USER_ROLES.CUSTOMER, // ✅ This will trigger active status
      // ❌ DO NOT SET status here - let auth.js handle it
      serviceNumber: newCustomer.serviceNumber,
      address: newCustomer.address,
      pincode: newCustomer.pincode,
      coordinates: newCustomer.coordinates,
      moduleType: newCustomer.moduleType,
      kwCapacity: newCustomer.kwCapacity,
      houseType: newCustomer.houseType,
      floors: newCustomer.floors,
      remarks: newCustomer.remarks,
      customerRefNumber: `CUST-${Date.now()}`,
      created_by_freelancer: currentUser.id
    };

    console.log('Registering customer with data:', customerData);
    const createdCustomer = await register(customerData);
    console.log('Customer registered:', createdCustomer);
    
    // Extract user ID from response (handle different response structures)
    const customerId = createdCustomer?.user?.id || createdCustomer?.id;
    
    if (!customerId) {
      throw new Error('Failed to get customer ID from registration response');
    }
    
    // Update project form with customer details
    setNewProject(prev => ({
      ...prev,
      customerId: customerId,
      customerName: newCustomer.name
    }));

    showToast('✅ Customer registered successfully and is ACTIVE! Now create the project.');
    setShowAddCustomer(false);
    
    // Reset form
    setNewCustomer({
      name: '',
      phone: '',
      serviceNumber: '',
      email: '',
      address: '',
      pincode: '',
      moduleType: '',
      kwCapacity: '',
      houseType: '',
      floors: '',
      remarks: '',
      coordinates: { lat: null, lng: null }
    });
    
  } catch (error) {
    console.error('Customer registration error:', error);
    showToast('❌ Error adding customer: ' + error.message, 'error');
  }
};



  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!newProject.customerId) {
      showToast('Please add a customer first', 'error');
      return;
    }

    try {
      const project = {
        title: newProject.title,
        description: newProject.description,
        location: newProject.location,
        value: Number(newProject.value),
        customer_id: newProject.customerId,
        customer_name: newProject.customerName,
        customer_ref_number: `CUST-${Date.now()}`,
        freelancer_id: currentUser.id,
        freelancer_name: currentUser.name,
        created_by: currentUser.id,
        status: 'pending_agent_review',
        pipeline_stage: 'freelancer_created',
        type: 'solar',
        serial_numbers: newProject.selectedEquipment,
        created_at: new Date().toISOString()
      };

      const createdProject = await createProject(project);
      
      showToast('Project created successfully! It will be reviewed by an agent.');
      setShowCreateProject(false);
      
      setNewProject({
        title: '',
        description: '',
        location: '',
        value: 0,
        customerId: '',
        customerName: '',
        selectedEquipment: []
      });

    } catch (error) {
      showToast('Error creating project: ' + error.message, 'error');
    }
  };

  const handleAddLead = (e) => {
    e.preventDefault();
    
    const lead = {
      id: `lead-${Date.now()}`,
      ...newLead,
      estimatedValue: parseInt(newLead.estimatedValue),
      status: LEAD_STATUS.NEW,
      assignedTo: currentUser.id,
      assignedToName: currentUser.name,
      createdAt: new Date().toISOString().split('T')[0]
    };

    dispatch({ type: 'ADD_LEAD', payload: lead });
    showToast('Lead added successfully!');
    setShowAddLead(false);
    setNewLead({
      customerName: '',
      email: '',
      phone: '',
      location: '',
      type: 'solar',
      estimatedValue: '',
      notes: ''
    });
  };

  const handleAssignLead = (leadId) => {
    dispatch({
      type: 'UPDATE_LEAD',
      payload: {
        id: leadId,
        updates: {
          assignedTo: currentUser.id,
          assignedToName: currentUser.name,
          status: LEAD_STATUS.CONTACTED
        }
      }
    });
    showToast('Lead assigned to you!');
  };

  const handleUpdateLeadStatus = (leadId, status) => {
    dispatch({
      type: 'UPDATE_LEAD',
      payload: {
        id: leadId,
        updates: { status }
      }
    });
    showToast('Lead status updated!');
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Freelancer Dashboard</h1>
          <p className="text-gray-600">Manage your leads, projects and track your earnings</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddLead(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </button>
          <button
            onClick={() => setShowCreateProject(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Create Project
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          title="My Leads"
          value={myLeads.length}
          icon={Users}
          color="bg-blue-500"
          subtitle="Total assigned"
        />
        <StatCard
          title="My Projects"
          value={myProjects.length}
          icon={Briefcase}
          color="bg-green-500"
          subtitle="Created projects"
        />
        <StatCard
          title="Total Earnings"
          value={`₹${totalEarnings.toLocaleString()}`}
          icon={DollarSign}
          color="bg-purple-500"
          subtitle="10% commission"
        />
        <StatCard
          title="Available Leads"
          value={availableLeads.length}
          icon={TrendingUp}
          color="bg-orange-500"
          subtitle="Ready to assign"
        />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('my-projects')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'my-projects'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              My Projects
            </button>
            <button
              onClick={() => setActiveTab('my-leads')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'my-leads'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              My Leads
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'available'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Available Leads
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'performance'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Performance
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <ProjectPipeline projects={myProjects} />

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {myProjects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{project.title}</h4>
                          <p className="text-sm text-gray-600">{project.location} • {project.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'pending_agent_review'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {project.status?.replace('_', ' ')}
                        </span>
                        <p className="text-sm text-gray-500 mt-1 sm:mt-0 sm:ml-2">
                          ₹{project.value.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900">Project Success Rate</h4>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-2">
                    {myProjects.length > 0 
                      ? Math.round((myProjects.filter(p => p.status === 'completed').length / myProjects.length) * 100)
                      : 0}%
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900">This Month</h4>
                  <p className="text-xl sm:text-2xl font-bold text-green-600 mt-2">
                    ₹{(totalEarnings * 0.3).toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900">Average Project</h4>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-2">
                    ₹{myProjects.length > 0 
                      ? Math.round(myProjects.reduce((sum, p) => sum + p.value, 0) / myProjects.length).toLocaleString()
                      : 0}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'my-projects' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">My Created Projects</h3>
              <div className="space-y-4">
                {myProjects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{project.title}</h4>
                        <p className="text-gray-600 mt-1">{project.description}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 text-sm text-gray-500 space-y-1 sm:space-y-0">
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            Customer: {project.customer_name || project.customerName}
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
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'pending_agent_review'
                            ? 'bg-yellow-100 text-yellow-800'
                            : project.status === 'agent_approved'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {myProjects.length === 0 && (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">No Projects Yet</h4>
                    <p className="text-gray-600">Create your first project to get started!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'my-leads' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">My Leads</h3>
              <div className="space-y-4">
                {myLeads.map((lead) => (
                  <div key={lead.id} className="border border-gray-200 rounded-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{lead.customerName}</h4>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 text-sm text-gray-500 space-y-1 sm:space-y-0">
                          <span className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {lead.email}
                          </span>
                          <span className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {lead.phone}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {lead.location}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{lead.notes}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          lead.status === LEAD_STATUS.CONVERTED
                            ? 'bg-green-100 text-green-800'
                            : lead.status === LEAD_STATUS.QUOTED
                            ? 'bg-blue-100 text-blue-800'
                            : lead.status === LEAD_STATUS.CONTACTED
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.status}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          ₹{lead.estimatedValue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {lead.status === LEAD_STATUS.NEW && (
                        <button
                          onClick={() => handleUpdateLeadStatus(lead.id, LEAD_STATUS.CONTACTED)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs sm:text-sm hover:bg-blue-700"
                        >
                          Mark Contacted
                        </button>
                      )}
                      {lead.status === LEAD_STATUS.CONTACTED && (
                        <button
                          onClick={() => handleUpdateLeadStatus(lead.id, LEAD_STATUS.QUOTED)}
                          className="px-3 py-1 bg-purple-600 text-white rounded text-xs sm:text-sm hover:bg-purple-700"
                        >
                          Send Quote
                        </button>
                      )}
                      {lead.status === LEAD_STATUS.QUOTED && (
                        <button
                          onClick={() => handleUpdateLeadStatus(lead.id, LEAD_STATUS.CONVERTED)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs sm:text-sm hover:bg-green-700"
                        >
                          Mark Converted
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {myLeads.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">No Leads Yet</h4>
                    <p className="text-gray-600">Add your first lead to get started!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'available' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Available Leads</h3>
              <div className="space-y-4">
                {availableLeads.map((lead) => (
                  <div key={lead.id} className="border border-gray-200 rounded-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{lead.customerName}</h4>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 text-sm text-gray-500 space-y-1 sm:space-y-0">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {lead.location}
                          </span>
                          <span className="capitalize">{lead.type} installation</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{lead.notes}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{lead.estimatedValue.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleAssignLead(lead.id)}
                          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Assign to Me
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {availableLeads.length === 0 && (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">No Available Leads</h4>
                    <p className="text-gray-600">All leads are currently assigned.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <PerformanceChart 
                  title="Monthly Projects Created"
                  type="bar"
                />
                <PerformanceChart 
                  title="Project Success Rate"
                  type="line"
                />
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <PerformanceChart 
                  title="Earnings Growth"
                  type="line"
                />
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Performance Metrics</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Projects</span>
                      <span className="font-bold text-gray-900">{myProjects.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Approved Projects</span>
                      <span className="font-bold text-green-600">
                        {myProjects.filter(p => p.status === 'approved').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Project Value</span>
                      <span className="font-bold text-blue-600">
                        ₹{myProjects.length > 0 
                          ? Math.round(myProjects.reduce((sum, p) => sum + p.value, 0) / myProjects.length).toLocaleString()
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Lead Conversion</span>
                      <span className="font-bold text-purple-600">
                        {myLeads.length > 0 
                          ? Math.round((myLeads.filter(l => l.status === LEAD_STATUS.CONVERTED).length / myLeads.length) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Project</h3>
            
            {!newProject.customerId && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  First, add a customer for this project by clicking "Add Customer" below.
                </p>
              </div>
            )}

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer *
                </label>
                {newProject.customerId ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">{newProject.customerName}</p>
                      <p className="text-sm text-green-700">Customer added successfully</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewProject({...newProject, customerId: '', customerName: ''})}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddCustomer(true)}
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <UserPlus className="w-5 h-5 mr-2 text-gray-400" />
                    <span className="text-gray-600">Add Customer</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Equipment (Optional)
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
                <p className="text-xs text-gray-500 mt-1">
                  Equipment selection is optional and can be modified later by agents/admin
                </p>
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={!newProject.customerId}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateProject(false);
                    setNewProject({
                      title: '',
                      description: '',
                      location: '',
                      value: 0,
                      customerId: '',
                      customerName: '',
                      selectedEquipment: []
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Customer</h3>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email ID *</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Number *</label>
                  <input
                    type="text"
                    value={newCustomer.serviceNumber}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, serviceNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <textarea
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  value={newCustomer.pincode}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, pincode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  pattern="[0-9]{6}"
                  maxLength="6"
                  placeholder="Enter 6-digit pincode"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location Coordinates *</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCustomer.coordinates.lat && newCustomer.coordinates.lng 
                      ? `${newCustomer.coordinates.lat}, ${newCustomer.coordinates.lng}` 
                      : ''}
                    placeholder="Coordinates will appear here"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    Get Location
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module Type *</label>
                  <select
                    value={newCustomer.moduleType}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, moduleType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Module Type</option>
                    <option value="monocrystalline">Monocrystalline</option>
                    <option value="polycrystalline">Polycrystalline</option>
                    <option value="thin-film">Thin Film</option>
                    <option value="bifacial">Bifacial</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KW Capacity *</label>
                  <input
                    type="number"
                    value={newCustomer.kwCapacity}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, kwCapacity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">House Type *</label>
                  <select
                    value={newCustomer.houseType}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, houseType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select House Type</option>
                    <option value="apartment">Apartment</option>
                    <option value="independent">Independent House</option>
                    <option value="villa">Villa</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Floors *</label>
                  <input
                    type="number"
                    value={newCustomer.floors}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, floors: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Requirements & Remarks</label>
                <textarea
                  value={newCustomer.remarks}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, remarks: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any specific requirements or remarks..."
                />
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Add Customer
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddLead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Lead</h3>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={newLead.customerName}
                  onChange={(e) => setNewLead({...newLead, customerName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newLead.location}
                  onChange={(e) => setNewLead({...newLead, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newLead.type}
                  onChange={(e) => setNewLead({...newLead, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="solar">Solar</option>
                  <option value="wind">Wind</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Value (₹)
                </label>
                <input
                  type="number"
                  value={newLead.estimatedValue}
                  onChange={(e) => setNewLead({...newLead, estimatedValue: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newLead.notes}
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                >
                  Add Lead
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddLead(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FreelancerDashboard;