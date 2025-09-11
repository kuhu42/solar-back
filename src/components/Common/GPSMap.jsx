import React from 'react';
import { MapPin, Navigation, Clock } from 'lucide-react';

const GPSMap = ({ staff = [], selectedStaff = null, onStaffSelect }) => {
  // Mock coordinates for Indian locations
  const mockLocations = [
    { lat: 19.0760, lng: 72.8777, name: 'Mumbai Bandra West' },
    { lat: 12.9716, lng: 77.5946, name: 'Bangalore Whitefield' },
    { lat: 28.4595, lng: 77.0266, name: 'Gurgaon Sector 29' },
    { lat: 18.5204, lng: 73.8567, name: 'Pune Koramangala' },
    { lat: 28.6139, lng: 77.2090, name: 'Delhi NCR' }
  ];

  const getStaffLocation = (staffId, index) => {
    return mockLocations[index % mockLocations.length];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Locations</h3>
      
      {/* Mock Map Container */}
      <div className="relative bg-blue-50 rounded-lg h-64 mb-4 overflow-hidden">
        {/* Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 400 300">
              {/* Mock street lines */}
              <line x1="0" y1="100" x2="400" y2="100" stroke="#94a3b8" strokeWidth="2" />
              <line x1="0" y1="200" x2="400" y2="200" stroke="#94a3b8" strokeWidth="2" />
              <line x1="100" y1="0" x2="100" y2="300" stroke="#94a3b8" strokeWidth="2" />
              <line x1="200" y1="0" x2="200" y2="300" stroke="#94a3b8" strokeWidth="2" />
              <line x1="300" y1="0" x2="300" y2="300" stroke="#94a3b8" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Staff Markers */}
        {staff.map((member, index) => {
          const location = getStaffLocation(member.id, index);
          const x = 50 + (index * 60) % 300;
          const y = 50 + (index * 40) % 150;
          
          return (
            <div
              key={member.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                selectedStaff?.id === member.id ? 'z-10' : 'z-0'
              }`}
              style={{ left: `${x}px`, top: `${y}px` }}
              onClick={() => onStaffSelect && onStaffSelect(member)}
            >
              <div className={`relative ${
                selectedStaff?.id === member.id ? 'scale-125' : 'hover:scale-110'
              } transition-transform`}>
                <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                  member.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                }`}>
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                {selectedStaff?.id === member.id && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 min-w-32 text-center">
                    <p className="text-xs font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-600">{location.name}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Staff List */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900">Active Staff</h4>
        {staff.map((member, index) => {
          const location = getStaffLocation(member.id, index);
          return (
            <div
              key={member.id}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                selectedStaff?.id === member.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => onStaffSelect && onStaffSelect(member)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  member.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-900">{location.name}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  Last update: 2 min ago
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GPSMap;