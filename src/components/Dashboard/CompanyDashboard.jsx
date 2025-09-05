import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Star,
  Clock
} from 'lucide-react';

export default function CompanyDashboard() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for company dashboard
  const stats = {
    totalProjects: 156,
    activeProjects: 23,
    totalRevenue: 2450000,
    monthlyGrowth: 12.5
  };

  const recentProjects = [
    {
      id: 1,
      name: 'Solar Installation - Downtown Office',
      client: 'Tech Corp Ltd',
      status: 'In Progress',
      value: 45000,
      completion: 75
    },
    {
      id: 2,
      name: 'Residential Solar Array',
      client: 'Johnson Family',
      status: 'Planning',
      value: 28000,
      completion: 25
    },
    {
      id: 3,
      name: 'Commercial Rooftop System',
      client: 'Green Energy Co',
      status: 'Completed',
      value: 85000,
      completion: 100
    }
  ];

  const topPerformers = [
    { name: 'Sarah Johnson', role: 'Senior Installer', rating: 4.9, projects: 34 },
    { name: 'Mike Chen', role: 'Project Manager', rating: 4.8, projects: 28 },
    { name: 'Alex Rodriguez', role: 'Technician', rating: 4.7, projects: 42 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Company Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name || 'Company Admin'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                <p className="text-2xl font-bold text-gray-900">{stats.monthlyGrowth}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {['overview', 'projects', 'team'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Projects</h3>
                  <div className="space-y-4">
                    {recentProjects.map((project) => (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{project.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            project.status === 'Completed' 
                              ? 'bg-green-100 text-green-800'
                              : project.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Client: {project.client}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            ${project.value.toLocaleString()}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${project.completion}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{project.completion}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">All Projects</h3>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Project management interface would go here</p>
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h3>
                <div className="space-y-4">
                  {topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{performer.name}</h4>
                          <p className="text-sm text-gray-600">{performer.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{performer.rating}</span>
                        </div>
                        <span className="text-sm text-gray-600">{performer.projects} projects</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}