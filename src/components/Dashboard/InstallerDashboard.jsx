import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { TASK_STATUS, INVENTORY_STATUS } from '../../types/index.js';
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
  AlertCircle
} from 'lucide-react';

const InstallerDashboard = () => {
  const { currentUser, tasks, attendance, inventory, dispatch, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [checkingIn, setCheckingIn] = useState(false);
  const [scannerInput, setScannerInput] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');

  const myTasks = tasks.filter(t => t.assignedTo === currentUser?.id);
  const todayAttendance = attendance.find(a => 
    a.userId === currentUser?.id && 
    a.date === new Date().toISOString().split('T')[0]
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
              onClick={() => setActiveTab('scanner')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'scanner'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Scanner
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

      {/* Task Completion Modal */}
      {showCompletionModal && selectedTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Task</h3>
            <div className="space-y-4">
              {/* Task Details */}
              <div>
                <h4 className="font-medium text-gray-900">{selectedTask.title}</h4>
                <p className="text-sm text-gray-600">{selectedTask.description}</p>
                <p className="text-sm text-gray-500">Customer Ref: {selectedTask.customerRefNumber}</p>
              </div>
              
              {/* Equipment Used */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Used (Serial Numbers)
                </label>
                <div className="space-y-2">
                  {/* Show available equipment for this task */}
                  {inventory.filter(item => 
                    item.status === 'assigned' && 
                    projects.find(p => p.serialNumbers?.includes(item.serialNumber))?.id === selectedTask.projectId
                  ).map(equipment => (
                    <label key={equipment.id} className="flex items-center p-2 bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={equipmentUsed.includes(equipment.serialNumber)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEquipmentUsed(prev => [...prev, equipment.serialNumber]);
                          } else {
                            setEquipmentUsed(prev => prev.filter(s => s !== equipment.serialNumber));
                          }
                        }}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{equipment.serialNumber}</div>
                        <div className="text-sm text-gray-600">{equipment.model}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Additional Equipment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Equipment/Parts Used
                </label>
                <textarea
                  value={additionalEquipment}
                  onChange={(e) => setAdditionalEquipment(e.target.value)}
                  rows={2}
                  placeholder="List any additional equipment, parts, or materials used..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Completion Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Photos *
                </label>
                <label className="flex items-center justify-center w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 border-2 border-dashed border-gray-300 cursor-pointer">
                  <Camera className="w-5 h-5 mr-2" />
                  Upload Photos ({completionPhotos.length} selected)
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      if (files.length > 0) {
                        setCompletionPhotos(prev => [...prev, ...files.map(f => f.name)]);
                        showToast(`${files.length} photo(s) added`);
                      }
                    }}
                  />
                </label>
                {completionPhotos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {completionPhotos.map((photo, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {photo}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Notes
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={4}
                  placeholder="Describe the work completed, any issues found, and recommendations..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
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
                      <li>Mark all used equipment as installed</li>
                      <li>Add detailed completion notes</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={() => {
                    if (!completionNotes.trim()) {
                      showToast('Please add completion notes', 'error');
                      return;
                    }
                    if (completionPhotos.length === 0) {
                      showToast('Please upload at least one completion photo', 'error');
                      return;
                    }
                    
                    // Update task
                    dispatch({
                      type: 'UPDATE_TASK_STATUS',
                      payload: {
                        taskId: selectedTask.id,
                        status: 'completed',
                        updates: {
                          completionPhotos,
                          notes: completionNotes,
                          equipmentUsed,
                          additionalEquipment,
                          completedAt: new Date().toISOString()
                        }
                      }
                    });
                    
                    // Update equipment status
                    equipmentUsed.forEach(serialNumber => {
                      dispatch({
                        type: 'UPDATE_INVENTORY_STATUS',
                        payload: {
                          serialNumber,
                          status: 'installed',
                          updates: {
                            installDate: new Date().toISOString().split('T')[0],
                            installedBy: currentUser.id
                          }
                        }
                      });
                    });
                    
                    // Update related complaint
                    const relatedComplaint = complaints.find(c => c.id === selectedTask.projectId);
                    if (relatedComplaint) {
                      dispatch({
                        type: 'UPDATE_COMPLAINT',
                        payload: {
                          id: relatedComplaint.id,
                          updates: {
                            workflowStatus: 'work_completed',
                            status: 'resolved',
                            completionPhotos,
                            completionNotes,
                            equipmentUsed,
                            additionalEquipment,
                            completedAt: new Date().toISOString()
                          }
                        }
                      });
                    }
                    
                    showToast('Task completed successfully!');
                    setShowCompletionModal(false);
                    setSelectedTask(null);
                    setCompletionNotes('');
                    setCompletionPhotos([]);
                    setEquipmentUsed([]);
                    setAdditionalEquipment('');
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                >
                  Complete Work
                </button>
                <button
                  onClick={() => {
                    setShowCompletionModal(false);
                    setSelectedTask(null);
                  }}
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