import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { USER_ROLES } from '../../types/index.js';
import { Sun, User, Lock, UserPlus, MapPin, Upload, Camera } from 'lucide-react';

const LoginScreen = () => {
  const { login } = useApp();
  const [activeMode, setActiveMode] = useState('login'); // 'login', 'register-type', 'customer-form', 'professional-form'
  const [selectedRole, setSelectedRole] = useState('');
  const [loginForm, setLoginForm] = useState({
    email: '',
    role: ''
  });
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    serviceNumber: '',
    email: '',
    address: '',
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
    photo: null,
    aadharPhoto: null,
    panPhoto: null,
    bankDetails: ''
  });
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = login(loginForm.email, loginForm.role);
    if (!user) {
      alert('Invalid credentials. Try: admin@greensolar.com or select a role.');
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

  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    alert('Customer registration submitted! Please wait for approval.');
    setActiveMode('login');
  };

  const handleProfessionalSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    alert('Professional registration submitted! Please wait for approval.');
    setActiveMode('login');
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
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setActiveMode('customer-form')}
              className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <User className="w-5 h-5 mr-3" />
              Register as Customer
            </button>
            
            <button
              onClick={() => setActiveMode('professional-form')}
              className="w-full flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserPlus className="w-5 h-5 mr-3" />
              Register as Professional
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
            <p className="text-gray-600 mt-2">Fill in your details to get started</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Number *</label>
                <input
                  type="text"
                  value={customerForm.serviceNumber}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, serviceNumber: e.target.value }))}
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
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium"
              >
                Submit Registration
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
            <p className="text-gray-600 mt-2">Join our team of professionals</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                <select
                  value={professionalForm.role}
                  onChange={(e) => setProfessionalForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium"
              >
                Submit Registration
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
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

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Sign In
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
          <h3 className="text-sm font-medium text-gray-900 mb-2">Demo Accounts:</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p>• Admin: admin@greensolar.com</p>
            <p>• Agent: agent@greensolar.com</p>
            <p>• Customer: customer@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;