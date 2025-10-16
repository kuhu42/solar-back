import React, { useState } from 'react';
// import { useApp } from '../../context/AppContext.jsx';
import { useApp } from '../../hooks/useApp.js'
import { TASK_STATUS, INVENTORY_STATUS } from '../../types/index.js';
import StatusUpdateModal from '../Common/StatusUpdateModal.jsx';
import { STAGE_LABELS, STAGE_COLORS, STAGE_PERMISSIONS } from '../../types/index.js';

import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  Wrench, 
  Camera, 
  Scan,
  Upload,
  FileText,
  Calendar,
  AlertCircle,
  Phone,
  X,
  Package
} from 'lucide-react';

const InstallerDashboard = () => {
  const { currentUser, projects, tasks, attendance, inventory, dispatch, showToast, approveProject } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [checkingIn, setCheckingIn] = useState(false);
  const [scannerInput, setScannerInput] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [showCompleteInstallation, setShowCompleteInstallation] = useState(false);
const [completingProject, setCompletingProject] = useState(null);
const [installationNotes, setInstallationNotes] = useState('');
const [installationModules, setInstallationModules] = useState([
  { module: '', serialNumber: '' }
]);

  const myTasks = tasks.filter(t => t.assignedTo === currentUser?.id);
  const todayAttendance = attendance.find(a => 
    a.userId === currentUser?.id && 
    a.date === new Date().toISOString().split('T')[0]
  );
const myProjects = projects.filter(p => 
  p.installer_id === currentUser?.id && 
  (p.status === 'in_progress' || p.status === 'completed' || p.status === 'approved')
);
const handleCompleteInstallation = (project) => {
  setCompletingProject(project);
  setInstallationNotes('');
  setShowCompleteInstallation(true);
};

const handleSubmitInstallationComplete = async (e) => {
  e.preventDefault();
  
  // Validate that at least one module is entered
  const validModules = installationModules.filter(m => m.module && m.serialNumber);
  if (validModules.length === 0) {
    showToast('Please add at least one module with serial number', 'error');
    return;
  }
  
  try {
    await approveProject(completingProject.id, {
      status: 'completed',
      pipeline_stage: 'installation_complete',
      installation_complete: true,
      completion_date: new Date().toISOString().split('T')[0],
      installer_notes: installationNotes,
      installed_modules: validModules,  // ✅ NEW: Add modules data
      metadata: {
        ...completingProject.metadata,
        installation_completed_at: new Date().toISOString(),
        flow_stage: 'installation_complete',
        installed_equipment: validModules  // ✅ NEW: Also store in metadata
      }
    });

    showToast('Installation marked as complete successfully!');
    setShowCompleteInstallation(false);
    setCompletingProject(null);
    setInstallationNotes('');
    setInstallationModules([{ module: '', serialNumber: '' }]);  // ✅ Reset modules
  } catch (error) {
    showToast('Error completing installation: ' + error.message, 'error');
  }
};
const addModuleRow = () => {
  setInstallationModules([...installationModules, { module: '', serialNumber: '' }]);
};

const removeModuleRow = (index) => {
  if (installationModules.length > 1) {
    setInstallationModules(installationModules.filter((_, i) => i !== index));
  }
};

const updateModuleRow = (index, field, value) => {
  const updated = [...installationModules];
  updated[index][field] = value;
  setInstallationModules(updated);
};
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
        location: 'Installation Site',
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

  const handleScanSerial = () => {
    if (!scannerInput.trim()) {
      showToast('Please enter a serial number', 'error');
      return;
    }

    const inventoryItem = inventory.find(item => item.serialNumber === scannerInput);
    if (inventoryItem) {
      // Find associated customer reference
      const project = projects.find(p => p.serialNumbers.includes(scannerInput));
      const customerRef = project ? ` - Customer Ref: ${project.customerRefNumber}` : '';
      showToast(`Scanned: ${inventoryItem.model} (${inventoryItem.serialNumber})${customerRef}`);
      
      // Update inventory status to installed
      dispatch({
        type: 'UPDATE_INVENTORY_STATUS',
        payload: {
          serialNumber: scannerInput,
          status: INVENTORY_STATUS.INSTALLED,
          updates: {
            installDate: new Date().toISOString().split('T')[0]
          }
        }
      });
    } else {
      showToast('Serial number not found in inventory', 'error');
    }
    
    setScannerInput('');
  };

  const handleCompleteTask = (taskId) => {
    dispatch({
      type: 'UPDATE_TASK_STATUS',
      payload: {
        taskId,
        status: TASK_STATUS.COMPLETED,
        updates: {
          notes: completionNotes,
          photos: ['installation_photo_1.jpg', 'installation_photo_2.jpg'] // Mock photos
        }
      }
    });
    
    showToast('Task completed successfully!');
    setSelectedTask(null);
    setCompletionNotes('');
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
          <h1 className="text-2xl font-bold text-gray-900">Installer Dashboard</h1>
          <p className="text-gray-600">Manage your installation tasks and equipment</p>
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
          title="Active Tasks"
          value={myTasks.filter(t => t.status !== TASK_STATUS.COMPLETED).length}
          icon={Wrench}
          color="bg-blue-500"
        />
        <StatCard
          title="Completed Today"
          value={myTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Pending Tasks"
          value={myTasks.filter(t => t.status === TASK_STATUS.PENDING).length}
          icon={Clock}
          color="bg-orange-500"
        />
        <StatCard
          title="Total Tasks"
          value={myTasks.length}
          icon={FileText}
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
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              My Tasks
            </button>
            <button
  onClick={() => setActiveTab('projects')}
  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
    activeTab === 'projects'
      ? 'bg-blue-100 text-blue-700'
      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
  }`}
>
  My Projects ({myProjects.length})
</button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Today's Tasks */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Tasks</h3>
                <div className="space-y-3">
                  {myTasks.filter(t => t.status !== TASK_STATUS.COMPLETED).slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          task.status === TASK_STATUS.IN_PROGRESS ? 'bg-blue-500' : 'bg-gray-400'
                        }`}></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <p className="text-sm text-gray-600">{task.description}</p>
                          <p className="text-xs text-gray-500">Customer Ref: {task.customerRefNumber}</p>
                          <p className="text-xs text-gray-500">Customer Ref: {task.customerRefNumber}</p>
                          {task.serialNumber && (
                            <p className="text-xs text-gray-500">Serial: {task.serialNumber}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{task.dueDate}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === TASK_STATUS.IN_PROGRESS
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
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
                      <p className="text-sm text-green-600">Location: {todayAttendance.location}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('scanner')}
                  className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Scan className="w-6 h-6 text-blue-600 mr-3" />
                  <span className="font-medium text-blue-900">Scan Equipment</span>
                </button>
                <button className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                  <label className="flex items-center justify-center cursor-pointer">
                    <Camera className="w-6 h-6 text-green-600 mr-3" />
                    <span className="font-medium text-green-900">Take Photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        if (files.length > 0) {
                          showToast(`${files.length} photo(s) uploaded successfully!`);
                        }
                      }}
                    />
                  </label>
                </button>
                <button className="flex items-center justify-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                  <label className="flex items-center justify-center cursor-pointer">
                    <Upload className="w-6 h-6 text-purple-600 mr-3" />
                    <span className="font-medium text-purple-900">Upload Documents</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        if (files.length > 0) {
                          showToast(`${files.length} document(s) uploaded successfully!`);
                        }
                      }}
                    />
                  </label>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">My Installation Tasks</h3>
              <div className="grid gap-4">
                {myTasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{task.title}</h4>
                        <p className="text-gray-600 mt-1">{task.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Due: {task.dueDate}
                          </span>
                          {task.serialNumber && (
                            <span className="flex items-center">
                              <Scan className="w-4 h-4 mr-1" />
                              Serial: {task.serialNumber}
                            </span>
                          )}
                          <span className="capitalize">{task.type}</span>
                        </div>
                        {task.notes && (
                          <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                            Notes: {task.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.status === TASK_STATUS.COMPLETED
                            ? 'bg-green-100 text-green-800'
                            : task.status === TASK_STATUS.IN_PROGRESS
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {task.status === TASK_STATUS.PENDING && (
                        <button
                          onClick={() => {
                            dispatch({
                              type: 'UPDATE_TASK_STATUS',
                              payload: { taskId: task.id, status: TASK_STATUS.IN_PROGRESS }
                            });
                            showToast('Task started!');
                          }}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Start Task
                        </button>
                      )}
                      
                      {task.status === TASK_STATUS.IN_PROGRESS && (
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete Task
                        </button>
                      )}

                      <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                        <Camera className="w-4 h-4 mr-2" />
                        Add Photos
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'scanner' && (
            <div className="space-y-6">
              <div className="text-center">
                <Scan className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Equipment Scanner</h3>
                <p className="text-gray-600">Scan or enter serial numbers to track equipment</p>
              </div>

              <div className="max-w-md mx-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Serial Number
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={scannerInput}
                        onChange={(e) => setScannerInput(e.target.value)}
                        placeholder="Enter or scan serial number"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleScanSerial}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Scan
                      </button>
                    </div>
                  </div>

                  <div className="text-center">
                    <label className="flex items-center justify-center w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border-2 border-dashed border-gray-300 cursor-pointer">
                      <Camera className="w-5 h-5 mr-2" />
                      Upload Serial Photo (OCR)
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            showToast('Processing image with OCR...');
                            setTimeout(() => {
                              setScannerInput('GKA96M560H20200902RX025');
                              showToast('OCR detected serial: GKA96M560H20200902RX025');
                            }, 2000);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Recent Scans */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Recent Equipment</h4>
                <div className="grid gap-3">
                  {inventory.filter(item => item.status === INVENTORY_STATUS.ASSIGNED || item.status === INVENTORY_STATUS.INSTALLED)
                    .slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-900">{item.serialNumber}</h5>
                        <p className="text-sm text-gray-600">{item.model} • {item.type.replace('_', ' ')}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === INVENTORY_STATUS.INSTALLED
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {activeTab === 'projects' && (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">My Installation Projects</h3>
    
    {myProjects.length === 0 && (
      <div className="text-center py-8">
        <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h4 className="font-medium text-gray-900 mb-2">No Projects Assigned</h4>
        <p className="text-gray-600">Projects assigned to you will appear here.</p>
      </div>
    )}
    
    <div className="grid gap-4">
      {myProjects.map((project) => (
        <div key={project.id} className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {project.status === 'completed' ? 'Installation Complete' : 'In Progress'}
                </span>
              </div>
              
              <p className="text-gray-600 mt-1">{project.description}</p>
              
              {/* Project Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3 text-sm bg-gray-50 p-3 rounded-lg">
                <div>
                  <span className="font-medium text-gray-700">Customer:</span>
                  <p>{project.customer_name}</p>
                </div>
                <div>
    <span className="font-medium text-gray-700">Current Stage:</span>
    <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
      STAGE_COLORS[project.pipeline_stage] || 'bg-gray-100 text-gray-800'
    }`}>
      {STAGE_LABELS[project.pipeline_stage] || 'Unknown Status'}
    </span>
  </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <p>{project.customer_phone}</p>
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
                  <span className="font-medium text-gray-700">Project Value:</span>
                  <p className="font-bold text-green-600">₹{project.value?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <p className="capitalize">{project.type}</p>
                </div>
              </div>

              {/* Project Timeline */}
              <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs">
                <div className="font-medium text-blue-900 mb-2">Project Flow:</div>
                <div className="space-y-1 text-blue-700">
                  <div>Created by: {project.metadata?.freelancer_name}</div>
                  <div>Enhanced by: {project.metadata?.agent_name}</div>
                  <div>Approved by Admin</div>
                  <div>Assigned to: {currentUser?.name}</div>
                  {project.completion_date && (
                    <div className="font-medium">Completed on: {project.completion_date}</div>
                  )}
                </div>
              </div>
              {/* ✅ ADD THIS: Installed Equipment Details - CORRECT LOCATION */}
{project.metadata?.installed_equipment && project.metadata.installed_equipment.length > 0 && (
  <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
    <div className="font-medium text-gray-900 text-sm mb-2">Installed Equipment:</div>
    <div className="space-y-1">
      {project.metadata.installed_equipment.map((item, idx) => (
        <div key={idx} className="text-sm text-gray-700 flex items-center">
          <Package className="w-3 h-3 mr-2 text-gray-500" />
          <span className="font-medium">{item.module}</span>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-gray-600">SN: {item.serialNumber}</span>
        </div>
      ))}
    </div>
  </div>
)}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
  <div className="text-sm text-blue-700">
    <span className="font-medium">Current Status:</span>
    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
      STAGE_COLORS[project.pipeline_stage] || 'bg-gray-100 text-gray-800'
    }`}>
      {STAGE_LABELS[project.pipeline_stage] || 'Unknown Status'}
    </span>
  </div>
</div>

             
            </div>
          </div>

          {/* Action Buttons */}
<div className="flex items-center space-x-3 mt-4">
  {/* Show button if project is assigned to installer but not yet completed */}
  {!project.installation_complete && project.installer_assigned && (
    <button
      onClick={() => handleCompleteInstallation(project)}
      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
    >
      <CheckCircle className="w-4 h-4 mr-2" />
      Mark Installation Complete
    </button>
  )}
            
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <Camera className="w-4 h-4 mr-2" />
              Add Photos
            </button>
            
            <button
              onClick={() => {
                const customerPhone = project.customer_phone;
                if (customerPhone) {
                  window.open(`tel:${customerPhone}`, '_self');
                }
              }}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Customer
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
{/* Installation Completion Modal */}
{showCompleteInstallation && completingProject && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Installation</h3>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium text-blue-900">{completingProject.title}</h4>
          <p className="text-sm text-blue-700">Customer: {completingProject.customer_name}</p>
          <p className="text-sm text-blue-700">Location: {completingProject.location}</p>
        </div>
        
        <form onSubmit={handleSubmitInstallationComplete} className="space-y-4">
          {/* ✅ NEW SECTION: Installed Modules */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Installed Modules & Serial Numbers *
              </label>
              <button
                type="button"
                onClick={addModuleRow}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Module
              </button>
            </div>
            
            <div className="space-y-2">
              {installationModules.map((module, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={module.module}
                    onChange={(e) => updateModuleRow(index, 'module', e.target.value)}
                    placeholder="Module type (e.g., 550W Panel)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                  <input
                    type="text"
                    value={module.serialNumber}
                    onChange={(e) => updateModuleRow(index, 'serialNumber', e.target.value)}
                    placeholder="Serial Number"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                  {installationModules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeModuleRow(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Add all modules installed with their serial numbers
            </p>
          </div>

          {/* Installation Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Installation Notes
            </label>
            <textarea
              value={installationNotes}
              onChange={(e) => setInstallationNotes(e.target.value)}
              rows={4}
              placeholder="Add notes about the completed installation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Before marking complete:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>Verify all equipment is properly installed</li>
                  <li>Record all module serial numbers</li>
                  <li>Test system functionality</li>
                  <li>Take completion photos</li>
                  <li>Get customer sign-off</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              Mark Installation Complete
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCompleteInstallation(false);
                setInstallationModules([{ module: '', serialNumber: '' }]);
              }}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
      {/* Task Completion Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Task</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{selectedTask.title}</h4>
                <p className="text-sm text-gray-600">{selectedTask.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Notes
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={4}
                  placeholder="Add any notes about the completed work..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Before completing:</p>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      <li>Take photos of completed work</li>
                      <li>Verify all equipment is properly installed</li>
                      <li>Update serial number status</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={() => handleCompleteTask(selectedTask.id)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                >
                  Complete Task
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallerDashboard;