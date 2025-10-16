import React, { useState } from 'react';
// import { useApp } from '../../context/AppContext.jsx';
import { useApp } from '../../hooks/useApp.js'
import { COMPLAINT_STATUS, TASK_STATUS } from '../../types/index.js';
import { STAGE_LABELS, STAGE_COLORS } from '../../types/index.js';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Scan,
  Camera,
  FileText,
  Key,
  Phone,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';

const mockSerials = [
  'GKA96M560H20200902RX025',
  'GKA96M560H20200902RX026',
  'GKA96M560H20200902RX027',
  'GKA96M560H20200902RX028',
  'GKA96M560H20200902RX029'
];

const TechnicianDashboard = () => {
  const { currentUser, complaints, tasks, invoices, dispatch, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [customerOtp, setCustomerOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [scannerInput, setScannerInput] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const myComplaints = complaints.filter(c => c.assignedTo === currentUser?.id);
  const myTasks = tasks.filter(t => t.assignedTo === currentUser?.id && t.type === 'maintenance');
  const myInvoices = invoices.filter(i => i.items.some(item => item.description.includes('Maintenance')));

  const handleVerifyOtp = () => {
    if (customerOtp === '123456') {
      setOtpVerified(true);
      setShowOtpModal(false);
      showToast('Customer OTP verified! You can now start working.');
      setCustomerOtp('');
    } else {
      showToast('Invalid OTP. Please ask customer for correct OTP.', 'error');
    }
  };

  const handleScanSerial = () => {
    if (!scannerInput.trim()) {
      showToast('Please enter a serial number', 'error');
      return;
    }

    // Find the customer reference number associated with this serial
    const project = projects.find(p => p.serialNumbers.includes(scannerInput));
    if (project) {
      showToast(`Serial verified: ${scannerInput} (Customer Ref: ${project.customerRefNumber})`);
    } else {
      showToast(`Serial verified: ${scannerInput}`);
    }
    setScannerInput('');
  };

  const handleResolveComplaint = (complaintId) => {
    dispatch({
      type: 'UPDATE_COMPLAINT_STATUS',
      payload: { complaintId, status: COMPLAINT_STATUS.RESOLVED }
    });
    showToast('Complaint resolved successfully!');
    setSelectedComplaint(null);
    setResolutionNotes('');
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
          <h1 className="text-2xl font-bold text-gray-900">Technician Dashboard</h1>
          <p className="text-gray-600">Handle maintenance requests and customer complaints</p>
        </div>
        
        {/* OTP Verification Button */}
        {!otpVerified && (
          <button
            onClick={() => setShowOtpModal(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 animate-pulse"
          >
            <Key className="w-4 h-4 mr-2" />
            Verify Customer OTP
          </button>
        )}
        
        {otpVerified && (
          <div className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
            <CheckCircle className="w-4 h-4 mr-2" />
            OTP Verified - Ready to Work
          </div>
        )}
      </div>

      {/* OTP Warning Banner */}
      {!otpVerified && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h4 className="font-medium text-red-900">Customer OTP Required</h4>
              <p className="text-sm text-red-700">
                You must verify the customer's OTP before starting any maintenance work. Ask the customer for their 6-digit OTP.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Open Complaints"
          value={myComplaints.filter(c => c.status === COMPLAINT_STATUS.OPEN).length}
          icon={MessageSquare}
          color="bg-red-500"
        />
        <StatCard
          title="In Progress"
          value={myComplaints.filter(c => c.status === COMPLAINT_STATUS.IN_PROGRESS).length}
          icon={Clock}
          color="bg-blue-500"
        />
        <StatCard
          title="Resolved"
          value={myComplaints.filter(c => c.status === COMPLAINT_STATUS.RESOLVED).length}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Maintenance Tasks"
          value={myTasks.length}
          icon={AlertTriangle}
          color="bg-orange-500"
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
              onClick={() => setActiveTab('complaints')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'complaints'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Complaints
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'tools'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tools
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'invoices'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Invoices
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Priority Complaints */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Complaints</h3>
                <div className="space-y-3">
                  {myComplaints.filter(c => c.priority === 'high' || c.priority === 'urgent').slice(0, 3).map((complaint) => (
                    <div key={complaint.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">{complaint.title}</h4>
                          <p className="text-sm text-gray-600">{complaint.customerName}</p>
                          {complaint.serialNumber && (
                            <p className="text-xs text-gray-500">Serial: {complaint.serialNumber}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          complaint.priority === 'urgent'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {complaint.priority}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{complaint.createdAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Customer OTP Verification</h4>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customerOtp}
                      onChange={(e) => setCustomerOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="flex-1 px-3 py-2 border border-blue-300 rounded text-sm"
                      maxLength="6"
                    />
                    <button
                      onClick={handleVerifyOtp}
                      className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">Demo OTP: 123456</p>
                </div>

                <button
                  onClick={() => setActiveTab('tools')}
                  className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Scan className="w-6 h-6 text-green-600 mr-3" />
                  <span className="font-medium text-green-900">Serial Scanner</span>
                </button>

                <label className="flex items-center justify-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
                  <Camera className="w-6 h-6 text-purple-600 mr-3" />
                  <span className="font-medium text-purple-900">Take Photos</span>
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
              </div>

              {/* Today's Schedule */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
                <div className="space-y-3">
                  {myTasks.slice(0, 3).map((task) => (
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                  ))}
                </div>
                
                <div className="text-center">
                  <label className="flex items-center justify-center w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border-2 border-dashed border-gray-300 cursor-pointer">
                    Upload Serial Number Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Mock OCR processing
                          setTimeout(() => {
                            setScannerInput('GKA96M560H20200902RX025');
                            showToast('OCR detected serial: GKA96M560H20200902RX025');
                          }, 2000);
                          showToast('Processing image with OCR...');
                        }
                      }}
                    />
                  </label>
                </div>
                
                <div className="text-center">
                  <label className="flex items-center justify-center w-full px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 border-2 border-dashed border-purple-300 cursor-pointer">
                    <FileText className="w-5 h-5 mr-2" />
                    Upload Documentation
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          showToast(`Document "${file.name}" uploaded successfully!`);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Customer Complaints</h3>
              <div className="grid gap-4">
                {myComplaints.map((complaint) => (
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
                              : complaint.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
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
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          complaint.status === COMPLAINT_STATUS.RESOLVED
                            ? 'bg-green-100 text-green-800'
                            : complaint.status === COMPLAINT_STATUS.IN_PROGRESS
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {complaint.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {complaint.status === COMPLAINT_STATUS.OPEN && (
                        <button
                          onClick={() => {
                            if (!otpVerified) {
                              showToast('Please verify customer OTP first', 'error');
                              setShowOtpModal(true);
                              return;
                            }
                            dispatch({
                              type: 'UPDATE_COMPLAINT_STATUS',
                              payload: { complaintId: complaint.id, status: COMPLAINT_STATUS.IN_PROGRESS }
                            });
                            showToast('Complaint status updated to In Progress');
                          }}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Start Work
                        </button>
                      )}
                      
                      {complaint.status === COMPLAINT_STATUS.IN_PROGRESS && (
                        <button
                          onClick={() => {
                            if (!otpVerified) {
                              showToast('Please verify customer OTP first', 'error');
                              setShowOtpModal(true);
                              return;
                            }
                            setSelectedComplaint(complaint);
                          }}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Resolved
                        </button>
                      )}

                      <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                        <Camera className="w-4 h-4 mr-2" />
                        Add Photos
                      </button>

                      <button className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Customer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-6">
              <div className="text-center">
                <Scan className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Serial Number Verification</h3>
                <p className="text-gray-600">Scan or enter serial numbers to verify equipment</p>
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
                        Verify
                      </button>
                    </div>
                  </div>

                  <div className="text-center">
                    <button className="flex items-center justify-center w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border-2 border-dashed border-gray-300">
                      <Camera className="w-5 h-5 mr-2" />
                      Use Camera to Scan
                    </button>
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
                            // Mock OCR processing
                            setTimeout(() => {
                              setScannerInput('GKA96M560H20200902RX025');
                              const randomSerial = mockSerials[Math.floor(Math.random() * mockSerials.length)];
                              setScannerInput(randomSerial);
                              showToast(`OCR detected serial: ${randomSerial}`);
                            }, 2000);
                            showToast('Processing image with OCR...');
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Customer OTP Section */}
              <div className={`max-w-md mx-auto border rounded-lg p-6 ${
                otpVerified ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
              }`}>
                <h4 className="font-medium text-blue-900 mb-4">Customer OTP Verification</h4>
                
                {otpVerified ? (
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <p className="text-green-800 font-medium">OTP Verified Successfully!</p>
                    <p className="text-sm text-green-700 mt-1">You can now perform maintenance tasks.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-blue-700 mb-4">
                      Ask the customer for their OTP before starting any maintenance work.
                    </p>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={customerOtp}
                        onChange={(e) => setCustomerOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        className="flex-1 px-3 py-2 border border-blue-300 rounded-lg"
                        maxLength="6"
                      />
                      <button
                        onClick={handleVerifyOtp}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Verify
                      </button>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">Demo OTP: 123456</p>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Invoices</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {myInvoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${invoice.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : invoice.status === 'sent'
                              ? 'bg-blue-100 text-blue-800'
                              : invoice.status === 'overdue'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.createdAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer OTP Verification Required</h3>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                  <p className="text-sm text-red-800">
                    You must verify the customer's OTP before starting any work. This ensures customer authorization.
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Customer OTP
                </label>
                <input
                  type="text"
                  value={customerOtp}
                  onChange={(e) => setCustomerOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength="6"
                />
                <p className="text-xs text-gray-500 mt-1">Demo OTP: 123456</p>
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={handleVerifyOtp}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Verify OTP
                </button>
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Resolution Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolve Complaint</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{selectedComplaint.title}</h4>
                <p className="text-sm text-gray-600">{selectedComplaint.description}</p>
                <p className="text-sm text-gray-500 mt-1">Customer: {selectedComplaint.customerName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Notes
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                  placeholder="Describe how the issue was resolved..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={() => handleResolveComplaint(selectedComplaint.id)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => setSelectedComplaint(null)}
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

export default TechnicianDashboard;