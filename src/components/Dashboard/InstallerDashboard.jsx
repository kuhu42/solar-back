import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { TASK_STATUS, INVENTORY_STATUS, PROJECT_STATUS } from '../../types/index.js';
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
  Package,
  Users,
  DollarSign
} from 'lucide-react';

const InstallerDashboard = () => {
  const { currentUser, tasks, attendance, inventory, projects, dispatch, showToast,markInstallationComplete,updateInventoryStatus,updateTask } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [checkingIn, setCheckingIn] = useState(false);
  const [scannerInput, setScannerInput] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [showCustomerDetails, setShowCustomerDetails] = useState(null);

  const myTasks = tasks.filter(t => t.assignedTo === currentUser?.id);
  const myProjects = projects.filter(p => 
  p.installer_id === currentUser?.id || 
  p.installerId === currentUser?.id
);
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

  const handleScanSerial = async() => {
    if (!scannerInput.trim()) {
      showToast('Please enter a serial number', 'error');
      return;
    }

    const inventoryItem = inventory.find(item => item.serialNumber === scannerInput);
    if (inventoryItem) {
      const project = projects.find(p => p.serialNumbers?.includes(scannerInput));
      const customerRef = project ? ` - Customer Ref: ${project.customerRefNumber}` : '';
      showToast(`Scanned: ${inventoryItem.model} (${inventoryItem.serialNumber})${customerRef}`);
      
try {
  await updateInventoryStatus(scannerInput, INVENTORY_STATUS.INSTALLED, {
    installDate: new Date().toISOString().split('T')[0]
  });
} catch (error) {
  showToast('Error updating inventory: ' + error.message, 'error');
}
    } else {
      showToast('Serial number not found in inventory', 'error');
    }
    
    setScannerInput('');
  };

const handleCompleteProject = async(projectId) => {
  try {
    console.log('Marking project installation complete...');
    await markInstallationComplete(projectId, completionNotes);

    // Update inventory status for all equipment in this project
    const project = myProjects.find(p => p.id === projectId);
    if (project && (project.serial_numbers || project.serialNumbers)) {
      const serialNumbers = project.serial_numbers || project.serialNumbers;
      for (const serialNumber of serialNumbers) {
        try {
          await updateInventoryStatus(serialNumber, INVENTORY_STATUS.INSTALLED, {
            install_date: new Date().toISOString().split('T')[0],
            installed_by: currentUser.name
          });
          console.log(`âœ… Updated inventory ${serialNumber}`);
        } catch (inventoryError) {
          console.error(`âŒ Failed to update inventory ${serialNumber}:`, inventoryError);
        }
      }
    }

    showToast('Installation marked as complete! Project is now ready for final approval.');
    setSelectedProject(null);
    setCompletionNotes('');
    
    // Refresh projects data
    if (isLiveMode) {
      const updatedProjects = await dbService.getProjects();
      dispatch({ type: 'SET_PROJECTS', payload: updatedProjects });
    }
    
  } catch (error) {
    console.error('Error completing installation:', error);
    showToast('Error completing installation: ' + error.message, 'error');
  }
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
          <p className="text-gray-600">Manage your installation projects and equipment</p>
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
  title="Assigned Projects"
  value={myProjects.length}
  icon={Wrench}
  color="bg-blue-500"
/>
<StatCard
  title="Pending Installation"
  value={myProjects.filter(p => !p.installation_complete && !p.installationComplete).length}
  icon={Clock}
  color="bg-orange-500"
/>
<StatCard
  title="Completed Projects"
  value={myProjects.filter(p => p.installation_complete || p.installationComplete).length}
  icon={CheckCircle}
  color="bg-green-500"
/>
<StatCard
  title="Equipment to Install"
  value={myProjects.reduce((sum, p) => sum + (p.serial_numbers?.length || p.serialNumbers?.length || 0), 0)}
  icon={Package}
  color="bg-purple-500"
/>
      </div>
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
              {/* Today's Projects */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Projects</h3>
                <div className="space-y-3">
                  {myProjects.filter(p => !p.installation_complete && !p.installationComplete).slice(0, 3).map((project) => (
  <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div className="flex items-center space-x-3">
      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
      <div>
        <h4 className="font-medium text-gray-900">{project.title}</h4>
        <p className="text-sm text-gray-600">{project.description}</p>
        <p className="text-xs text-gray-500">
          Customer: {project.customer_name || project.customerName} 
          (Ref: {project.customer_ref_number || project.customerRefNumber})
        </p>
        {(project.serial_numbers || project.serialNumbers) && (
          <p className="text-xs text-gray-500">
            Equipment: {(project.serial_numbers || project.serialNumbers).length} items
          </p>
        )}
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-medium text-gray-900">{project.location}</p>
      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
        Pending Installation
      </span>
    </div>
  </div>
))}
                  
                  {myProjects.filter(p => !p.installationComplete).length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h4 className="font-medium text-gray-900 mb-2">All Projects Completed!</h4>
                      <p className="text-gray-600">Great job! You've completed all assigned installations.</p>
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
                        {todayAttendance.checkOut && ` â€¢ Check-out: ${todayAttendance.checkOut}`}
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

          {activeTab === 'projects' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">My Installation Projects</h3>
              <div className="grid gap-4">
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
                        </div>
                        <p className="text-gray-600 mt-1">{project.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
  <span className="flex items-center">
    <Users className="w-4 h-4 mr-1" />
    Customer: {project.customer_name || project.customerName} 
    (Ref: {project.customer_ref_number || project.customerRefNumber})
  </span>
  <span className="flex items-center">
    <MapPin className="w-4 h-4 mr-1" />
    {project.location}
  </span>
  <span className="flex items-center">
    <DollarSign className="w-4 h-4 mr-1" />
    â‚¹{project.value.toLocaleString()}
  </span>
</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.installationComplete
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {project.installationComplete ? 'Installation Complete' : 'Pending Installation'}
                        </span>
                      </div>
                    </div>

                    {/* Equipment to Install */}
                    {(project.serial_numbers || project.serialNumbers) && (project.serial_numbers || project.serialNumbers).length > 0 && (
  <div className="bg-gray-50 rounded-lg p-4 mt-4">
    <h5 className="font-medium text-gray-900 mb-2">Equipment to Install:</h5>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {(project.serial_numbers || project.serialNumbers).map(serial => {
        const item = inventory.find(i => i.serialNumber === serial || i.serial_number === serial);
        return (
          <div key={serial} className="flex items-center space-x-2 bg-white border border-gray-200 rounded px-3 py-2">
            <Package className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-sm font-mono block">{serial}</span>
              {item && (
                <span className="text-xs text-gray-500">{item.model}</span>
              )}
            </div>
            <span className={`w-2 h-2 rounded-full ${
              item?.status === INVENTORY_STATUS.INSTALLED ? 'bg-green-500' : 'bg-orange-500'
            }`}></span>
          </div>
        );
      })}
    </div>
  </div>
)}

                    <div className="flex items-center space-x-3 mt-4">
  {!(project.installation_complete || project.installationComplete) && (
    <button
      onClick={() => setSelectedProject(project)}
      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
    >
      <CheckCircle className="w-4 h-4 mr-2" />
      Mark Installation Complete
    </button>
  )}

  <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
    <Camera className="w-4 h-4 mr-2" />
    Add Photos
  </button>

  <button className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm">
    <FileText className="w-4 h-4 mr-2" />
    View Details
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
                <p className="text-gray-600">Scan or enter serial numbers to track equipment installation</p>
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
                        Install
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

              {/* Equipment for Current Projects */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Equipment for My Projects</h4>
                <div className="grid gap-3">
                  {myProjects.flatMap(project => 
                    project.serialNumbers?.map(serial => {
                      const item = inventory.find(i => i.serialNumber === serial);
                      return item ? { ...item, projectTitle: project.title, customerRef: project.customerRefNumber } : null;
                    }).filter(Boolean) || []
                  ).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-900">{item.serialNumber}</h5>
                        <p className="text-sm text-gray-600">{item.model} â€¢ {item.type.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">Project: {item.projectTitle}</p>
                        <p className="text-xs text-gray-500">Customer Ref: {item.customerRef}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === INVENTORY_STATUS.INSTALLED
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                        {item.installDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Installed: {item.installDate}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Completion Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mark Installation Complete</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{selectedProject.title}</h4>
                <p className="text-sm text-gray-600">Customer: {selectedProject.customerName}</p>
                <p className="text-sm text-gray-600">Equipment: {selectedProject.serialNumbers?.length || 0} items</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Installation Notes
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={4}
                  placeholder="Add any notes about the completed installation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Before completing:</p>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      <li>All equipment properly installed and tested</li>
                      <li>Installation photos taken</li>
                      <li>Customer walkthrough completed</li>
                      <li>All serial numbers scanned and verified</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={() => handleCompleteProject(selectedProject.id)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                >
                  Mark Complete
                </button>
                <button
                  onClick={() => setSelectedProject(null)}
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