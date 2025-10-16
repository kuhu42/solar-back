import React, { useState } from 'react';
import { useApp } from '../../hooks/useApp.js';
import { USER_ROLES } from '../../types/index.js';
import { Sun, User, Lock, UserPlus, MapPin, Upload, Camera, Eye, EyeOff, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';

const LoginScreen = () => {
  const { loginDemo, loginLive, authService, isLiveMode, toggleMode, loading, error } = useApp();
  const [activeMode, setActiveMode] = useState('login');
  const [selectedRole, setSelectedRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    role: ''
  });
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    serviceNumber: '',
    email: '',
    address: '',
    pincode: '',
    coordinates: { lat: null, lng: null },
    moduleType: '',
    kwCapacity: '',
    houseType: '',
    floors: '',
    remarks: '',
    customerPhoto: null,
    signPhoto: null,
    aadharPhoto: null,
    panPhoto: null,
    bankBookPhoto: null
  });
  const [professionalForm, setProfessionalForm] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
    education: '',
    address: '',
    pincode: '',
    photo: null,
    aadharPhoto: null,
    panPhoto: null,
    bankDetails: ''
  });
  const [gettingLocation, setGettingLocation] = useState(false);

  // Default password for all users
  const DEFAULT_PASSWORD = 'greensolar123';

  // Pincode validation function
  const validatePincode = (pincode) => {
    if (!pincode || pincode.length !== 6) {
      return 'Please enter a 6-digit pincode';
    }
    
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(pincode)) {
      return 'Pincode must contain only numbers';
    }
    
    // Check if pincode belongs to supported cities
    const firstDigit = pincode.charAt(0);
    const supportedPincodes = {
      '1': 'Delhi',      // 110xxx
      '4': 'Mumbai',     // 400xxx, 401xxx
      '5': 'Hyderabad',  // 500xxx
      '6': 'Bangalore'   // 560xxx
    };
    
    if (!supportedPincodes[firstDigit]) {
      return 'We currently serve only Delhi (1xxxxx), Mumbai (4xxxxx), Hyderabad (5xxxxx), and Bangalore (6xxxxx)';
    }
    
    return null;
  };

  // Get city from pincode
  const getCityFromPincode = (pincode) => {
    if (!pincode || pincode.length !== 6) return 'Unknown';
    
    const firstDigit = pincode.charAt(0);
    const cityMapping = {
      '1': 'Delhi',
      '4': 'Mumbai', 
      '5': 'Hyderabad',
      '6': 'Bangalore'
    };
    
    return cityMapping[firstDigit] || 'Other';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      let user = null;
      
      if (isLiveMode) {
        // Live mode - use email and password
        if (!loginForm.email || !loginForm.password) {
          alert('Email and password are required for live mode login.');
          return;
        }
        user = await loginLive(loginForm.email, loginForm.password);
      } else {
        // Demo mode - use email and role
        if (!loginForm.email || !loginForm.role) {
          alert('Email and role are required for demo mode login.');
          return;
        }
        user = loginDemo(loginForm.email);
      }
      
      if (!user) {
        alert('Invalid credentials. Please check your email and try again.');
      }
    } catch (error) {
      alert(`Login failed: ${error.message}`);
    }
  };

  const handleGetLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCustomerForm(prev => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
          setGettingLocation(false);
          alert('Location captured successfully!');
        },
        (error) => {
          setGettingLocation(false);
          alert('Unable to get location. Please enable location services.');
        }
      );
    } else {
      setGettingLocation(false);
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleFileUpload = (field, file, formType = 'customer') => {
    if (formType === 'customer') {
      setCustomerForm(prev => ({ ...prev, [field]: file }));
    } else {
      setProfessionalForm(prev => ({ ...prev, [field]: file }));
    }
    alert(`${file.name} uploaded successfully!`);
  };

const handleCustomerSubmit = async (e) => {
  e.preventDefault();
  
  if (!customerForm.coordinates.lat || !customerForm.coordinates.lng) {
    alert('Please capture your location coordinates.');
    return;
  }

  const pincodeError = validatePincode(customerForm.pincode);
  if (pincodeError) {
    alert(pincodeError);
    return;
  }

  // Debug: Log the form data before processing
  console.log('🔍 Customer form data:', customerForm);

  try {
    if (isLiveMode) {
      const registrationData = {
        name: customerForm.name,
        phone: customerForm.phone,
        email: customerForm.email, // Make sure email is included
        role: USER_ROLES.CUSTOMER,
        status: 'active', // Auto-approve customers
        serviceNumber: customerForm.serviceNumber,
        address: customerForm.address,
        pincode: customerForm.pincode, // Critical: Make sure this is included
        coordinates: customerForm.coordinates,
        moduleType: customerForm.moduleType,
        kwCapacity: customerForm.kwCapacity,
        houseType: customerForm.houseType,
        floors: customerForm.floors,
        remarks: customerForm.remarks,
        customerRefNumber: `CUST-${Date.now()}`
      };

      console.log('🔍 Registration data being sent to authService:', registrationData);
      
      // Call authService.signUp directly with all the data
      const result = await authService.signUp(customerForm.email, DEFAULT_PASSWORD, registrationData);
      
      console.log('✅ Registration result:', result);
      
      alert(`Customer registration successful for ${getCityFromPincode(customerForm.pincode)}! Your default password is: ${DEFAULT_PASSWORD}. You can login immediately.`);
    } else {
      alert(`Customer registration submitted for ${getCityFromPincode(customerForm.pincode)}! Default password: ${DEFAULT_PASSWORD}`);
    }
    
    setActiveMode('login');
  } catch (error) {
    console.error('❌ Registration error:', error);
    alert(`Registration failed: ${error.message}`);
  }
};

 const handleProfessionalSubmit = async (e) => {
  e.preventDefault();
  
  if (!professionalForm.role) {
    alert('Please select your professional role.');
    return;
  }

  const pincodeError = validatePincode(professionalForm.pincode);
  if (pincodeError) {
    alert(pincodeError);
    return;
  }

  // Debug: Log the form data before processing
  console.log('🔍 Professional form data:', professionalForm);

  try {
    if (isLiveMode) {
      const registrationData = {
        name: professionalForm.name,
        phone: professionalForm.phone,
        email: professionalForm.email, // Make sure email is included
        role: 'middleman',
        requestedRole: professionalForm.role,
        requested_role: professionalForm.role, 
        status: 'pending',
        education: professionalForm.education,
        address: professionalForm.address,
        pincode: professionalForm.pincode, // Critical: Make sure this is included
        bankDetails: professionalForm.bankDetails
      };

      console.log('🔍 Registration data being sent to authService:', registrationData);
      
      // Call authService.signUp directly with all the data
      const result = await authService.signUp(professionalForm.email, DEFAULT_PASSWORD, registrationData);
      
      console.log('✅ Registration result:', result);
      
      alert(`Professional registration submitted for ${getCityFromPincode(professionalForm.pincode)}! Your default password is: ${DEFAULT_PASSWORD}. Please wait for admin approval.`);
    } else {
      alert(`Professional registration submitted for ${getCityFromPincode(professionalForm.pincode)}! Default password: ${DEFAULT_PASSWORD}`);
    }
    
    setActiveMode('login');
  } catch (error) {
    console.error('❌ Registration error:', error);
    alert(`Registration failed: ${error.message}`);
  }
};

  const FileUploadField = ({ label, field, formType = 'customer', accept = "image/*" }) => {
    const form = formType === 'customer' ? customerForm : professionalForm;
    const file = form[field];
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} *
        </label>
        <label className="flex items-center justify-center w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 border-2 border-dashed border-gray-300 cursor-pointer transition-colors">
          {file ? (
            <div className="flex items-center text-green-600">
              <Upload className="w-5 h-5 mr-2" />
              <span className="text-sm">{file.name} ✓</span>
            </div>
          ) : (
            <div className="flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              <span className="text-sm">Upload {label}</span>
            </div>
          )}
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                handleFileUpload(field, file, formType);
              }
            }}
          />
        </label>
      </div>
    );
  };

  // Pincode input component
  const PincodeField = ({ value, onChange, formType = 'customer' }) => {
    const pincodeError = value ? validatePincode(value) : null;
    const city = value && value.length === 6 && !pincodeError ? getCityFromPincode(value) : null;
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pincode *
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const newValue = e.target.value.replace(/\D/g, '').slice(0, 6);
            onChange(newValue);
          }}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            pincodeError ? 'border-red-300' : 'border-gray-300'
          }`}
          required
          pattern="[0-9]{6}"
          maxLength="6"
          placeholder="Enter 6-digit pincode"
        />
        {pincodeError && (
          <p className="text-red-600 text-sm mt-1">{pincodeError}</p>
        )}
        {city && !pincodeError && (
          <p className="text-green-600 text-sm mt-1 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            Service available in {city}
          </p>
        )}
        
        {/* Supported cities info */}
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
          <p className="text-blue-800 font-medium mb-1">Supported Cities:</p>
          <div className="grid grid-cols-2 gap-1 text-blue-700">
            <span>• Delhi (1xxxxx)</span>
            <span>• Mumbai (4xxxxx)</span>
            <span>• Hyderabad (5xxxxx)</span>
            <span>• Bangalore (6xxxxx)</span>
          </div>
        </div>
      </div>
    );
  };

  if (activeMode === 'register-type') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <img 
              src="/WhatsApp Image 2025-08-11 at 21.49.19 copy copy.jpeg" 
              alt="GreenSolar Logo" 
              className="h-16 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">Choose Registration Type</h1>
            <p className="text-gray-600 mt-2">Select your role to continue</p>
            
            {/* Service area notice */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm font-medium">📍 Currently serving:</p>
              <p className="text-blue-700 text-xs mt-1">Delhi • Mumbai • Hyderabad • Bangalore</p>
            </div>

            {/* Default password notice */}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-medium">🔑 Default Password: {DEFAULT_PASSWORD}</p>
              <p className="text-green-700 text-xs mt-1">Use this password to login after registration</p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setActiveMode('customer-form')}
              className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <User className="w-5 h-5 mr-3" />
              Register as Customer
              <span className="ml-auto text-xs bg-blue-500 px-2 py-1 rounded">Instant Access</span>
            </button>
            
            <button
              onClick={() => setActiveMode('professional-form')}
              className="w-full flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserPlus className="w-5 h-5 mr-3" />
              Register as Professional
              <span className="ml-auto text-xs bg-green-500 px-2 py-1 rounded">Needs Approval</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setActiveMode('login')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeMode === 'customer-form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <img 
              src="/WhatsApp Image 2025-08-11 at 21.49.19 copy copy.jpeg" 
              alt="GreenSolar Logo" 
              className="h-16 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">Customer Registration</h1>
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">Get instant access after registration!</p>
              <p className="text-green-700 text-xs mt-1">Default password: {DEFAULT_PASSWORD}</p>
            </div>
          </div>

          <form onSubmit={handleCustomerSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                <input
                  type="text"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email ID *</label>
                <input
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Number *</label>
                <input
                  type="text"
                  value={customerForm.serviceNumber}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, serviceNumber: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
              <textarea
                value={customerForm.address}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Enhanced Pincode Field */}
            <PincodeField 
              value={customerForm.pincode}
              onChange={(value) => setCustomerForm(prev => ({ ...prev, pincode: value }))}
              formType="customer"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location Coordinates *</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customerForm.coordinates.lat && customerForm.coordinates.lng 
                    ? `${customerForm.coordinates.lat}, ${customerForm.coordinates.lng}` 
                    : ''}
                  placeholder="Coordinates will appear here"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={gettingLocation}
                  className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {gettingLocation ? 'Getting...' : 'Get Location'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Module Type *</label>
                <select
                  value={customerForm.moduleType}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, moduleType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">KW Capacity *</label>
                <input
                  type="number"
                  value={customerForm.kwCapacity}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, kwCapacity: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">House Type *</label>
                <select
                  value={customerForm.houseType}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, houseType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select House Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="independent">Independent House</option>
                  <option value="villa">Villa</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Floors *</label>
                <input
                  type="number"
                  value={customerForm.floors}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, floors: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Requirements & Remarks</label>
              <textarea
                value={customerForm.remarks}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, remarks: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any specific requirements or remarks..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUploadField label="Customer Photo" field="customerPhoto" />
              <FileUploadField label="Signature Photo" field="signPhoto" />
              <FileUploadField label="Aadhar Card Photo" field="aadharPhoto" />
              <FileUploadField label="PAN Card Photo" field="panPhoto" />
              <FileUploadField label="Bank Book Photo" field="bankBookPhoto" />
            </div>

            <div className="flex items-center space-x-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register & Get Instant Access'}
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('register-type')}
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

  if (activeMode === 'professional-form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <img 
              src="/WhatsApp Image 2025-08-11 at 21.49.19 copy copy.jpeg" 
              alt="GreenSolar Logo" 
              className="h-16 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">Professional Registration</h1>
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">Application will be reviewed by admin within 24-48 hours</p>
              <p className="text-yellow-700 text-xs mt-1">Default password: {DEFAULT_PASSWORD}</p>
            </div>
          </div>

          <form onSubmit={handleProfessionalSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={professionalForm.name}
                  onChange={(e) => setProfessionalForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Requested Role *</label>
                <select
                  value={professionalForm.role}
                  onChange={(e) => setProfessionalForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Role</option>
                  <option value={USER_ROLES.AGENT}>Agent</option>
                  <option value={USER_ROLES.FREELANCER}>Freelancer</option>
                  <option value={USER_ROLES.INSTALLER}>Installer</option>
                  <option value={USER_ROLES.TECHNICIAN}>Technician</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={professionalForm.phone}
                  onChange={(e) => setProfessionalForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email ID *</label>
                <input
                  type="email"
                  value={professionalForm.email}
                  onChange={(e) => setProfessionalForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Education Qualification *</label>
              <input
                type="text"
                value={professionalForm.education}
                onChange={(e) => setProfessionalForm(prev => ({ ...prev, education: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
              <textarea
                value={professionalForm.address}
                onChange={(e) => setProfessionalForm(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Enhanced Pincode Field for Professionals */}
            <PincodeField 
              value={professionalForm.pincode}
              onChange={(value) => setProfessionalForm(prev => ({ ...prev, pincode: value }))}
              formType="professional"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Details *</label>
              <textarea
                value={professionalForm.bankDetails}
                onChange={(e) => setProfessionalForm(prev => ({ ...prev, bankDetails: e.target.value }))}
                rows={3}
                placeholder="Account Number, IFSC Code, Bank Name, Branch"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUploadField label="Profile Photo" field="photo" formType="professional" />
              <FileUploadField label="Aadhar Card Photo" field="aadharPhoto" formType="professional" />
              <FileUploadField label="PAN Card Photo" field="panPhoto" formType="professional" />
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
                onClick={() => setActiveMode('register-type')}
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

  // Default login screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <img 
            src="/WhatsApp Image 2025-08-11 at 21.49.19 copy copy.jpeg" 
            alt="GreenSolar Logo" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* Mode Toggle */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isLiveMode ? 'Live Mode' : 'Demo Mode'}
              </p>
              <p className="text-xs text-gray-600">
                {isLiveMode ? 'Using real Supabase data' : 'Using mock data for testing'}
              </p>
            </div>
            <button
              onClick={() => toggleMode(!isLiveMode)}
              className="flex items-center"
            >
              {isLiveMode ? (
                <ToggleRight className="w-8 h-8 text-blue-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {isLiveMode ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role (Demo Mode)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={loginForm.role}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  required
                >
                  <option value="">Select your role</option>
                  <option value={USER_ROLES.COMPANY}>Company Admin</option>
                  <option value={USER_ROLES.AGENT}>Agent</option>
                  <option value={USER_ROLES.FREELANCER}>Freelancer</option>
                  <option value={USER_ROLES.INSTALLER}>Installer</option>
                  <option value={USER_ROLES.TECHNICIAN}>Technician</option>
                  <option value={USER_ROLES.CUSTOMER}>Customer</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            First time user?{' '}
            <button
              onClick={() => setActiveMode('register-type')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Register Here
            </button>
          </p>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            {isLiveMode ? 'Live Mode Info:' : 'Demo Accounts:'}
          </h3>
          <div className="text-xs text-gray-600 space-y-1">
            {isLiveMode ? (
              <>
                <p>• Customers: Register and get instant access</p>
                <p>• Professionals: Register and wait for admin approval</p>
                <p>• Admin: admin@greensolar.com</p>
                <p>• Default Password: {DEFAULT_PASSWORD}</p>
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-blue-800 font-medium">Service Areas:</p>
                  <p className="text-blue-700">Delhi • Mumbai • Hyderabad • Bangalore</p>
                </div>
              </>
            ) : (
              <>
                <p>• Admin: admin@greensolar.com</p>
                <p>• Agent: agent@greensolar.com</p>
                <p>• Customer: customer@example.com</p>
                <p>• Installer: installer@greensolar.com</p>
                <p>• Technician: tech@greensolar.com</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;