import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { authService } from '../../lib/auth.js';
import { USER_ROLES } from '../../types/index.js';
import { Sun, User, Lock, UserPlus, MapPin, Upload, Camera, Eye, EyeOff, Smartphone, ToggleLeft, ToggleRight } from 'lucide-react';

const LoginScreen = () => {
  const { setCurrentUser, showToast, isLiveMode, toggleMode, loginDemo, loginLive, createDemoUsers } = useApp();
  const [activeMode, setActiveMode] = useState('login');
  const [loginType, setLoginType] = useState('demo'); // 'demo' or 'live'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [creatingDemoUsers, setCreatingDemoUsers] = useState(false);
  
  // Login forms
  const [demoLoginForm, setDemoLoginForm] = useState({
    selectedUser: 'admin@greensolar.com'
  });

  const [liveLoginForm, setLiveLoginForm] = useState({
    email: '',
    password: ''
  });

  const [phoneLoginForm, setPhoneLoginForm] = useState({
    phone: '',
    otp: '',
    step: 'phone' // 'phone' or 'otp'
  });

  // Registration forms
  const [signupForm, setSignupForm] = useState({
    phone: '',
    name: '',
    role: 'customer'
  });

  const [customerForm, setCustomerForm] = useState({
    serviceNumber: '',
    address: '',
    coordinates: { lat: null, lng: null },
    moduleType: '',
    kwCapacity: '',
    houseType: '',
    floors: '',
    remarks: ''
  });

  const [professionalForm, setProfessionalForm] = useState({
    role: '',
    education: '',
    address: '',
    bankDetails: ''
  });

  const demoUsers = [
    { email: 'admin@greensolar.com', name: 'John Admin', role: 'Company Admin' },
    { email: 'agent@greensolar.com', name: 'Sarah Agent', role: 'Field Agent' },
    { email: 'freelancer@greensolar.com', name: 'Mike Freelancer', role: 'Freelancer' },
    { email: 'installer@greensolar.com', name: 'Tom Installer', role: 'Installer' },
    { email: 'tech@greensolar.com', name: 'Lisa Technician', role: 'Technician' },
    { email: 'customer@example.com', name: 'David Customer', role: 'Customer' }
  ];

  const handleDemoLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = loginDemo(demoLoginForm.selectedUser);
      if (user) {
        setCurrentUser(user);
        showToast(`Logged in as ${user.name} (Demo Mode)`);
      } else {
        showToast('Demo user not found', 'error');
      }
    } catch (error) {
      showToast('Demo login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLiveLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await loginLive(liveLoginForm.email, liveLoginForm.password);
      if (user) {
        showToast(`Welcome back, ${user.name}!`);
      }
    } catch (error) {
      showToast(error.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (phoneLoginForm.step === 'phone') {
        // Send OTP (in demo, just move to OTP step)
        setPhoneLoginForm(prev => ({ ...prev, step: 'otp' }));
        showToast('OTP sent to your phone (Demo: use 123456)');
      } else {
        // Verify OTP
        const result = await authService.verifyOTP(phoneLoginForm.phone, phoneLoginForm.otp);
        if (result.verified) {
          setCurrentUser(result.user);
          showToast(`Welcome, ${result.user.name}!`);
        }
      }
    } catch (error) {
      showToast(error.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDemoUsers = async () => {
    setCreatingDemoUsers(true);
    try {
      const results = await createDemoUsers();
      const successCount = results.filter(r => r.success).length;
      showToast(`Created ${successCount} demo users successfully!`);
    } catch (error) {
      showToast('Error creating demo users', 'error');
    } finally {
      setCreatingDemoUsers(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authService.signUpWithPhone(signupForm.phone, {
        name: signupForm.name,
        role: signupForm.role
      });
      
      showToast('Account created! Please complete your registration.');
      
      if (signupForm.role === 'customer') {
        setActiveMode('customer-form');
      } else {
        setActiveMode('professional-form');
      }
    } catch (error) {
      showToast(error.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        showToast('Please sign up first', 'error');
        return;
      }

      await authService.updateUserProfile(user.id, {
        role: 'customer',
        status: 'active',
        location: customerForm.address,
        metadata: {
          serviceNumber: customerForm.serviceNumber,
          moduleType: customerForm.moduleType,
          kwCapacity: customerForm.kwCapacity,
          houseType: customerForm.houseType,
          floors: customerForm.floors,
          remarks: customerForm.remarks,
          coordinates: customerForm.coordinates
        }
      });

      showToast('Customer registration completed! You can now login.');
      setActiveMode('login');
    } catch (error) {
      showToast(error.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        showToast('Please sign up first', 'error');
        return;
      }

      await authService.updateUserProfile(user.id, {
        role: professionalForm.role,
        status: 'pending',
        education: professionalForm.education,
        location: professionalForm.address,
        bank_details: { details: professionalForm.bankDetails }
      });

      showToast('Professional registration submitted! Please wait for admin approval.');
      setActiveMode('login');
    } catch (error) {
      showToast(error.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Mode Toggle Component
  const ModeToggle = () => (
    <div className="flex items-center justify-center space-x-3 mb-6 p-3 bg-gray-100 rounded-lg">
      <span className={`text-sm font-medium ${!isLiveMode ? 'text-blue-600' : 'text-gray-500'}`}>
        Demo Mode
      </span>
      <button
        onClick={() => toggleMode(!isLiveMode)}
        className="relative"
      >
        {isLiveMode ? (
          <ToggleRight className="w-8 h-8 text-green-600" />
        ) : (
          <ToggleLeft className="w-8 h-8 text-gray-400" />
        )}
      </button>
      <span className={`text-sm font-medium ${isLiveMode ? 'text-green-600' : 'text-gray-500'}`}>
        Live Mode
      </span>
    </div>
  );

  // Demo Login Screen
  if (!isLiveMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Sun className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">GreenSolar Demo</h1>
            <p className="text-gray-600 mt-2">Experience all dashboards</p>
          </div>

          <ModeToggle />

          <form onSubmit={handleDemoLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Demo User
              </label>
              <select
                value={demoLoginForm.selectedUser}
                onChange={(e) => setDemoLoginForm({ selectedUser: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {demoUsers.map((user) => (
                  <option key={user.email} value={user.email}>
                    {user.name} - {user.role}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Logging In...' : 'Enter Demo Dashboard'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Demo mode uses mock data for quick demonstrations
            </p>
            <button
              onClick={() => setActiveMode('signup')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Register New Account →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Live Mode Login Screen
  if (activeMode === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Sun className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">GreenSolar</h1>
            <p className="text-gray-600 mt-2">Field Service Management</p>
          </div>

          <ModeToggle />

          {/* Login Type Selector */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setLoginType('demo')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                loginType === 'demo'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Demo Login
            </button>
            <button
              onClick={() => setLoginType('live')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                loginType === 'live'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Live Login
            </button>
            <button
              onClick={() => setLoginType('phone')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                loginType === 'phone'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Phone OTP
            </button>
          </div>

          {/* Demo Login */}
          {loginType === 'demo' && (
            <form onSubmit={handleDemoLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Demo Account
                </label>
                <select
                  value={demoLoginForm.selectedUser}
                  onChange={(e) => setDemoLoginForm({ selectedUser: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {demoUsers.map((user) => (
                    <option key={user.email} value={user.email}>
                      {user.name} - {user.role}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Entering...' : 'Enter Demo Dashboard'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleCreateDemoUsers}
                  disabled={creatingDemoUsers}
                  className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  {creatingDemoUsers ? 'Creating Demo Users...' : 'Setup Demo Users in Database'}
                </button>
              </div>
            </form>
          )}

          {/* Live Email/Password Login */}
          {loginType === 'live' && (
            <form onSubmit={handleLiveLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={liveLoginForm.email}
                    onChange={(e) => setLiveLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={liveLoginForm.password}
                    onChange={(e) => setLiveLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Phone OTP Login */}
          {loginType === 'phone' && (
            <form onSubmit={handlePhoneLogin} className="space-y-6">
              {phoneLoginForm.step === 'phone' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={phoneLoginForm.phone}
                      onChange={(e) => setPhoneLoginForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP sent to {phoneLoginForm.phone}
                  </label>
                  <input
                    type="text"
                    value={phoneLoginForm.otp}
                    onChange={(e) => setPhoneLoginForm(prev => ({ ...prev, otp: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-widest"
                    placeholder="123456"
                    maxLength="6"
                    required
                  />
                  <p className="text-sm text-gray-500 text-center mt-2">Demo OTP: 123456</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Processing...' : phoneLoginForm.step === 'phone' ? 'Send OTP' : 'Verify OTP'}
              </button>

              {phoneLoginForm.step === 'otp' && (
                <button
                  type="button"
                  onClick={() => setPhoneLoginForm(prev => ({ ...prev, step: 'phone', otp: '' }))}
                  className="w-full text-purple-600 hover:text-purple-700 text-sm"
                >
                  ← Change Phone Number
                </button>
              )}
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => setActiveMode('signup')}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Signup Screen
  if (activeMode === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Sun className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Join GreenSolar today</p>
          </div>

          <ModeToggle />

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={signupForm.phone}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={signupForm.name}
                onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a...
              </label>
              <select
                value={signupForm.role}
                onChange={(e) => setSignupForm(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="customer">Customer</option>
                <option value="agent">Agent</option>
                <option value="freelancer">Freelancer</option>
                <option value="installer">Installer</option>
                <option value="technician">Technician</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Continue Registration'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => setActiveMode('login')}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Customer Registration Form
  if (activeMode === 'customer-form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Sun className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Customer Registration</h1>
            <p className="text-gray-600 mt-2">Complete your profile</p>
          </div>

          <form onSubmit={handleCustomerSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Number</label>
                <input
                  type="text"
                  value={customerForm.serviceNumber}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, serviceNumber: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">KW Capacity</label>
                <input
                  type="number"
                  value={customerForm.kwCapacity}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, kwCapacity: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={customerForm.address}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Module Type</label>
                <select
                  value={customerForm.moduleType}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, moduleType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Module Type</option>
                  <option value="monocrystalline">Monocrystalline</option>
                  <option value="polycrystalline">Polycrystalline</option>
                  <option value="thin-film">Thin Film</option>
                  <option value="bifacial">Bifacial</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">House Type</label>
                <select
                  value={customerForm.houseType}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, houseType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select House Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="independent">Independent House</option>
                  <option value="villa">Villa</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Completing...' : 'Complete Registration'}
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('login')}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 font-medium"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Professional Registration Form
  if (activeMode === 'professional-form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Sun className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Professional Registration</h1>
            <p className="text-gray-600 mt-2">Join our team</p>
          </div>

          <form onSubmit={handleProfessionalSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={professionalForm.role}
                onChange={(e) => setProfessionalForm(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Select Role</option>
                <option value="agent">Agent</option>
                <option value="freelancer">Freelancer</option>
                <option value="installer">Installer</option>
                <option value="technician">Technician</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
              <input
                type="text"
                value={professionalForm.education}
                onChange={(e) => setProfessionalForm(prev => ({ ...prev, education: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={professionalForm.address}
                onChange={(e) => setProfessionalForm(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Details</label>
              <textarea
                value={professionalForm.bankDetails}
                onChange={(e) => setProfessionalForm(prev => ({ ...prev, bankDetails: e.target.value }))}
                rows={3}
                placeholder="Account Number, IFSC Code, Bank Name, Branch"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex items-center space-x-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit for Approval'}
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('login')}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 font-medium"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
};

export default LoginScreen;