import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { USER_ROLES } from '../../types/index.js';
import ModeToggle from '../Common/ModeToggle.jsx';
import { 
  Sun, 
  Wind, 
  Phone, 
  Mail, 
  Lock, 
  User, 
  MapPin,
  GraduationCap,
  CreditCard,
  Eye,
  EyeOff,
  Loader
} from 'lucide-react';

const LoginScreen = () => {
  const { loginDemo, loginLive, isLiveMode, toggleMode, authService, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('login');
  const [loginMethod, setLoginMethod] = useState('demo');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    phone: ''
  });

  // Registration form state
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: USER_ROLES.CUSTOMER,
    location: '',
    education: '',
    address: '',
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      bankName: ''
    }
  });

  // OTP state
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const demoUsers = [
    { email: 'admin@greensolar.com', role: 'Company Admin', name: 'John Admin' },
    { email: 'agent@greensolar.com', role: 'Field Agent', name: 'Sarah Agent' },
    { email: 'freelancer@greensolar.com', role: 'Freelancer', name: 'Mike Freelancer' },
    { email: 'installer@greensolar.com', role: 'Installer', name: 'Tom Installer' },
    { email: 'tech@greensolar.com', role: 'Technician', name: 'Lisa Technician' },
    { email: 'customer@example.com', role: 'Customer', name: 'David Customer' }
  ];

  const handleDemoLogin = (email) => {
    setLoading(true);
    setTimeout(() => {
      const user = loginDemo(email);
      if (user) {
        showToast(`Welcome ${user.name}! (Demo Mode)`);
      } else {
        showToast('Demo user not found', 'error');
      }
      setLoading(false);
    }, 1000);
  };

  const handleLiveLogin = async (e) => {
    e.preventDefault();
    if (!authService.isAvailable()) {
      showToast('Live mode not available - Supabase not configured', 'error');
      return;
    }

    setLoading(true);
    try {
      if (loginMethod === 'phone') {
        // Phone OTP login
        if (!otpStep) {
          await authService.signUpWithPhone(loginForm.phone, {});
          setOtpSent(true);
          setOtpStep(true);
          showToast('OTP sent to your phone');
        } else {
          const result = await authService.verifyOTP(loginForm.phone, otp);
          if (result.verified) {
            showToast('Login successful!');
          }
        }
      } else {
        // Email/password login
        await loginLive(loginForm.email, loginForm.password);
        showToast('Login successful!');
      }
    } catch (error) {
      showToast(error.message, 'error');
      if (error.message.includes('Invalid login credentials')) {
        showToast('Try demo mode or register first', 'info');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    if (!authService.isAvailable()) {
      showToast('Live mode not available - use demo mode', 'error');
      return;
    }

    setLoading(true);
    try {
      if (!otpStep) {
        // Send OTP
        await authService.signUpWithPhone(registrationForm.phone, registrationForm);
        setOtpSent(true);
        setOtpStep(true);
        showToast('OTP sent to your phone');
      } else {
        // Verify OTP and create account
        const result = await authService.verifyOTP(registrationForm.phone, otp);
        if (result.verified && result.user) {
          // Create user profile
          await authService.createUserProfile(result.user.id, {
            phone: registrationForm.phone,
            name: registrationForm.name,
            email: registrationForm.email,
            role: registrationForm.role,
            location: registrationForm.location,
            education: registrationForm.education,
            address: registrationForm.address,
            bank_details: registrationForm.bankDetails
          });
          
          showToast('Registration successful! Awaiting admin approval.');
        }
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetOtpFlow = () => {
    setOtpStep(false);
    setOtp('');
    setOtpSent(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sun className="w-8 h-8 text-yellow-500" />
            <Wind className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">GreenSolar</h1>
          <p className="text-gray-600 mt-2">Field Service Management System</p>
        </div>

        {/* Mode Toggle */}
        <div className="mb-6">
          <ModeToggle 
            isLiveMode={isLiveMode} 
            onToggle={toggleMode}
            size="normal"
            showLabels={true}
          />
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setActiveTab('login');
                resetOtpFlow();
              }}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'login'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                resetOtpFlow();
              }}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'register'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Register
            </button>
          </div>

          {activeTab === 'login' && (
            <div className="space-y-6">
              {/* Demo Mode Quick Login */}
              {!isLiveMode && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Demo Quick Login</h3>
                  <div className="grid gap-2">
                    {demoUsers.map((user) => (
                      <button
                        key={user.email}
                        onClick={() => handleDemoLogin(user.email)}
                        disabled={loading}
                        className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.role}</p>
                        </div>
                        <User className="w-5 h-5 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Mode Login */}
              {isLiveMode && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Login</h3>
                  
                  {/* Login Method Toggle */}
                  <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => {
                        setLoginMethod('phone');
                        resetOtpFlow();
                      }}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                        loginMethod === 'phone'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-500'
                      }`}
                    >
                      Phone OTP
                    </button>
                    <button
                      onClick={() => {
                        setLoginMethod('email');
                        resetOtpFlow();
                      }}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                        loginMethod === 'email'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-500'
                      }`}
                    >
                      Email/Password
                    </button>
                  </div>

                  <form onSubmit={handleLiveLogin} className="space-y-4">
                    {loginMethod === 'phone' ? (
                      <>
                        {!otpStep ? (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="tel"
                                value={loginForm.phone}
                                onChange={(e) => setLoginForm({...loginForm, phone: e.target.value})}
                                placeholder="+91 98765 43210"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Enter OTP
                            </label>
                            <input
                              type="text"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              placeholder="123456"
                              maxLength="6"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
                              required
                            />
                            <p className="text-sm text-gray-500 mt-2">
                              OTP sent to {loginForm.phone}
                            </p>
                            <button
                              type="button"
                              onClick={resetOtpFlow}
                              className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                            >
                              Change phone number
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="email"
                              value={loginForm.email}
                              onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                              placeholder="your@email.com"
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={loginForm.password}
                              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                              placeholder="Enter password"
                              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          {loginMethod === 'phone' 
                            ? (otpStep ? 'Verify OTP' : 'Send OTP')
                            : 'Sign In'
                          }
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'register' && isLiveMode && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Create Account</h3>
              
              {!otpStep ? (
                <form onSubmit={handleRegistration} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={registrationForm.name}
                        onChange={(e) => setRegistrationForm({...registrationForm, name: e.target.value})}
                        placeholder="Enter your full name"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={registrationForm.phone}
                        onChange={(e) => setRegistrationForm({...registrationForm, phone: e.target.value})}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email (Optional)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={registrationForm.email}
                        onChange={(e) => setRegistrationForm({...registrationForm, email: e.target.value})}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={registrationForm.role}
                      onChange={(e) => setRegistrationForm({...registrationForm, role: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={USER_ROLES.CUSTOMER}>Customer</option>
                      <option value={USER_ROLES.FREELANCER}>Freelancer</option>
                      <option value={USER_ROLES.INSTALLER}>Installer</option>
                      <option value={USER_ROLES.TECHNICIAN}>Technician</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={registrationForm.location}
                        onChange={(e) => setRegistrationForm({...registrationForm, location: e.target.value})}
                        placeholder="City, State"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Additional fields for professionals */}
                  {registrationForm.role !== USER_ROLES.CUSTOMER && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Education/Certification
                        </label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={registrationForm.education}
                            onChange={(e) => setRegistrationForm({...registrationForm, education: e.target.value})}
                            placeholder="Your qualifications"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bank Account Number
                        </label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={registrationForm.bankDetails.accountNumber}
                            onChange={(e) => setRegistrationForm({
                              ...registrationForm, 
                              bankDetails: {
                                ...registrationForm.bankDetails,
                                accountNumber: e.target.value
                              }
                            })}
                            placeholder="Account number"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </form>
              ) : (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Verify Your Phone</h4>
                  <form onSubmit={handleRegistration} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        maxLength="6"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        OTP sent to {registrationForm.phone}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        'Complete Registration'
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={resetOtpFlow}
                      className="w-full text-blue-600 hover:text-blue-700 py-2"
                    >
                      Back to phone entry
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Demo Mode Notice */}
          {!isLiveMode && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Demo Mode:</strong> Click any user above to instantly login and explore the system. 
                No registration required.
              </p>
            </div>
          )}

          {/* Live Mode Notice */}
          {isLiveMode && !authService.isAvailable() && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Supabase Not Configured:</strong> Please set up your Supabase project and add environment variables to use live mode.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 GreenSolar. All rights reserved.</p>
          <p className="mt-1">Solar & Wind Energy Solutions</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;