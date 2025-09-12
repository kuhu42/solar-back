
import React, { useState } from 'react';
// import { useApp } from '../../context/AppContext.jsx';
import { useApp } from '../../hooks/useApp.js'
//import { PROJECT_STATUS, TASK_STATUS } from '../../types/index.js';
import WhatsAppPreview from '../Common/WhatsAppPreview.jsx';
import { PROJECT_STATUS, TASK_STATUS, PIPELINESTAGES } from '../../types/index.js';
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
  Monitor,
  Smartphone,
  Sun,
  Bell,
  Settings,
  Menu,
  Search,
  Filter,
  Plus,
  ChevronRight,
  Star,
  Zap
} from 'lucide-react';

const AgentDashboard = () => {
  const { currentUser, projects, tasks, attendance, dispatch, showToast, approveProject } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [checkingIn, setCheckingIn] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [quotationData, setQuotationData] = useState(null);
  const [sendingQuote, setSendingQuote] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  // const pendingReviewProjects = projects.filter(p => 
  //   p.status === PROJECT_STATUS.PENDINGAGENTREVIEW
  // );
  const pendingReviewProjects = projects.filter(p => 
    p.status === 'pending' && 
    p.metadata?.requires_agent_review === true
  );

  // Demo project data
  const demoProjects = [
    {
      id: 'proj-001',
      title: 'Mumbai Bandra West Solar Installation',
      description: '5kW rooftop solar system with net metering',
      customerName: 'Rajesh Sharma',
      location: 'Bandra West, Mumbai',
      value: 325000,
      status: PROJECT_STATUS.IN_PROGRESS,
      pipeline_stage: 'ready_for_installation',
      assignedTo: currentUser?.id,
      priority: 'high',
      progress: 75,
      type: 'Residential'
    },
    {
      id: 'proj-002', 
      title: 'Pune Koramangala Commercial Solar',
      description: '15kW commercial solar setup with battery backup',
      customerName: 'Tech Solutions Pvt Ltd',
      location: 'Koramangala, Pune',
      value: 875000,
      status: PROJECT_STATUS.APPROVED,
      pipeline_stage: 'bank_process',
      assignedTo: currentUser?.id,
      priority: 'medium',
      progress: 45,
      type: 'Commercial'
    },
    {
      id: 'proj-003',
      title: 'Delhi NCR Gurgaon Residential',
      description: '8kW solar system with smart monitoring',
      customerName: 'Priya Mehta',
      location: 'Sector 47, Gurgaon',
      value: 520000,
      status: PROJECT_STATUS.PENDING,
      pipeline_stage: 'quotation_sent',
      assignedTo: currentUser?.id,
      priority: 'low',
      progress: 25,
      type: 'Residential'
    },
    {
      id: 'proj-004',
      title: 'Bangalore HSR Layout Solar',
      description: '6kW rooftop installation with grid tie',
      customerName: 'Suresh Kumar',
      location: 'HSR Layout, Bangalore',
      value: 385000,
      status: PROJECT_STATUS.COMPLETED,
      pipeline_stage: 'active',
      assignedTo: currentUser?.id,
      priority: 'high',
      progress: 100,
      type: 'Residential'
    }
  ];

  const myProjects = demoProjects.length > 0 ? demoProjects : projects.filter(p => p.assignedTo === currentUser?.id);
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
 

  // const handleApproveProject = async (projectId) => {
  //   try {
  //     await approveProject(projectId, {
  //       status: 'approved',
  //       pipeline_stage: 'agent_assigned', 
  //       agent_id: currentUser?.id,
  //       assigned_to: currentUser?.id,  // Assign to agent
  //       assigned_to_name: currentUser?.name,
  //       metadata: {
  //         ...project.metadata,
  //         agent_approved: true,
  //         agent_approved_at: new Date().toISOString(),
  //         requires_admin_review: true  // Flag for admin review
  //       }
  //     })
  //     showToast('Project approved and assigned to you!', 'success')
  //   } catch (error) {
  //     showToast('Error approving project: ' + error.message, 'error')
  //   }
  // };
  const handleApproveProject = async (project) => {
    try {
      await approveProject(project.id, {
        status: PROJECT_STATUS.AGENTAPPROVED,
        pipeline_stage: PIPELINESTAGES.AGENTAPPROVED,
        agent_id: currentUser?.id,
        assigned_to: currentUser?.id,
        assigned_to_name: currentUser?.name,
        metadata: {
          ...project.metadata,  // ✅ Now 'project' is defined!
          agent_approved: true,
          agent_approved_at: new Date().toISOString(),
          requires_admin_review: true
        }
      })
      showToast('Project approved!', 'success')
    } catch (error) {
      showToast('Error approving project: ' + error.message, 'error')
    }
  };
  const handleSendToAdmin = async (projectId) => {
    try {
      await approveProject(projectId, {
        status: PROJECT_STATUS.PENDINGADMINREVIEW,
        pipeline_stage: PIPELINESTAGES.PENDINGADMINREVIEW
      })
      showToast('Project sent to admin for final approval!', 'success')
    } catch (error) {
      showToast('Error sending to admin: ' + error.message, 'error')
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
      payload: { projectId, pipeline_stage: stage }
    });
    showToast('Project stage updated!');
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${
      isMobileView ? 'p-4' : 'p-6'
    } ${isMobileView ? 'relative overflow-hidden' : ''}`}>
      {isMobileView && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-50 to-transparent rounded-full -translate-y-4 translate-x-4"></div>
      )}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className={`text-sm font-medium text-gray-600 ${isMobileView ? 'text-xs' : ''}`}>
            {title}
          </p>
          <p className={`font-bold text-gray-900 mt-2 ${
            isMobileView ? 'text-2xl' : 'text-3xl'
          }`}>
            {value}
          </p>
          {isMobileView && trend && (
            <p className="text-xs text-green-600 font-medium mt-1">↗ {trend}</p>
          )}
        </div>
        <div className={`rounded-lg flex items-center justify-center ${color} ${
          isMobileView ? 'w-10 h-10' : 'w-12 h-12'
        }`}>
          <Icon className={`text-white ${isMobileView ? 'w-5 h-5' : 'w-6 h-6'}`} />
        </div>
      </div>
    </div>
  );

  const MobileHeader = () => (
    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Sun className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">GreenSolar</h1>
              <p className="text-green-100 text-sm">Agent Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 bg-white/20 rounded-full">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 bg-white/20 rounded-full">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Welcome back,</p>
            <p className="font-semibold text-lg">{currentUser?.name || 'Agent'}</p>
          </div>
          <div className="text-right">
            <p className="text-green-100 text-xs">Today</p>
            <p className="font-medium">{new Date().toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>
      </div>
      
      {/* Mobile Quick Actions */}
      <div className="px-4 pb-4">
        <div className="flex space-x-3">
          {!todayAttendance ? (
            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl py-3 px-4 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{checkingIn ? 'Checking In...' : 'Check In'}</span>
            </button>
          ) : !todayAttendance.checkOut ? (
            <button
              onClick={handleCheckOut}
              className="flex-1 bg-red-500/80 backdrop-blur-sm rounded-xl py-3 px-4 flex items-center justify-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Check Out</span>
            </button>
          ) : (
            <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl py-3 px-4 flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Day Complete</span>
            </div>
          )}
          
          <button
            onClick={() => setIsMobileView(false)}
            className="bg-white/20 backdrop-blur-sm rounded-xl py-3 px-4 flex items-center justify-center"
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const DesktopHeader = () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <Sun className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              <span className="text-green-600">Green</span>Solar
            </h1>
            <p className="text-gray-600">Agent Dashboard</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setIsMobileView(true)}
          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          <Smartphone className="w-4 h-4 mr-1" />
          Mobile View
        </button>

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
  );

  const MobileBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-bottom">
      <div className="flex justify-around">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
            activeTab === 'overview'
              ? 'text-green-600 bg-green-50'
              : 'text-gray-500'
          }`}
        >
          <Sun className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
            activeTab === 'projects'
              ? 'text-green-600 bg-green-50'
              : 'text-gray-500'
          }`}
        >
          <FileText className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Projects</span>
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
            activeTab === 'customers'
              ? 'text-green-600 bg-green-50'
              : 'text-gray-500'
          }`}
        >
          <Users className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Customers</span>
        </button>
        <button className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-500">
          <Plus className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Add</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={`${isMobileView ? 'min-h-screen bg-gray-50 pb-20' : 'space-y-6'}`}>
      {/* Header */}
      {isMobileView ? <MobileHeader /> : <DesktopHeader />}

      {/* Stats Grid */}
      <div className={`${isMobileView ? 'px-4 -mt-6 relative z-10' : ''}`}>
        <div className={`grid gap-6 ${
          isMobileView 
            ? 'grid-cols-2 gap-4' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }`}>
          <StatCard
            title="My Projects"
            value={myProjects.length}
            icon={FileText}
            color="bg-blue-500"
            trend="+12%"
          />
          <StatCard
            title="Active Tasks"
            value={myTasks.filter(t => t.status !== TASK_STATUS.COMPLETED).length}
            icon={Clock}
            color="bg-orange-500"
            trend="+5%"
          />
          <StatCard
            title="Completed"
            value={myTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length}
            icon={CheckCircle}
            color="bg-green-500"
            trend="+8%"
          />
          <StatCard
            title="Total Value"
            value={`₹${(myProjects.reduce((sum, p) => sum + p.value, 0) / 100000).toFixed(1)}L`}
            icon={DollarSign}
            color="bg-purple-500"
            trend="+15%"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className={`${isMobileView ? 'px-4 mt-6' : ''}`}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {!isMobileView && (
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
                  onClick={() => setActiveTab('review')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'review' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Review ({pendingReviewProjects.length})
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
          )}

          <div className={isMobileView ? 'p-4' : 'p-6'}>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Today's Schedule */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-semibold text-gray-900 ${
                      isMobileView ? 'text-base' : 'text-lg'
                    }`}>
                      Today's Schedule
                    </h3>
                    {isMobileView && (
                      <button className="text-green-600 text-sm font-medium">View All</button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between bg-blue-50 rounded-lg ${
                      isMobileView ? 'p-3' : 'p-4'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <h4 className={`font-medium text-gray-900 ${
                            isMobileView ? 'text-sm' : ''
                          }`}>
                            Site Visit - Mumbai Project
                          </h4>
                          <p className={`text-gray-600 ${
                            isMobileView ? 'text-xs' : 'text-sm'
                          }`}>
                            Rooftop assessment for 5kW installation
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium text-gray-900 ${
                          isMobileView ? 'text-xs' : 'text-sm'
                        }`}>
                          10:00 AM
                        </p>
                        {isMobileView && <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />}
                      </div>
                    </div>
                    
                    <div className={`flex items-center justify-between bg-green-50 rounded-lg ${
                      isMobileView ? 'p-3' : 'p-4'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <h4 className={`font-medium text-gray-900 ${
                            isMobileView ? 'text-sm' : ''
                          }`}>
                            Follow-up Call - Pune Client
                          </h4>
                          <p className={`text-gray-600 ${
                            isMobileView ? 'text-xs' : 'text-sm'
                          }`}>
                            Discuss quotation and financing
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium text-gray-900 ${
                          isMobileView ? 'text-xs' : 'text-sm'
                        }`}>
                          2:30 PM
                        </p>
                        {isMobileView && <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance Status */}
                {todayAttendance && (
                  <div className={`bg-green-50 border border-green-200 rounded-lg ${
                    isMobileView ? 'p-3' : 'p-4'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-medium text-green-900 ${
                          isMobileView ? 'text-sm' : ''
                        }`}>
                          Today's Attendance
                        </h4>
                        <p className={`text-green-700 ${
                          isMobileView ? 'text-xs' : 'text-sm'
                        }`}>
                          Check-in: {todayAttendance.checkIn}
                          {todayAttendance.checkOut && ` • Check-out: ${todayAttendance.checkOut}`}
                        </p>
                      </div>
                      <CheckCircle className={`text-green-600 ${
                        isMobileView ? 'w-6 h-6' : 'w-8 h-8'
                      }`} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold text-gray-900 ${
                    isMobileView ? 'text-base' : 'text-lg'
                  }`}>
                    My Projects ({myProjects.length})
                  </h3>
                  {isMobileView && (
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Search className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Filter className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                {myProjects.map((project) => (
                  <div key={project.id} className={`border border-gray-200 rounded-lg ${
                    isMobileView ? 'p-4' : 'p-6'
                  } ${isMobileView ? 'shadow-sm' : ''}`}>
                    <div className={`flex items-start justify-between mb-4 ${
                      isMobileView ? 'flex-col space-y-3' : ''
                    }`}>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className={`font-medium text-gray-900 ${
                            isMobileView ? 'text-base' : 'text-lg'
                          }`}>
                            {project.title}
                          </h4>
                          {project.priority && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                              {project.priority}
                            </span>
                          )}
                        </div>
                        <p className={`text-gray-600 mb-3 ${
                          isMobileView ? 'text-sm' : ''
                        }`}>
                          {project.description}
                        </p>
                        
                        {/* Progress Bar for Mobile */}
                        {isMobileView && project.progress && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600">Progress</span>
                              <span className="text-xs font-medium text-gray-900">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        <div className={`flex items-center space-x-4 text-gray-500 ${
                          isMobileView ? 'text-xs flex-wrap gap-2' : 'text-sm'
                        }`}>
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
                          {project.type && (
                            <span className="flex items-center">
                              <Zap className="w-4 h-4 mr-1" />
                              {project.type}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className={`flex items-center space-x-2 ${
                        isMobileView ? 'w-full justify-between' : ''
                      }`}>
                        <span className={`px-3 py-1 rounded-full font-medium ${
                          isMobileView ? 'text-xs px-2 py-1' : 'text-xs'
                        } ${
                          project.status === PROJECT_STATUS.COMPLETED
                            ? 'bg-green-100 text-green-800'
                            : project.status === PROJECT_STATUS.IN_PROGRESS
                            ? 'bg-blue-100 text-blue-800'
                            : project.status === PROJECT_STATUS.APPROVED
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                        {isMobileView && (
                          <button className="text-green-600">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className={`flex items-center space-x-3 ${
                      isMobileView ? 'flex-col space-y-2 space-x-0' : ''
                    }`}>
                      <button
                        onClick={() => handleSendQuote(project)}
                        disabled={sendingQuote}
                        className={`flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 ${
                          isMobileView ? 'text-sm w-full justify-center' : 'text-sm'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {sendingQuote ? 'Sending...' : 'Send Quote'}
                      </button>
                      
                      <button
                        onClick={() => setShowPDF(true)}
                        className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                          isMobileView ? 'text-sm w-full justify-center' : 'text-sm'
                        }`}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Quote
                      </button>
                      
                      {project.status === PROJECT_STATUS.APPROVED && (
                        <button
                          onClick={() => handleUpdateProjectStatus(project.id, PROJECT_STATUS.IN_PROGRESS)}
                          className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                            isMobileView ? 'text-sm w-full justify-center' : 'text-sm'
                          }`}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Start Project
                        </button>
                      )}
                      
                      {project.status === PROJECT_STATUS.IN_PROGRESS && (
                        <button
                          onClick={() => handleUpdateProjectStatus(project.id, PROJECT_STATUS.COMPLETED)}
                          className={`flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 ${
                            isMobileView ? 'text-sm w-full justify-center' : 'text-sm'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Complete
                        </button>
                      )}
                      
                      {!isMobileView && (
                        <select
                          value={project.pipeline_stage || 'lead_generated'}
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
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}





            {activeTab === 'review' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Projects Pending Review ({pendingReviewProjects.length})
                </h3>
                {pendingReviewProjects.map(project => (
                  <div key={project.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                    {/* Project details */}
                    <div className="flex justify-between items-center mt-4">
                      {/* <button 
                        onClick={() => handleApproveProject(project.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg"
                      >
                        Approve Project
                      </button> */}
                      <button onClick={() => handleApproveProject(project)}>
                        Approve Project
                      </button>
                      <button 
                        onClick={() => handleSendToAdmin(project.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                      >
                        Send to Admin
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}




            {activeTab === 'customers' && (
              <div className="space-y-4">
                <h3 className={`font-semibold text-gray-900 ${
                  isMobileView ? 'text-base' : 'text-lg'
                }`}>
                  Customer Management
                </h3>
                
                <div className="grid gap-4">
                  {myProjects.map((project) => (
                    <div key={project.id} className={`border border-gray-200 rounded-lg ${
                      isMobileView ? 'p-3' : 'p-4'
                    }`}>
                      <div className={`flex items-center justify-between ${
                        isMobileView ? 'flex-col space-y-3' : ''
                      }`}>
                        <div className={`flex items-center space-x-4 ${
                          isMobileView ? 'w-full' : ''
                        }`}>
                          <div className={`bg-blue-100 rounded-full flex items-center justify-center ${
                            isMobileView ? 'w-10 h-10' : 'w-12 h-12'
                          }`}>
                            <Users className={`text-blue-600 ${
                              isMobileView ? 'w-5 h-5' : 'w-6 h-6'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium text-gray-900 ${
                              isMobileView ? 'text-sm' : ''
                            }`}>
                              {project.customerName}
                            </h4>
                            <p className={`text-gray-600 ${
                              isMobileView ? 'text-xs' : 'text-sm'
                            }`}>
                              {project.title}
                            </p>
                            <p className={`text-gray-500 ${
                              isMobileView ? 'text-xs' : 'text-sm'
                            }`}>
                              {project.location}
                            </p>
                          </div>
                        </div>
                        <div className={`flex items-center space-x-2 ${
                          isMobileView ? 'w-full justify-center' : ''
                        }`}>
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
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobileView && <MobileBottomNav />}

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



