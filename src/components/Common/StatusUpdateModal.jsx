import React, { useState } from 'react';
import { PIPELINE_STAGES, STAGE_LABELS, STAGE_PERMISSIONS } from '../../types/index.js';

const StatusUpdateModal = ({ isOpen, onClose, project, currentUser, onUpdate }) => {
  const [selectedStage, setSelectedStage] = useState(project?.pipeline_stage || '');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !project) return null;

  const userRole = currentUser?.role;
  const allowedStages = STAGE_PERMISSIONS[userRole] || [];
  
const handleSubmit = (e) => {
  e.preventDefault();
  
  const statusUpdate = {
    pipeline_stage: selectedStage,
    comment: comment.trim() || null, // This should be 'comment', not 'status_comment'
    updated_by: currentUser?.name || 'System'
  };
  
  console.log('🎯 StatusUpdateModal submitting:', statusUpdate);
  console.log('🎯 Project being updated:', project);
  
  onUpdate(project.id, statusUpdate);
  onClose();
};

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Project Status</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">Project: <strong>{project.title}</strong></p>
          <p className="text-sm text-gray-600">Current Status: <strong>{STAGE_LABELS[project.pipeline_stage]}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Status</option>
              {allowedStages.map(stage => (
                <option key={stage} value={stage}>
                  {STAGE_LABELS[stage]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Add any notes about this status update..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !selectedStage}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusUpdateModal;