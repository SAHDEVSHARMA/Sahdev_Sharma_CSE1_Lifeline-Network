'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EmergencyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(null);

  const handleCallAmbulance = () => {
    setIsLoading(true);
    
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(userLocation);
          
          // In a real app, we would call the API to request an ambulance
          // For demo purposes, we'll just navigate to the confirmation page
          router.push('/emergency/ambulance-requested');
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
          alert('Unable to get your location. Please enable location services and try again.');
        }
      );
    } else {
      setIsLoading(false);
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleFindHospitals = () => {
    setIsLoading(true);
    
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(userLocation);
          
          // In a real app, we would call the API to find nearby hospitals
          // For demo purposes, we'll just navigate to the hospitals page
          router.push('/emergency/nearby-hospitals');
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
          alert('Unable to get your location. Please enable location services and try again.');
        }
      );
    } else {
      setIsLoading(false);
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-3 bg-gradient-to-b from-blue-900 to-blue-800 text-white">
      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-blue-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Emergency Services</h1>
          <p className="text-gray-300">Select an option below</p>
        </div>
        
        <div className="space-y-6">
          <button
            onClick={handleCallAmbulance}
            disabled={isLoading}
            className="w-full py-4 bg-red-600 hover:bg-red-500 rounded-lg text-xl font-bold flex items-center justify-center space-x-3 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <span className="text-2xl">🚑</span>
                {/* <span>Call Ambulance</span> */}
                <a href="tel:108">Call Ambulance </a>
              </>
            )}
          </button>
          
          <button
            onClick={handleFindHospitals}
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-lg text-xl font-bold flex items-center justify-center space-x-3 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <span className="text-2xl">🏥</span>
                <span>Find Nearest Hospital</span>
              </>
            )}
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 mb-2">Already have an account?</p>
          <div className="flex justify-center space-x-4">
            <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
              Patient Login
            </Link>
            <Link href="/driver/login" className="text-purple-400 hover:text-green-300 transition-colors">
              Driver Login
            </Link>
            <Link href="/hospital/login" className="text-purple-400 hover:text-purple-300 transition-colors">
              Hospital Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
