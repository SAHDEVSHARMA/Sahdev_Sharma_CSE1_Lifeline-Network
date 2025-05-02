'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AmbulanceDriverLoginPage() {
  const router = useRouter();
  const [licenseNumber, setLicenseNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!licenseNumber || !password) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    
    // In a real app, this would call an API to authenticate
    setTimeout(() => {
      setIsLoading(false);
      
      // For demo, we'll just accept any credentials
      if (password === 'driver123') {
        router.push('/driver/dashboard');
      } else {
        setError('Invalid credentials. For demo, use password: driver123');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-600 mb-2">Ambulance Driver Login</h1>
          <p className="text-gray-600">Login with your driver license and password</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Driver License Number
            </label>
            <input
              type="text"
              id="licenseNumber"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="Enter your license number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              For demo purposes, use password: driver123
            </p>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin h-5 w-5 mr-2 border-b-2 border-white rounded-full"></span>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">Don't have an account?</p>
          <Link href="/driver/register" className="text-green-600 hover:text-green-800 font-medium">
            Register as Ambulance Driver
          </Link>
        </div>
      </div>
    </div>
  );
}
