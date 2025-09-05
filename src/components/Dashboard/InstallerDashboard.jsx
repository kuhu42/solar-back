import React, { useState } from 'react';
import { Calendar, MapPin, Wrench, CheckCircle, Clock, User } from 'lucide-react';

const InstallerDashboard = () => {
  const [activeTab, setActiveTab] = useState('scheduled');

  const scheduledJobs = [
    {
      id: 1,
      customer: 'John Smith',
      address: '123 Main St, City',
      time: '09:00 AM',
      type: 'Solar Panel Installation',
      status: 'scheduled'
    },
    {
      id: 2,
      customer: 'Sarah Johnson',
      address: '456 Oak Ave, Town',
      time: '02:00 PM',
      type: 'System Maintenance',
      status: 'scheduled'
    }
  ];

  const completedJobs = [
    {
      id: 3,
      customer: 'Mike Wilson',
      address: '789 Pine St, Village',
      time: '10:00 AM',
      type: 'Solar Panel Installation',
      status: 'completed',
      completedAt: '2024-01-15'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Installer Dashboard</h1>
          <p className="text-gray-600">Manage your installation schedule and track progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Jobs</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'scheduled'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Scheduled Jobs
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'completed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Completed Jobs
              </button>
            </nav>
          </div>

          {/* Job Lists */}
          <div className="p-6">
            {activeTab === 'scheduled' && (
              <div className="space-y-4">
                {scheduledJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <User className="h-10 w-10 text-gray-400" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{job.customer}</h3>
                          <div className="flex items-center text-gray-600 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-sm">{job.address}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{job.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">{job.time}</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Scheduled
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'completed' && (
              <div className="space-y-4">
                {completedJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <User className="h-10 w-10 text-gray-400" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{job.customer}</h3>
                          <div className="flex items-center text-gray-600 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-sm">{job.address}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{job.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Completed on {job.completedAt}</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallerDashboard;