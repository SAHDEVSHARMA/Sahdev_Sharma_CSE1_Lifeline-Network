'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HospitalDashboardPage() {
  const router = useRouter();
  const [hospitalInfo, setHospitalInfo] = useState({
    name: 'USHA HOSPITAL',
    registrationNumber: 'HOSP-12345',
    address: ' Chungi No.: 1, Gurgram Road, adjacent to Eldeco Society, near Tata Motors Showroom, Sohna, Sohna Rural, Haryana 122103',
    emergencyContact: '102',
    location: { lat: 37.7749, lng: -122.4194 }
  });

  const [services, setServices] = useState([
    { name: 'Emergency Room', isAvailable: true },
    { name: 'Trauma Center', isAvailable: true },
    { name: 'Cardiology', isAvailable: true },
    { name: 'Neurology', isAvailable: false },
    { name: 'Orthopedics', isAvailable: true },
    { name: 'Pediatrics', isAvailable: true },
    { name: 'Oncology', isAvailable: true },
    { name: 'Burn Unit', isAvailable: false }
  ]);

  const [incomingPatients, setIncomingPatients] = useState<any[]>([]);
  const [recentPatients, setRecentPatients] = useState([
    {
      id: 1,
      ambulanceNumber: 'AMB-5678',
      driverName: 'Mr Bhanprakash',
      arrivalTime: '10:30 AM',
      status: 'Arrived',
      patientInfo: 'Anonymous user',
      condition: 'Asthma attack'
    },
    {
      id: 2,
      ambulanceNumber: 'AMB-9012',
      driverName: 'Sarah Williams',
      arrivalTime: '09:15 AM',
      status: 'Treated',
      patientInfo: 'John Doe',
      condition: 'Broken arm'
    }
  ]);

  // Simulate incoming patient notification
  useEffect(() => {
    const timer = setTimeout(() => {
      setIncomingPatients([
        {
          id: 3,
          ambulanceNumber: 'AMB-3456',
          driverName: 'Mr Ram Prakash',
          eta: '5 minutes',
          patientInfo: 'Anonymous user',
          condition: 'Unknown'
        }
      ]);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const toggleServiceAvailability = (serviceName: string) => {
    setServices(services.map(service => 
      service.name === serviceName 
        ? { ...service, isAvailable: !service.isAvailable } 
        : service
    ));
  };

  const acknowledgeIncomingPatient = (patientId: number) => {
    // Remove from incoming patients
    const patient = incomingPatients.find(p => p.id === patientId);
    if (!patient) return;
    
    setIncomingPatients(incomingPatients.filter(p => p.id !== patientId));
    
    // Add to recent patients with status "Expected"
    setRecentPatients([
      {
        ...patient,
        arrivalTime: 'Expected ' + patient.eta,
        status: 'Expected'
      },
      ...recentPatients
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">Hospital Portal</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{hospitalInfo.name}</span>
            <button 
              onClick={() => router.push('/hospital/login')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Hospital Dashboard</h2>
        </div>

        {incomingPatients.length > 0 && (
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-red-800 mb-2">Incoming Patients Alert</h3>
              <div className="space-y-4">
                {incomingPatients.map((patient) => (
                  <div key={patient.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">Ambulance #{patient.ambulanceNumber}</h4>
                        <p className="text-gray-600">Driver: {patient.driverName}</p>
                        <p className="text-gray-600">ETA: {patient.eta}</p>
                        <p className="text-gray-600">Patient: {patient.patientInfo}</p>
                        <p className="text-gray-600">Condition: {patient.condition}</p>
                      </div>
                      <button
                        onClick={() => acknowledgeIncomingPatient(patient.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md transition duration-300"
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Hospital Information Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1">
            <div className="px-6 py-4 bg-purple-600">
              <h3 className="text-lg font-medium text-white">Hospital Information</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Hospital Name</p>
                  <p className="text-gray-800 font-medium">{hospitalInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registration Number</p>
                  <p className="text-gray-800 font-medium">{hospitalInfo.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-800 font-medium">{hospitalInfo.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Emergency Contact</p>
                  <p className="text-gray-800 font-medium">{hospitalInfo.emergencyContact}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-gray-800 font-medium">
                    Lat: {hospitalInfo.location.lat.toFixed(6)}, Lng: {hospitalInfo.location.lng.toFixed(6)}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => router.push('/hospital/edit-profile')}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    Edit Hospital Information
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Services Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1">
            <div className="px-6 py-4 bg-purple-600">
              <h3 className="text-lg font-medium text-white">Available Services</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.name} className="flex justify-between items-center">
                    <span className="text-gray-800">{service.name}</span>
                    <button
                      onClick={() => toggleServiceAvailability(service.name)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        service.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {service.isAvailable ? 'Available' : 'Unavailable'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1">
            <div className="px-6 py-4 bg-purple-600">
              <h3 className="text-lg font-medium text-white">Today's Statistics</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">12</p>
                  <p className="text-sm text-gray-600">Emergency Cases</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">8</p>
                  <p className="text-sm text-gray-600">Ambulance Arrivals</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-yellow-600">5</p>
                  <p className="text-sm text-gray-600">Critical Cases</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-purple-600">85%</p>
                  <p className="text-sm text-gray-600">Capacity</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Patients Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1 md:col-span-3">
            <div className="px-6 py-4 bg-purple-600">
              <h3 className="text-lg font-medium text-white">Recent Patients</h3>
            </div>
            <div className="p-6">
              {recentPatients.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ambulance</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentPatients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{patient.ambulanceNumber}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{patient.driverName}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{patient.patientInfo}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{patient.condition}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{patient.arrivalTime}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              patient.status === 'Arrived' ? 'bg-yellow-100 text-yellow-800' : 
                              patient.status === 'Treated' ? 'bg-green-100 text-green-800' : 
                              patient.status === 'Expected' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {patient.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No recent patients.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
