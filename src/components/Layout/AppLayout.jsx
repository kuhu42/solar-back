import React, { useState } from 'react';
// import { useApp } from '../../context/AppContext.jsx';
import { useApp } from '../../hooks/useApp.js'
import { USER_ROLES } from '../../types/index.js';
import { 
  Menu, 
  X, 
  Bell, 
  User, 
  LogOut, 
  Home,
  Users,
  Briefcase,
  Wrench,
  Settings,
  MapPin,
  FileText,
  DollarSign,
  Package,
  MessageSquare,
  TrendingUp
} from 'lucide-react';

const AppLayout = ({ children }) => {
  const { currentUser, logout, notifications } = useApp();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read && n.userId === currentUser?.id).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <img 
              src="/WhatsApp Image 2025-08-11 at 21.49.19 copy copy.jpeg" 
              alt="GreenSolar Logo" 
              className="h-8 w-auto"
            />
            <h1 className="text-xl font-semibold text-gray-900">
              GreenSolar - {currentUser?.role} Dashboard
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg">
              <Bell className="w-6 h-6" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
              >
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {currentUser?.name}
                </span>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{currentUser?.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      // Profile settings would go here
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page content */}
      <main className="p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;