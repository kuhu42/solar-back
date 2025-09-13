import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const ProjectPipeline = ({ projects = [] }) => {
  const stages = [
    { key: 'lead_generated', label: 'Lead Generated', color: 'bg-gray-500' },
    { key: 'quotation_sent', label: 'Quotation Sent', color: 'bg-blue-500' },
    { key: 'bank_process', label: 'Bank Process', color: 'bg-yellow-500' },
    { key: 'meter_applied', label: 'Meter Applied', color: 'bg-orange-500' },
    { key: 'ready_for_installation', label: 'Ready for Installation', color: 'bg-purple-500' },
    { key: 'installation_complete', label: 'Installation Complete', color: 'bg-indigo-500' },
    { key: 'commissioned', label: 'Commissioned', color: 'bg-green-500' },
    { key: 'active', label: 'Active', color: 'bg-emerald-500' }
  ];

  const getProjectCountByStage = (stageKey) => {
    return projects.filter(p => p.pipeline_stage === stageKey).length;
  };

  const getTotalValue = (stageKey) => {
    return projects
      .filter(p => p.pipeline_stage === stageKey)
      .reduce((sum, p) => sum + (p.value || 0), 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Pipeline</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage, index) => {
          const count = getProjectCountByStage(stage.key);
          const value = getTotalValue(stage.key);
          
          return (
            <div key={stage.key} className="relative">
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-transparent hover:border-gray-200 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                  <span className="text-2xl font-bold text-gray-900">{count}</span>
                </div>
                <h4 className="font-medium text-gray-900 text-sm mb-1">{stage.label}</h4>
                <p className="text-xs text-gray-600">
                  ${value.toLocaleString()} total value
                </p>
              </div>
              
              {/* Connection Line */}
              {index < stages.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Pipeline Updates */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Recent Updates</h4>
        <div className="space-y-2">
          {projects.slice(0, 3).map((project) => (
            <div key={project.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{project.title}</p>
                  <p className="text-xs text-gray-600">
                    Moved to {stages.find(s => s.key === project.pipeline_stage)?.label || 'Unknown'}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500">2h ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectPipeline;