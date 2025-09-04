import React from 'react';
import { Clock, AlertCircle, Mail, Phone } from 'lucide-react';

const PendingApproval = ({ user }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-yellow-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Account Pending Approval
        </h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm text-yellow-800 font-medium mb-1">
                Your registration is under review
              </p>
              <p className="text-sm text-yellow-700">
                Our admin team will review your application and approve your account within 24-48 hours.
              </p>
            </div>
          </div>
        </div>

        <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Your Details:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="font-medium w-16">Name:</span>
              <span>{user.name}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium w-16">Role:</span>
              <span className="capitalize">{user.role}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium w-16">Email:</span>
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center">
                <span className="font-medium w-16">Phone:</span>
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            You will receive an email notification once your account is approved.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:admin@solartech.com"
              href="mailto:admin@greensolar.com"
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Admin
            </a>
            <a
              href="tel:+1234567890"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Support
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;