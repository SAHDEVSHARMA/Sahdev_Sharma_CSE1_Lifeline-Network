'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HospitalLoginPage() {
  const router = useRouter();
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registrationNumber || !password) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    
    // In a real app, this would call an API to authenticate
    setTimeout(() => {
      setIsLoading(false);
      
      // For demo, we'll just accept any credentials
      if (password === 'hospital123') {
        router.push('/hospital/dashboard');
      } else {
        setError('Invalid credentials. For demo, use password: hospital123');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-purple-600 mb-2">Hospital Login</h1>
          <p className="text-gray-600">Login with your hospital registration number</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Hospital Registration Number
            </label>
            <input
              type="text"
              id="registrationNumber"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder="Enter hospital registration number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
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
              placeholder="Enter password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              For demo purposes, use password: hospital123
            </p>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <Link href="/hospital/register" className="text-purple-600 hover:text-purple-800 font-medium">
            Register Hospital
          </Link>
        </div>
      </div>
    </div>
  );
}
