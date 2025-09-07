import React, { useState } from 'react';
// import { useApp } from '../../context/AppContext.jsx';
import { useApp } from '../../hooks/useApp.js'
import { LEAD_STATUS } from '../../types/index.js';
import PerformanceChart from '../Common/PerformanceChart.jsx';
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
  Clock
} from 'lucide-react';

const FreelancerDashboard = () => {
  const { currentUser, leads, dispatch, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({
    customerName: '',
    email: '',
    phone: '',
    location: '',
    type: 'solar',
    estimatedValue: '',
    notes: ''
  });

  const myLeads = leads.filter(l => l.assignedTo === currentUser?.id);
  const availableLeads = leads.filter(l => !l.assignedTo);
  const totalEarnings = myLeads
    .filter(l => l.status === LEAD_STATUS.CONVERTED)
    .reduce((sum, l) => sum + (l.estimatedValue * 0.1), 0); // 10% commission

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
          <p className="text-gray-600">Manage your leads and track your earnings</p>
        </div>
        <button
          onClick={() => setShowAddLead(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </button>
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
          title="Converted"
          value={myLeads.filter(l => l.status === LEAD_STATUS.CONVERTED).length}
          icon={CheckCircle}
          color="bg-green-500"
          subtitle="Successful conversions"
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
            <button
              onClick={() => setActiveTab('earnings')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'earnings'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Earnings
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {myLeads.slice(0, 3).map((lead) => (
                    <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{lead.customerName}</h4>
                          <p className="text-sm text-gray-600">{lead.location} • {lead.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          lead.status === LEAD_STATUS.CONVERTED
                            ? 'bg-green-100 text-green-800'
                            : lead.status === LEAD_STATUS.QUOTED
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {lead.status}
                        </span>
                        <p className="text-sm text-gray-500 mt-1 sm:mt-0 sm:ml-2">
                          ${lead.estimatedValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900">Conversion Rate</h4>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-2">
                    {myLeads.length > 0 
                      ? Math.round((myLeads.filter(l => l.status === LEAD_STATUS.CONVERTED).length / myLeads.length) * 100)
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
                  <h4 className="font-medium text-purple-900">Average Deal</h4>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-2">
                    ₹{myLeads.length > 0 
                      ? Math.round(myLeads.reduce((sum, l) => sum + l.estimatedValue, 0) / myLeads.length).toLocaleString()
                      : 0}
                  </p>
                </div>
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
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <PerformanceChart 
                  title="Monthly Leads Generated"
                  type="bar"
                />
                <PerformanceChart 
                  title="Conversion Rate Trend"
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
                      <span className="text-gray-600">Total Leads</span>
                      <span className="font-bold text-gray-900">{myLeads.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Conversion Rate</span>
                      <span className="font-bold text-green-600">
                        {myLeads.length > 0 
                          ? Math.round((myLeads.filter(l => l.status === LEAD_STATUS.CONVERTED).length / myLeads.length) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Deal Size</span>
                      <span className="font-bold text-blue-600">
                        ₹{myLeads.length > 0 
                          ? Math.round(myLeads.reduce((sum, l) => sum + l.estimatedValue, 0) / myLeads.length).toLocaleString()
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">This Month Earnings</span>
                      <span className="font-bold text-purple-600">₹{(totalEarnings * 0.3).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Earnings Breakdown</h3>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="font-medium text-green-900 mb-4">Total Earnings</h4>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">₹{totalEarnings.toLocaleString()}</p>
                  <p className="text-sm text-green-700 mt-2">From {myLeads.filter(l => l.status === LEAD_STATUS.CONVERTED).length} converted leads</p>
                </div>
              </div>

              {/* Earnings History */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Recent Conversions</h4>
                <div className="space-y-3">
                  {myLeads.filter(l => l.status === LEAD_STATUS.CONVERTED).map((lead) => (
                    <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                      <div>
                        <h5 className="font-medium text-gray-900">{lead.customerName}</h5>
                        <p className="text-sm text-gray-600">{lead.location} • {lead.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ₹{(lead.estimatedValue * 0.1).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">10% commission</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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