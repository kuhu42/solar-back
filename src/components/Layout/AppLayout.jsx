import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { Bell, LogOut, User, Sun } from 'lucide-react';

const AppLayout = ({ children }) => {
  const { currentUser, notifications, logout } = useApp();

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Sun className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">GreenSolar</h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                  <Bell className="w-6 h-6" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;