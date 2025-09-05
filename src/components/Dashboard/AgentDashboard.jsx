import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { PROJECT_STATUS, TASK_STATUS, INVENTORY_STATUS } from '../../types/index.js';
import WhatsAppPreview from '../Common/WhatsAppPreview.jsx';
import PDFPreview from '../Common/PDFPreview.jsx';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  Users, 
  MessageSquare, 
  FileText,
  Calendar,
  Phone,
  Mail,
  DollarSign,
  Send,
  Package,
  Eye,
  UserPlus
} from 'lucide-react';

const AgentDashboard = () => {
  const { currentUser, projects, tasks, attendance, complaints, users, inventory, dispatch, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [checkingIn, setCheckingIn] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [quotationData, setQuotationData] = useState(null);
  const [sendingQuote, setSendingQuote] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const myProjects = projects.filter(p => p.assignedTo === currentUser?.id);
  const myTasks = tasks.filter(t => t.assignedTo === currentUser?.id);
  const myComplaints = complaints.filter(c => c.assignedTo === currentUser?.id);
  const todayAttendance = attendance.find(a => 
    a.userId === currentUser?.id && 
    a.date === new Date().toISOString().split('T')[0]
  );

  const handleCheckIn = () => {
    setCheckingIn(true);
    
    // Simulate getting location
    setTimeout(() => {
      const newAttendance = {
        id: `att-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        date: new Date().toISOString().split('T')[0],
        checkIn: new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        location: 'Field Office A',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      };

      dispatch({ type: 'ADD_ATTENDANCE', payload: newAttendance });
      showToast('Checked in successfully!');
      setCheckingIn(false);
    }, 2000);
  };

  const handleCheckOut = () => {
    if (todayAttendance) {
      dispatch({
        type: 'UPDATE_ATTENDANCE',
        payload: {
          ...todayAttendance,
          checkOut: new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        }
      });
      showToast('Checked out successfully!');
    }
  };

  const handleSendQuote = (project) => {
    setSendingQuote(true);
    setQuotationData({
      customerName: project.customerName,
      amount: project.value,
      project: project
    });
    
    // Show loading state
    setTimeout(() => {
      setSendingQuote(false);
      setShowWhatsApp(true);
    }, 1500);
  };

  const handleAssignInstaller = (projectId, installerId) => {
    const installer = users.find(u => u.id === installerId);
    const project = projects.find(p => p.id === projectId);
    
    // Create installation task for the installer
    const newTask = {
      id: `task-${Date.now()}`,
      customerRefNumber: project.customerRefNumber,
      projectId: projectId,
      title: `Install Equipment - ${project.title}`,
      description: `Installation task for ${project.title}`,
      assignedTo: installer.id,
      assignedToName: installer.name,
      status: TASK_STATUS.PENDING,
      type: 'installation',
      dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
      serialNumbers: project.serialNumbers,
      photos: [],
      notes: `Assigned by agent: ${currentUser.name}`
    };
    
    dispatch({ type: 'ADD_TASK', payload: newTask });
    
    // Update project status to in progress
    dispatch({
      type: 'UPDATE_PROJECT_STATUS',
      payload: { projectId, status: PROJECT_STATUS.IN_PROGRESS }
    });
    
    showToast(`Installation task assigned to ${installer.name}`);
  };

  const handleUpdateProjectStatus = (projectId, status) => {
    dispatch({
      type: 'UPDATE_PROJECT_STATUS',
      payload: { projectId, status }
    });
    showToast('Project status updated!');
  };

  const handleUpdatePipelineStage = (projectId, stage) => {
    dispatch({
      type: 'UPDATE_PROJECT_PIPELINE',
      payload: { projectId, pipelineStage: stage }
    });
    showToast('Project stage updated!');
  };

  const handleViewCustomerDetails = (customerId) => {
    const customer = users.find(u => u.id === customerId);
    const customerProjects = projects.filter(p => p.customerId === customerId);
    setSelectedCustomer({ ...customer, projects: customerProjects });
    setShowCustomerDetails(true);
  };

  const ProjectCard = ({ project, showInstallerAssignment = false }) => {
    const customer = users.find(u => u.id === project.customerId);
    const assignedEquipment = inventory.filter(item => 
      project.serialNumbers?.includes(item.serialNumber)
    );
    const assignedTask = tasks.find(t => t.projectId === project.id && t.type === 'installation');
    
    return (
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
              {project.installationApproved && (
                <div className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Installation Complete
                </div>
              )}
              <button
                onClick={() => handleViewCustomerDetails(project.customerId)}
                className="p-1 text-gray-400 hover:text-blue-600 rounded"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p><span className="font-medium">Customer:</span> {project.customerName}</p>
                <p><span className="font-medium">Ref:</span> {project.customerRefNumber}</p>
                <p><span className="font-medium">Agent:</span> {currentUser.name}</p>
              </div>
              <div>
                <p><span className="font-medium">Location:</span> {project.location}</p>
                <p><span className="font-medium">Value:</span> ₹{project.value.toLocaleString()}</p>
                <p><span className="font-medium">Type:</span> {project.type}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Equipment */}
        {assignedEquipment.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h5 className="font-medium text-gray-900 mb-2">Assigned Equipment:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {assignedEquipment.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-white border border-gray-200 rounded px-3 py-2">
                  <div>
                    <span className="text-sm font-mono">{item.serialNumber}</span>
                    <p className="text-xs text-gray-500">{item.model}</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${
                    item.status === INVENTORY_STATUS.INSTALLED ? 'bg-green-500' :
                    item.status === INVENTORY_STATUS.ASSIGNED ? 'bg-blue-500' : 'bg-gray-400'
                  }`}></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Installer Assignment */}
        {showInstallerAssignment && !assignedTask && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h5 className="font-medium text-blue-900 mb-2">Assign Installer:</h5>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAssignInstaller(project.id, e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Select Installer</option>
              {users.filter(u => u.role === 'installer' && u.status === 'active').map(installer => (
                <option key={installer.id} value={installer.id}>{installer.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Assigned Installer Info */}
        {assignedTask && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-green-900">Assigned Installer:</h5>
                <p className="text-sm text-green-700">{assignedTask.assignedToName}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                assignedTask.status === TASK_STATUS.COMPLETED
                  ? 'bg-green-100 text-green-800'
                  : assignedTask.status === TASK_STATUS.IN_PROGRESS
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {assignedTask.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        {/* Pipeline Stage Control */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Pipeline Stage:
              </label>
              <select
                value={project.pipelineStage || 'ready_for_installation'}
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
            
            {project.installationApproved && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Project Status:
                </label>
                <select
                  value={project.status}
                  onChange={(e) => handleUpdateProjectStatus(project.id, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </div>
          
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
    );
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-gray-600">Manage your field operations and customer relationships</p>
        </div>
        
        {/* Attendance Button */}
        <div className="flex items-center space-x-3">
          {!todayAttendance ? (
            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {checkingIn ? 'Checking In...' : 'Check In'}
            </button>
          ) : !todayAttendance.checkOut ? (
            <button
              onClick={handleCheckOut}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Clock className="w-4 h-4 mr-2" />
              Check Out
            </button>
          ) : (
            <div className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
              <CheckCircle className="w-4 h-4 mr-2" />
              Day Complete
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Projects"
          value={myProjects.length}
          icon={FileText}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Tasks"
          value={myTasks.filter(t => t.status !== TASK_STATUS.COMPLETED).length}
          icon={Clock}
          color="bg-orange-500"
        />
        <StatCard
          title="Completed Tasks"
          value={myTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Total Value"
          value={`₹${myProjects.reduce((sum, p) => sum + p.value, 0).toLocaleString()}`}
          icon={DollarSign}
          color="bg-purple-500"
        />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex space-x-2">
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
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'projects'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              My Projects
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'customers'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Customers
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Today's Schedule */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
                <div className="space-y-3">
                  {myTasks.filter(t => t.status !== TASK_STATUS.COMPLETED).length > 0 ? myTasks.filter(t => t.status !== TASK_STATUS.COMPLETED).slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <p className="text-sm text-gray-600">{task.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{task.dueDate}</p>
                        <p className="text-xs text-gray-500">{task.type}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <h4 className="font-medium text-gray-900">Site Visit - Mumbai Bandra West Solar Project</h4>
                            <p className="text-sm text-gray-600">Customer consultation and rooftop assessment for 5kW solar installation</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">10:00 AM</p>
                          <p className="text-xs text-gray-500">consultation</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <h4 className="font-medium text-gray-900">Follow-up Call - Pune Koramangala Residential</h4>
                            <p className="text-sm text-gray-600">Discuss solar quotation and bank loan process</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">2:30 PM</p>
                          <p className="text-xs text-gray-500">follow-up</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <div>
                            <h4 className="font-medium text-gray-900">Documentation Review - Delhi NCR Gurgaon Project</h4>
                            <p className="text-sm text-gray-600">Review solar installation permits and electricity board approvals</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">4:00 PM</p>
                          <p className="text-xs text-gray-500">documentation</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Attendance Status */}
              {todayAttendance && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-green-900">Today's Attendance</h4>
                      <p className="text-sm text-green-700">
                        Check-in: {todayAttendance.checkIn}
                        {todayAttendance.checkOut && ` • Check-out: ${todayAttendance.checkOut}`}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">My Projects</h3>
              
              {/* Assigned Complaints */}
              {myComplaints.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">Assigned Complaints</h4>
                  {myComplaints.map((complaint) => (
                    <div key={complaint.id} className="border border-orange-200 bg-orange-50 rounded-lg p-4 mb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{complaint.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{complaint.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Customer: {complaint.customerName}</span>
                            <span>Ref: {complaint.customerRefNumber}</span>
                            <span>Priority: {complaint.priority}</span>
                            {complaint.serialNumber && <span>Serial: {complaint.serialNumber}</span>}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          complaint.status === COMPLAINT_STATUS.RESOLVED
                            ? 'bg-green-100 text-green-800'
                            : complaint.status === COMPLAINT_STATUS.IN_PROGRESS
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {complaint.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              const installer = users.find(u => u.id === e.target.value);
                              // Create task for installer
                              const newTask = {
                                id: `task-${Date.now()}`,
                                customerRefNumber: complaint.customerRefNumber,
                                projectId: `complaint-${complaint.id}`,
                                title: `Resolve: ${complaint.title}`,
                                description: complaint.description,
                                assignedTo: installer.id,
                                assignedToName: installer.name,
                                status: TASK_STATUS.PENDING,
                                type: 'maintenance',
                                dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
                                serialNumber: complaint.serialNumber,
                                photos: [],
                                notes: `Complaint ID: ${complaint.id}`
                              };
                              
                              dispatch({ type: 'ADD_TASK', payload: newTask });
                              showToast(`Task assigned to ${installer.name}`);
                            }
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="">Assign Installer</option>
                          {users.filter(u => u.role === 'installer' && u.status === 'active').map(installer => (
                            <option key={installer.id} value={installer.id}>{installer.name}</option>
                          ))}
                        </select>
                        
                        <button
                          onClick={() => handleSendQuote({ 
                            ...complaint, 
                            customerName: complaint.customerName,
                            value: 50000 // Default maintenance quote
                          })}
                          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Send Quote
                        </button>
                        
                        <button
                          onClick={() => setShowPDF(true)}
                          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Quote
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid gap-6">
                {myProjects.map(project => (
                  <ProjectCard key={project.id} project={project} showInstallerAssignment={true} />
              ))}
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Customer Management</h3>
              
              {/* Customer List */}
              <div className="grid gap-4">
                {myProjects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{project.customerName}</h4>
                          <p className="text-sm text-gray-600">{project.title}</p>
                          <p className="text-sm text-gray-500">{project.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                          <Phone className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                          <Mail className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50">
                          <MessageSquare className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      {showCustomerDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
                <button
                  onClick={() => setShowCustomerDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{selectedCustomer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedCustomer.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{selectedCustomer.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reference:</span>
                        <span className="font-medium">{selectedCustomer.customerRefNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{selectedCustomer.location}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Project Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Projects:</span>
                        <span className="font-medium">{selectedCustomer.projects?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Projects:</span>
                        <span className="font-medium">
                          {selectedCustomer.projects?.filter(p => p.status === PROJECT_STATUS.IN_PROGRESS).length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completed:</span>
                        <span className="font-medium">
                          {selectedCustomer.projects?.filter(p => p.status === PROJECT_STATUS.COMPLETED).length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Value:</span>
                        <span className="font-medium">
                          ₹{selectedCustomer.projects?.reduce((sum, p) => sum + p.value, 0).toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <WhatsAppPreview
        isOpen={showWhatsApp}
        onClose={() => {
          setShowWhatsApp(false);
          showToast(`Quotation sent to ${quotationData?.customerName} via WhatsApp!`);
        }}
        type="quotation"
        customerName={quotationData?.customerName}
        amount={quotationData?.amount}
      />

      <PDFPreview
        isOpen={showPDF}
        onClose={() => setShowPDF(false)}
        type="quotation"
        data={{
          customerName: quotationData?.customerName || "Customer",
          amount: quotationData?.amount || 25000,
          quoteNumber: "QUO-2024-001"
        }}
      />
    </div>
  );
};

export default AgentDashboard;