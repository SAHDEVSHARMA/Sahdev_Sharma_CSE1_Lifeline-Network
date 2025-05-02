'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AmbulanceDriverDashboardPage() {
  const router = useRouter();
  const [driverInfo, setDriverInfo] = useState({
    name: 'Mr. Satya Prakash',
    licenseNumber: 'DL-12345678',
    ambulanceNumber: 'AMB-5678',
    isAvailable: true
  });

  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [emergencyRequests, setEmergencyRequests] = useState<any[]>([]);
  const [activeEmergency, setActiveEmergency] = useState<any | null>(null);
  const [nearbyHospitals, setNearbyHospitals] = useState<any[]>([]);
  const [showHospitals, setShowHospitals] = useState(false);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }

    // Simulate incoming emergency requests
    const timer = setTimeout(() => {
      setEmergencyRequests([
        {
          id: 1,
          patientLocation: { lat: 37.7749, lng: -122.4194 },
          distanceAway: '1.2 km',
          requestTime: '2 mins ago',
          patientInfo: 'Anonymous user'
        }
      ]);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const toggleAvailability = () => {
    setDriverInfo({
      ...driverInfo,
      isAvailable: !driverInfo.isAvailable
    });
  };

  const acceptEmergency = (emergencyId: number) => {
    // Find the emergency request
    const emergency = emergencyRequests.find(req => req.id === emergencyId);
    if (!emergency) return;

    // Set as active emergency
    setActiveEmergency(emergency);
    
    // Remove from pending requests
    setEmergencyRequests(emergencyRequests.filter(req => req.id !== emergencyId));
    
    // Set driver as unavailable
    setDriverInfo({
      ...driverInfo,
      isAvailable: false
    });
  };

  const markAsPickedUp = () => {
    if (!activeEmergency) return;
    
    // Update active emergency status
    setActiveEmergency({
      ...activeEmergency,
      status: 'picked_up'
    });
    
    // Show nearby hospitals
    setNearbyHospitals([
      {
        id: 1,
        name: 'USHA HOSPITAL',
        distance: '1.5 km',
        address: ' Chungi No.: 1, Gurgram Road, adjacent to Eldeco Society, near Tata Motors Showroom, Sohna, Sohna Rural, Haryana 122103',
        services: ['Emergency Room', 'Trauma Center', 'Cardiology'],
        estimatedTime: '4 mins'
      },
      {
        id: 2,
        name: 'UPKAR MULTISPECIALITY HOSPITAL',
        distance: '2.8 km',
        address: 'Delhi alwar road, near Honda agency, Shahid Smarak, Sohna, Gurugram, Haryana 122103',
        services: ['Emergency Room', 'Pediatrics', 'Orthopedics'],
        estimatedTime: '12 mins'
      },
      {
        id: 3,
        name: 'BALAJI MEDICARE CENTERl',
        distance: '1.8 km',
        address: 'Chungi no 1, near saini market, Saini Colony, Sohna, Sohna Rural, Haryana 122103',
        services: ['Emergency Room', 'Neurology', 'Oncology', 'Burn Unit'],
        estimatedTime: '15 mins'
      }
    ]);
    
    setShowHospitals(true);
  };

  const selectHospital = (hospitalId: number) => {
    if (!activeEmergency) return;
    
    // Find the selected hospital
    const hospital = nearbyHospitals.find(h => h.id === hospitalId);
    if (!hospital) return;
    
    // Update active emergency with selected hospital
    setActiveEmergency({
      ...activeEmergency,
      status: 'en_route_to_hospital',
      selectedHospital: hospital
    });
    
    // Hide hospital selection
    setShowHospitals(false);
  };

  const completeEmergency = () => {
    // Reset active emergency
    setActiveEmergency(null);
    
    // Set driver as available again
    setDriverInfo({
      ...driverInfo,
      isAvailable: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">Ambulance Driver Portal</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {driverInfo.name}</span>
            <button 
              onClick={() => router.push('/driver/login')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Driver Dashboard</h2>
          <div className="flex items-center">
            <span className="mr-3 text-sm text-gray-600">Availability Status:</span>
            <button
              onClick={toggleAvailability}
              disabled={activeEmergency !== null}
              className={`px-4 py-2 rounded-lg font-medium shadow-md transition duration-300 ${
                driverInfo.isAvailable 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              } ${activeEmergency !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {driverInfo.isAvailable ? 'Available' : 'Unavailable'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Driver Information Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1">
            <div className="px-6 py-4 bg-green-600">
              <h3 className="text-lg font-medium text-white">Driver Information</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-gray-800 font-medium">{driverInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">License Number</p>
                  <p className="text-gray-800 font-medium">{driverInfo.licenseNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ambulance Number</p>
                  <p className="text-gray-800 font-medium">{driverInfo.ambulanceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Location</p>
                  {currentLocation ? (
                    <p className="text-gray-800 font-medium">
                      Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
                    </p>
                  ) : (
                    <p className="text-yellow-600">Acquiring location...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Active Emergency Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1 md:col-span-2">
            <div className="px-6 py-4 bg-green-600">
              <h3 className="text-lg font-medium text-white">Active Emergency</h3>
            </div>
            <div className="p-6">
              {activeEmergency ? (
                <div>
                  <div className="mb-4">
                    <h4 className="text-lg font-medium text-gray-800">Emergency Details</h4>
                    <p className="text-gray-600">Patient: {activeEmergency.patientInfo}</p>
                    <p className="text-gray-600">Location: Lat: {activeEmergency.patientLocation.lat.toFixed(6)}, Lng: {activeEmergency.patientLocation.lng.toFixed(6)}</p>
                    <p className="text-gray-600">Distance: {activeEmergency.distanceAway}</p>
                    <p className="text-gray-600">Request Time: {activeEmergency.requestTime}</p>
                    {activeEmergency.status === 'en_route_to_hospital' && (
                      <div className="mt-2">
                        <p className="font-medium text-gray-800">Selected Hospital:</p>
                        <p className="text-gray-600">{activeEmergency.selectedHospital.name}</p>
                        <p className="text-gray-600">{activeEmergency.selectedHospital.address}</p>
                        <p className="text-gray-600">ETA: {activeEmergency.selectedHospital.estimatedTime}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {!activeEmergency.status && (
                      <button
                        onClick={markAsPickedUp}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-300"
                      >
                        Mark Patient as Picked Up
                      </button>
                    )}
                    
                    {activeEmergency.status === 'en_route_to_hospital' && (
                      <button
                        onClick={completeEmergency}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md transition duration-300"
                      >
                        Mark as Completed
                      </button>
                    )}
                    
                    <button
                      onClick={() => window.open(`https://maps.google.com/?q=${activeEmergency.patientLocation.lat},${activeEmergency.patientLocation.lng}`, '_blank')}
                      className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg shadow-md transition duration-300"
                    >
                      Open in Maps
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No active emergency. You will see details here when you accept a request.</p>
              )}
            </div>
          </div>

          {/* Emergency Requests Card */}
          {!activeEmergency && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1 md:col-span-3">
              <div className="px-6 py-4 bg-green-600">
                <h3 className="text-lg font-medium text-white">Emergency Requests</h3>
              </div>
              <div className="p-6">
                {emergencyRequests.length > 0 ? (
                  <div className="space-y-4">
                    {emergencyRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition duration-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-800">Emergency Request #{request.id}</h4>
                            <p className="text-gray-600">Distance: {request.distanceAway}</p>
                            <p className="text-gray-600">Requested: {request.requestTime}</p>
                            <p className="text-gray-600">Patient: {request.patientInfo}</p>
                          </div>
                          <button
                            onClick={() => acceptEmergency(request.id)}
                            disabled={!driverInfo.isAvailable}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No emergency requests at the moment. New requests will appear here.</p>
                )}
              </div>
            </div>
          )}

          {/* Nearby Hospitals Card */}
          {showHospitals && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1 md:col-span-3">
              <div className="px-6 py-4 bg-green-600">
                <h3 className="text-lg font-medium text-white">Select Hospital</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">Please select a hospital for the patient:</p>
                <div className="space-y-4">
                  {nearbyHospitals.map((hospital) => (
                    <div key={hospital.id} className="border rounded-lg p-4 hover:bg-gray-50 transition duration-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800">{hospital.name}</h4>
                          <p className="text-gray-600">Distance: {hospital.distance} • ETA: {hospital.estimatedTime}</p>
                          <p className="text-gray-600">{hospital.address}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {hospital.services.map((service: string, index: number) => (
                              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => selectHospital(hospital.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-300"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
