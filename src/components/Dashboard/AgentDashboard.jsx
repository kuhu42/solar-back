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
  Scan
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
  const [showAssignInstallerModal, setShowAssignInstallerModal] = useState(false);
  const [selectedComplaintForAssignment, setSelectedComplaintForAssignment] = useState(null);
  const [selectedInstaller, setSelectedInstaller] = useState('');

  const myProjects = projects.filter(p => p.assignedTo === currentUser?.id);
  const myTasks = tasks.filter(t => t.assignedTo === currentUser?.id);
  const myAssignedComplaints = complaints.filter(c => c.assignedAgent === currentUser?.id);
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

  const handleAssignInstaller = () => {
    if (!selectedInstaller) {
      showToast('Please select an installer', 'error');
      return;
    }

    const installer = users.find(u => u.id === selectedInstaller);
    
    dispatch({
      type: 'UPDATE_COMPLAINT',
      payload: {
        id: selectedComplaintForAssignment.id,
        updates: {
          assignedTo: selectedInstaller,
          assignedToName: installer.name,
          workflowStatus: 'installer_assigned'
        }
      }
    });

    showToast(`Complaint assigned to ${installer.name}`);
    setShowAssignInstallerModal(false);
    setSelectedComplaintForAssignment(null);
    setSelectedInstaller('');
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
            <button
              onClick={() => setActiveTab('complaints')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'complaints'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Complaints
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
              {myProjects.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                      <p className="text-gray-600 mt-1">{project.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
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

                  <div className="flex items-center space-x-3">
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
                    
                    {project.status === PROJECT_STATUS.IN_PROGRESS && (
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

          {activeTab === 'complaints' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">My Assigned Complaints</h3>
              
              {myAssignedComplaints.map((complaint) => (
                <div key={complaint.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{complaint.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          complaint.priority === 'urgent'
                            ? 'bg-red-100 text-red-800'
                            : complaint.priority === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {complaint.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{complaint.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {complaint.customerName}
                        </span>
                        <span>Ref: {complaint.customerRefNumber}</span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {complaint.createdAt}
                        </span>
                        {complaint.serialNumber && (
                          <span className="flex items-center">
                            <Scan className="w-4 h-4 mr-1" />
                            {complaint.serialNumber}
                          </span>
                        )}
                      </div>
                      
                      {/* Workflow Status */}
                      <div className="mt-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          complaint.workflowStatus === 'work_completed'
                            ? 'bg-green-100 text-green-800'
                            : complaint.workflowStatus === 'work_in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : complaint.workflowStatus === 'installer_assigned'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          Status: {complaint.workflowStatus?.replace('_', ' ') || 'Agent Assigned'}
                        </span>
                      </div>

                      {/* Assigned Equipment */}
                      {complaint.assignedEquipment && complaint.assignedEquipment.length > 0 && (
                        <div className="mt-3 bg-blue-50 rounded-lg p-3">
                          <h5 className="font-medium text-blue-900 mb-2">Assigned Equipment:</h5>
                          <div className="flex flex-wrap gap-2">
                            {complaint.assignedEquipment.map(equipId => {
                              const equipment = inventory.find(i => i.id === equipId);
                              return equipment ? (
                                <span key={equipId} className="px-2 py-1 bg-white border border-blue-200 rounded text-sm font-mono">
                                  {equipment.serialNumber}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {complaint.workflowStatus === 'agent_assigned' && (
                      <button
                        onClick={() => {
                          setSelectedComplaintForAssignment(complaint);
                          setShowAssignInstallerModal(true);
                        }}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Assign Installer
                      </button>
                    )}
                    
                    {complaint.assignedToName && (
                      <div className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Assigned to: {complaint.assignedToName}
                      </div>
                    )}
                    
                    <button className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Customer
                    </button>
                    
                    <button
                      onClick={() => {
                        dispatch({
                          type: 'UPDATE_COMPLAINT',
                          payload: {
                            id: complaint.id,
                            updates: { workflowStatus: 'closed', status: 'resolved' }
                          }
                        });
                        showToast('Complaint closed');
                      }}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                    >
                      Close Complaint
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* Installer Assignment Modal */}
      {showAssignInstallerModal && selectedComplaintForAssignment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Installer</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900">{selectedComplaintForAssignment.title}</h4>
                <p className="text-sm text-gray-600">Customer: {selectedComplaintForAssignment.customerName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Installer *
                </label>
                <select
                  value={selectedInstaller}
                  onChange={(e) => setSelectedInstaller(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose Installer</option>
                  {users.filter(u => (u.role === 'installer' || u.role === 'technician') && u.status === 'active').map(installer => (
                    <option key={installer.id} value={installer.id}>
                      {installer.name} - {installer.role} ({installer.location})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={handleAssignInstaller}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Assign Installer
                </button>
                <button
                  onClick={() => setShowAssignInstallerModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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