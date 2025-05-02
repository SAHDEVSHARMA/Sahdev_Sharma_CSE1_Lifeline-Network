'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PatientDashboardPage() {
  const router = useRouter();
  const [patientInfo, setPatientInfo] = useState({
    name: 'MR ram prasad',
    age: 35,
    phone: '+91 85963745__',
    emergencyContacts: [
      { name: 'Miss Geeta ', relation: 'Spouse', phone: '+91 94223654__' }
    ],
    medicalHistory: [
      { condition: 'Asthma', since: '2010', medications: 'Albuterol inhaler' },
      { condition: 'Appendectomy', since: '2018', medications: 'None' }
    ]
  });

  const [emergencyHistory, setEmergencyHistory] = useState([
    { 
      id: 1, 
      date: '2025-03-15', 
      type: 'Ambulance', 
      status: 'Completed',
      hospital: 'City General Hospital',
      details: 'Asthma attack, emergency treatment provided'
    },
    { 
      id: 2, 
      date: '2024-11-22', 
      type: 'Hospital Search', 
      status: 'Completed',
      hospital: 'Community Medical Center',
      details: 'Sprained ankle, X-ray and treatment'
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Medical Emergency App</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {patientInfo.name}</span>
            <button 
              onClick={() => router.push('/')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Patient Dashboard</h2>
          <button
            onClick={() => router.push('/emergency')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md transition duration-300"
          >
            Emergency
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Patient Information Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1">
            <div className="px-6 py-4 bg-blue-600">
              <h3 className="text-lg font-medium text-white">Personal Information</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-gray-800 font-medium">{patientInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="text-gray-800 font-medium">{patientInfo.age}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-gray-800 font-medium">{patientInfo.phone}</p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => router.push('/patient/edit-profile')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Medical History Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1 md:col-span-2">
            <div className="px-6 py-4 bg-blue-600">
              <h3 className="text-lg font-medium text-white">Medical History</h3>
            </div>
            <div className="p-6">
              {patientInfo.medicalHistory.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {patientInfo.medicalHistory.map((item, index) => (
                    <div key={index} className="py-3">
                      <div className="flex justify-between">
                        <p className="font-medium text-gray-800">{item.condition}</p>
                        <p className="text-sm text-gray-500">Since {item.since}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Medications: {item.medications}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No medical history recorded.</p>
              )}
              <div className="mt-4">
                <button
                  onClick={() => router.push('/patient/edit-medical-history')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Update Medical History
                </button>
              </div>
            </div>
          </div>

          {/* Emergency Contacts Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1">
            <div className="px-6 py-4 bg-blue-600">
              <h3 className="text-lg font-medium text-white">Emergency Contacts</h3>
            </div>
            <div className="p-6">
              {patientInfo.emergencyContacts.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {patientInfo.emergencyContacts.map((contact, index) => (
                    <div key={index} className="py-3">
                      <p className="font-medium text-gray-800">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.relation}</p>
                      <p className="text-sm text-gray-600 mt-1">{contact.phone}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No emergency contacts added.</p>
              )}
              <div className="mt-4">
                <button
                  onClick={() => router.push('/patient/edit-contacts')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Manage Contacts
                </button>
              </div>
            </div>
          </div>

          {/* Emergency History Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1 md:col-span-2">
            <div className="px-6 py-4 bg-blue-600">
              <h3 className="text-lg font-medium text-white">Emergency History</h3>
            </div>
            <div className="p-6">
              {emergencyHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {emergencyHistory.map((emergency) => (
                        <tr key={emergency.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/patient/emergency-details/${emergency.id}`)}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{emergency.date}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{emergency.type}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{emergency.hospital}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              emergency.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                              emergency.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {emergency.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No emergency history recorded.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
