'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';



export default function AmbulanceRequestedPage({
  searchParams,
}: {
  searchParams: { lat: string; lng: string };
}) {
  const router = useRouter();
  const [isWaiting, setIsWaiting] = useState(true);
  const [ambulanceAssigned, setAmbulanceAssigned] = useState(false);
  const { lat, lng } = searchParams;

  // In a real app, this would use WebSockets to get real-time updates
  // For demo purposes, we'll simulate an ambulance being assigned after 5 seconds
  useState(() => {
    const timer = setTimeout(() => {
      setIsWaiting(false);
      setAmbulanceAssigned(true);
    }, 5000);

    return () => clearTimeout(timer);
  });

  return (
    <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Ambulance Request</h1>
          {isWaiting ? (
            <p className="text-gray-600">Searching for available ambulances near you...</p>
          ) : ambulanceAssigned ? (
            <p className="text-green-600 font-semibold">Ambulance is on the way!</p>
          ) : (
            <p className="text-red-600">No ambulances available at the moment. Please try again.</p>
          )}
        </div>

        <div className="mb-6">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-gray-800 mb-2">Your Location</h2>
            <p className="text-gray-600">Latitude: {lat}</p>
            <p className="text-gray-600">Longitude: {lng}</p>
            <p className="text-sm text-gray-500 mt-2">
              This information will be shared with the ambulance driver.
            </p>
          </div>
        </div>

        {isWaiting ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Please wait while we contact nearby ambulances...</p>
          </div>
        ) : ambulanceAssigned ? (
          <div className="space-y-4">
            <div className="bg-green-100 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-green-800 mb-2">Ambulance Details</h2>
              <p className="text-gray-700">Driver: Mr. Satya Prakesh</p>
              <p className="text-gray-700">Ambulance #: AMB 242630</p>
              <p className="text-gray-700">ETA: Approximately 8 minutes</p>
            </div>
            <button
              onClick={() => router.push('/emergency')}
              className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg shadow-md transition duration-300"
            >
              Back to Emergency
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-700">
              We couldn't find an available ambulance near you. Please try again or consider
              alternative transportation to the nearest hospital.
            </p>
            <button
              onClick={() => router.push('/emergency/nearby-hospitals?lat=' + lat + '&lng=' + lng)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-300"
            >
              Find Nearest Hospital
            </button>
            <button
              onClick={() => router.push('/emergency')}
              className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg shadow-md transition duration-300"
            >
              Back to Emergency
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
