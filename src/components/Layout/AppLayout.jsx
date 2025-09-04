import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
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
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  Zap
} from 'lucide-react';

const AppLayout = ({ children }) => {
  const { currentUser, logout, notifications, isLiveMode, toggleMode } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read && n.userId === currentUser?.id).length;

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', icon: Home, href: '#' }
    ];

    switch (currentUser?.role) {
      case USER_ROLES.COMPANY:
        return [
          ...baseItems,
          { name: 'Projects', icon: Briefcase, href: '#' },
          { name: 'Users', icon: Users, href: '#' },
          { name: 'Attendance', icon: MapPin, href: '#' },
          { name: 'Inventory', icon: Package, href: '#' },
          { name: 'Invoices', icon: DollarSign, href: '#' },
          { name: 'Reports', icon: FileText, href: '#' }
        ];
      case USER_ROLES.AGENT:
        return [
          ...baseItems,
          { name: 'Projects', icon: Briefcase, href: '#' },
          { name: 'Customers', icon: Users, href: '#' },
          { name: 'Attendance', icon: MapPin, href: '#' },
          { name: 'Quotes', icon: FileText, href: '#' }
        ];
      case USER_ROLES.FREELANCER:
        return [
          ...baseItems,
          { name: 'Leads', icon: TrendingUp, href: '#' },
          { name: 'Earnings', icon: DollarSign, href: '#' }
        ];
      case USER_ROLES.INSTALLER:
        return [
          ...baseItems,
          { name: 'Tasks', icon: Wrench, href: '#' },
          { name: 'Attendance', icon: MapPin, href: '#' },
          { name: 'Scanner', icon: Package, href: '#' }
        ];
      case USER_ROLES.TECHNICIAN:
        return [
          ...baseItems,
          { name: 'Complaints', icon: MessageSquare, href: '#' },
          { name: 'Tasks', icon: Wrench, href: '#' },
          { name: 'Scanner', icon: Package, href: '#' },
          { name: 'Invoices', icon: DollarSign, href: '#' }
        ];
      case USER_ROLES.CUSTOMER:
        return [
          ...baseItems,
          { name: 'My Projects', icon: Briefcase, href: '#' },
          { name: 'Track Serial', icon: Package, href: '#' },
          { name: 'Complaints', icon: MessageSquare, href: '#' },
          { name: 'Documents', icon: FileText, href: '#' }
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:flex lg:flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <img 
              src="/WhatsApp Image 2025-08-11 at 21.49.19 copy copy.jpeg" 
              alt="GreenSolar Logo" 
              className="h-8 w-auto"
            />
            <span className="ml-2 text-xl font-semibold text-gray-900">GreenSolar</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group flex items-center px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
              >
                <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                {item.name}
              </a>
            ))}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex lg:items-center lg:justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-900 capitalize">
                  {currentUser?.role} Dashboard
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                {/* Mode Toggle */}
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg">
                  <span className={`text-xs font-medium ${!isLiveMode ? 'text-blue-600' : 'text-gray-500'}`}>
                    Demo
                  </span>
                  <button
                    onClick={() => toggleMode(!isLiveMode)}
                    className="relative"
                  >
                    {isLiveMode ? (
                      <ToggleRight className="w-6 h-6 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                  <span className={`text-xs font-medium ${isLiveMode ? 'text-green-600' : 'text-gray-500'}`}>
                    Live
                  </span>
                  {isLiveMode && <Zap className="w-4 h-4 text-green-600" />}
                </div>

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
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;