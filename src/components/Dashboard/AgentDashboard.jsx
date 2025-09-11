import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { PROJECT_STATUS, TASK_STATUS } from '../../types/index.js';
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
  UserPlus,
  Eye,
  Package
} from 'lucide-react';

const AgentDashboard = () => {
  const { currentUser, projects, tasks, attendance, users, dispatch, showToast,  assignInstallerToProject, createTask } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [checkingIn, setCheckingIn] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [quotationData, setQuotationData] = useState(null);
  const [sendingQuote, setSendingQuote] = useState(false);
  const [showAssignInstaller, setShowAssignInstaller] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(null);

  const myProjects = projects.filter(project => 
  project.agent_id === currentUser.id || 
  project.assigned_to === currentUser.id
);
  const myTasks = tasks.filter(t => t.assignedTo === currentUser?.id);
  const todayAttendance = attendance.find(a => 
    a.userId === currentUser?.id && 
    a.date === new Date().toISOString().split('T')[0]
  );

  const availableInstallers = users.filter(u => 
    (u.role === 'installer' || u.role === 'technician') && 
    u.status === 'active'
  );

  const handleCheckIn = () => {
    setCheckingIn(true);
    
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
    
    setTimeout(() => {
      setSendingQuote(false);
      setShowWhatsApp(true);
    }, 1500);
  };

const handleAssignInstaller = async(projectId, installerId) => {
  console.log('=== INSTALLER ASSIGNMENT DEBUG ===');
  console.log('Project ID:', projectId);
  console.log('Installer ID:', installerId);
  console.log('Available installers:', availableInstallers);
  
  const installer = availableInstallers.find(i => i.id === installerId);
  console.log('Found installer:', installer);
  
  if (!installer) {
    showToast('Installer not found', 'error');
    return;
  }

  try {
    console.log('Calling assignInstallerToProject...');
    await assignInstallerToProject(projectId, installerId, installer.name);
    console.log('✅ Installer assigned successfully');

    showToast(`Installer ${installer.name} assigned to project successfully!`);
  } catch (error) {
    console.error('Full error details:', error);
    showToast('Error assigning installer: ' + error.message, 'error');
  }
  
  setShowAssignInstaller(false);
  setSelectedProject(null);
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
              {myProjects.map((project) => (
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
                        {!project.installer_assigned && !project.installer_id && !project.installer_name && (
                          <div className="flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                            <Clock className="w-3 h-3 mr-1" />
                            Needs Installer
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">{project.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
  <span className="flex items-center">
    <Users className="w-4 h-4 mr-1" />
    Customer: {project.customer_name || project.customerName || 'Not assigned'} 
    (Ref: {project.customer_ref_number || project.customerRefNumber || 'Not set'})
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
{project.installer_name && (
  <div className="mt-2 text-sm text-blue-600">
    Installer Assigned: {project.installer_name}
  </div>
)}
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
      {project.serial_numbers.map(serial => (
        <div key={serial} className="flex items-center space-x-2 bg-white border border-gray-200 rounded px-3 py-1">
          <Package className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-mono">{serial}</span>
        </div>
      ))}
    </div>
  </div>
)}

                  <div className="flex items-center space-x-3 mt-4">
                    {!project.installer_assigned && !project.installer_id && (
  <button
    onClick={() => {
      setSelectedProject(project);
      setShowAssignInstaller(true);
    }}
    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
  >
    <UserPlus className="w-4 h-4 mr-2" />
    Assign Installer
  </button>
)}
                    
                    <button
                      onClick={() => handleSendQuote(project)}
                      disabled={sendingQuote}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {sendingQuote ? 'Sending...' : 'Send Quote'}
                    </button>
                    
                    <button
                      onClick={() => setShowPDF(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Quote
                    </button>
                    
                    {project.status === PROJECT_STATUS.APPROVED && (
                      <button
                        onClick={() => handleUpdateProjectStatus(project.id, PROJECT_STATUS.IN_PROGRESS)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Start Project
                      </button>
                    )}
                    
                    {project.status === PROJECT_STATUS.IN_PROGRESS && project.installationComplete && (
                      <button
                        onClick={() => handleUpdateProjectStatus(project.id, PROJECT_STATUS.COMPLETED)}
                        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </button>
                    )}
                    
                    {/* Pipeline Stage Update */}
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
                          <p className="text-sm text-gray-500">Ref: {project.customerRefNumber}</p>
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
          )}
        </div>
      </div>

      {/* Assign Installer Modal */}
      {showAssignInstaller && selectedProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Installer</h3>
            <div className="mb-4">
              <h4 className="font-medium text-gray-900">{selectedProject.title}</h4>
              <p className="text-sm text-gray-600">Customer: {selectedProject.customerName}</p>
              <p className="text-sm text-gray-600">Equipment Count: {selectedProject.serialNumbers?.length || 0} items</p>
            </div>
            
            <div className="space-y-3">
              <h5 className="font-medium text-gray-700">Available Installers:</h5>
              {availableInstallers.length > 0 ? (
                <div className="space-y-2">
                  {availableInstallers.map(installer => (
                    <button
                      key={installer.id}
                      onClick={() => handleAssignInstaller(selectedProject.id, installer.id)}
                      className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{installer.name}</p>
                          <p className="text-sm text-gray-500 capitalize">{installer.role}</p>
                        </div>
                      </div>
                      <UserPlus className="w-4 h-4 text-blue-600" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No installers available at the moment.</p>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowAssignInstaller(false);
                  setSelectedProject(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
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