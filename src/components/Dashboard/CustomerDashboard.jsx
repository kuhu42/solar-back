import React, { useState } from 'react';
// import { useApp } from '../../context/AppContext.jsx';
import { useApp } from '../../hooks/useApp.js'
import { PROJECT_STATUS, COMPLAINT_STATUS } from '../../types/index.js';
import PDFPreview from '../Common/PDFPreview.jsx';
import { 
  Briefcase, 
  Search, 
  MessageSquare, 
  FileText,
  Download,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Package,
  Phone,
  Mail
} from 'lucide-react';

const CustomerDashboard = () => {
  const { currentUser, projects, complaints, invoices, inventory, dispatch, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [serialSearch, setSerialSearch] = useState('');
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [pdfType, setPdfType] = useState('invoice');
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    priority: 'medium',
    serialNumber: ''
  });

  const myProjects = projects.filter(p => p.customerId === currentUser?.id);
  const myComplaints = complaints.filter(c => c.customerId === currentUser?.id);
  const myInvoices = invoices.filter(i => i.customerId === currentUser?.id);

  // Show customer reference number prominently
  const customerRefNumber = currentUser?.customerRefNumber;

  const handleSerialSearch = () => {
    if (!serialSearch.trim()) {
      showToast('Please enter a serial number', 'error');
      return;
    }

    const item = inventory.find(i => i.serialNumber === serialSearch);
    if (item) {
      showToast(`Found: ${item.model} - Status: ${item.status.replace('_', ' ')}`);
    } else {
      showToast('Serial number not found', 'error');
    }
  };

  const handleViewDocument = (type) => {
    setPdfType(type);
    setShowPDF(true);
  };

  const handleSubmitComplaint = (e) => {
    e.preventDefault();
    
    const complaint = {
      id: `comp-${Date.now()}`,
      customerRefNumber: currentUser.customerRefNumber,
      customerId: currentUser.id,
      customerName: currentUser.name,
      ...newComplaint,
      status: COMPLAINT_STATUS.OPEN,
      createdAt: new Date().toISOString().split('T')[0]
    };

    dispatch({ type: 'ADD_COMPLAINT', payload: complaint });
    showToast('Complaint submitted successfully!');
    setShowComplaintForm(false);
    setNewComplaint({
      title: '',
      description: '',
      priority: 'medium',
      serialNumber: ''
    });
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
        <div className="flex items-center space-x-4">
          <p className="text-gray-600">Track your projects and manage your solar/wind installations</p>
          {customerRefNumber && (
            <div className="bg-blue-100 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-blue-800">Ref: {customerRefNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Projects"
          value={myProjects.length}
          icon={Briefcase}
          color="bg-blue-500"
          subtitle="Total installations"
        />
        <StatCard
          title="Active Projects"
          value={myProjects.filter(p => p.status === PROJECT_STATUS.IN_PROGRESS).length}
          icon={Clock}
          color="bg-orange-500"
          subtitle="Currently ongoing"
        />
        <StatCard
          title="Completed"
          value={myProjects.filter(p => p.status === PROJECT_STATUS.COMPLETED).length}
          icon={CheckCircle}
          color="bg-green-500"
          subtitle="Successfully finished"
        />
        <StatCard
          title="Open Complaints"
          value={myComplaints.filter(c => c.status === COMPLAINT_STATUS.OPEN).length}
          icon={MessageSquare}
          color="bg-red-500"
          subtitle="Need attention"
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
              onClick={() => setActiveTab('serial-tracker')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'serial-tracker'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Track Equipment
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
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'documents'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Documents
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Recent Projects */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h3>
                <div className="space-y-3">
                  {myProjects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          project.status === PROJECT_STATUS.COMPLETED
                            ? 'bg-green-500'
                            : project.status === PROJECT_STATUS.IN_PROGRESS
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{project.title}</h4>
                          <p className="text-sm text-gray-600">{project.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === PROJECT_STATUS.COMPLETED
                            ? 'bg-green-100 text-green-800'
                            : project.status === PROJECT_STATUS.IN_PROGRESS
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          ${project.value.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('serial-tracker')}
                  className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Search className="w-6 h-6 text-blue-600 mr-3" />
                  <span className="font-medium text-blue-900">Track Equipment</span>
                </button>
                
                <button
                  onClick={() => setShowComplaintForm(true)}
                  className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <MessageSquare className="w-6 h-6 text-red-600 mr-3" />
                  <span className="font-medium text-red-900">Report Issue</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('documents')}
                  className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <FileText className="w-6 h-6 text-green-600 mr-3" />
                  <span className="font-medium text-green-900">View Documents</span>
                </button>
              </div>

              {/* Project Status Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
                {myProjects.map((project) => (
                  <div key={project.id} className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-3">{project.title}</h4>
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                      {[
                        'lead_generated',
                        'quotation_sent', 
                        'bank_process',
                        'meter_applied',
                        'ready_for_installation',
                        'installation_complete',
                        'commissioned',
                        'active'
                      ].map((stage, index) => {
                        const isCompleted = [
                          'lead_generated',
                          'quotation_sent',
                          'bank_process',
                          'meter_applied',
                          'ready_for_installation',
                          'installation_complete'
                        ].indexOf(project.pipeline_stage) >= index;
                        const isCurrent = project.pipeline_stage === stage;
                        
                        return (
                          <div key={stage} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                              isCompleted 
                                ? 'bg-green-500 text-white' 
                                : isCurrent
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-300 text-gray-600'
                            }`}>
                              {isCompleted ? '✓' : index + 1}
                            </div>
                            {index < 7 && (
                              <div className={`w-8 h-1 ${
                                isCompleted ? 'bg-green-500' : 'bg-gray-300'
                              }`}></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-sm text-gray-600 mt-2 capitalize">
                      Current Stage: {project.pipeline_stage?.replace('_', ' ')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Solar Panel Maintenance Completed</p>
                      <p className="text-xs text-green-700">Your solar panels have been inspected and cleaned</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Installation In Progress</p>
                      <p className="text-xs text-blue-700">Your residential solar installation is 75% complete</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">My Projects</h3>
              <div className="grid gap-6">
                {myProjects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                        <p className="text-gray-600 mt-1">{project.description}</p>
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {project.location}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Started: {project.startDate}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            ${project.value.toLocaleString()}
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

                    {/* Equipment Serial Numbers */}
                    {project.serialNumbers.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 mt-4">
                        <h5 className="font-medium text-gray-900 mb-2">Equipment Serial Numbers:</h5>
                        <div className="flex flex-wrap gap-2">
                          {project.serialNumbers.map((serial) => (
                            <span key={serial} className="px-2 py-1 bg-white border border-gray-200 rounded text-sm font-mono">
                              {serial}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3 mt-4">
                      <button className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm">
                        <Phone className="w-4 h-4 mr-2" />
                        Contact Agent
                      </button>
                      <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                        <FileText className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'serial-tracker' && (
            <div className="space-y-6">
              <div className="text-center">
                <Package className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Your Equipment</h3>
                <p className="text-gray-600">Enter a serial number to track your solar panels, inverters, or wind turbines</p>
              </div>

              <div className="max-w-md mx-auto">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={serialSearch}
                    onChange={(e) => setSerialSearch(e.target.value)}
                    placeholder="Enter serial number (e.g., SP001)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSerialSearch}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Track
                  </button>
                </div>
              </div>

              {/* My Equipment */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">My Equipment</h4>
                <div className="grid gap-3">
                  {inventory.filter(item => 
                    myProjects.some(project => project.serialNumbers.includes(item.serialNumber))
                  ).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-900">{item.serialNumber}</h5>
                        <p className="text-sm text-gray-600">{item.model} • {item.type.replace('_', ' ')}</p>
                        {item.installDate && (
                          <p className="text-xs text-gray-500">Installed: {item.installDate}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'installed'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'maintenance'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Warranty: {item.warrantyExpiry}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">My Complaints</h3>
                <button
                  onClick={() => setShowComplaintForm(true)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Report Issue
                </button>
              </div>

              <div className="grid gap-4">
                {myComplaints.map((complaint) => (
                  <div key={complaint.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{complaint.title}</h4>
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
                        <p className="text-gray-600 mb-2">{complaint.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {complaint.createdAt}
                          </span>
                          {complaint.serialNumber && (
                            <span className="flex items-center">
                              <Package className="w-4 h-4 mr-1" />
                              {complaint.serialNumber}
                            </span>
                          )}
                          {complaint.assignedToName && (
                            <span>Assigned to: {complaint.assignedToName}</span>
                          )}
                        </div>
                      </div>
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
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">My Documents</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Installation Certificates */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Installation Certificate</h4>
                        <p className="text-sm text-gray-600">Solar Panel Installation</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleViewDocument('certificate')}
                    className="flex items-center w-full px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    View PDF
                  </button>
                </div>

                {/* Warranty Documents */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-green-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Warranty Certificate</h4>
                        <p className="text-sm text-gray-600">10-year warranty</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleViewDocument('warranty')}
                    className="flex items-center w-full px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    View PDF
                  </button>
                </div>

                {/* Maintenance Records */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-purple-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Maintenance Records</h4>
                        <p className="text-sm text-gray-600">Service history</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleViewDocument('maintenance')}
                    className="flex items-center w-full px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    View PDF
                  </button>
                </div>

                {/* Invoices */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-orange-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Invoices</h4>
                        <p className="text-sm text-gray-600">{myInvoices.length} documents</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleViewDocument('invoice')}
                    className="flex items-center w-full px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    View Invoices
                  </button>
                </div>

                {/* User Manual */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-gray-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">User Manual</h4>
                        <p className="text-sm text-gray-600">Operation guide</p>
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center w-full px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                </div>

                {/* Performance Reports */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-indigo-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Performance Reports</h4>
                        <p className="text-sm text-gray-600">Monthly reports</p>
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center w-full px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Complaint Form Modal */}
      {showComplaintForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report an Issue</h3>
            <form onSubmit={handleSubmitComplaint} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Title
                </label>
                <input
                  type="text"
                  value={newComplaint.title}
                  onChange={(e) => setNewComplaint({...newComplaint, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({...newComplaint, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newComplaint.priority}
                  onChange={(e) => setNewComplaint({...newComplaint, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment Serial Number (Optional)
                </label>
                <input
                  type="text"
                  value={newComplaint.serialNumber}
                  onChange={(e) => setNewComplaint({...newComplaint, serialNumber: e.target.value})}
                  placeholder="e.g., SP001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                >
                  Submit Complaint
                </button>
                <button
                  type="button"
                  onClick={() => setShowComplaintForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      <PDFPreview
        isOpen={showPDF}
        onClose={() => setShowPDF(false)}
        type={pdfType}
        data={{
          customerName: currentUser?.name,
          amount: 25000,
          invoiceNumber: "INV-2024-001"
        }}
      />
    </div>
  );
};

export default CustomerDashboard;