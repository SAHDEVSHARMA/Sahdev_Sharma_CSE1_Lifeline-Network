'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Step 1: Basic Information
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Step 2: OTP Verification
  const [otp, setOtp] = useState('');
  
  // Step 3: Medical History
  const [medicalHistory, setMedicalHistory] = useState('');
  const [previousOperations, setPreviousOperations] = useState('');

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !age || !phoneNumber) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (isNaN(Number(age)) || Number(age) <= 0 || Number(age) > 120) {
      setError('Please enter a valid age');
      return;
    }
    
    if (phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setIsLoading(true);
    
    // In a real app, this would call an API to send OTP
    setTimeout(() => {
      setIsLoading(false);
      setError('');
      setStep(2);
    }, 1500);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }
    
    setIsLoading(true);
    
    // In a real app, this would call an API to verify OTP
    setTimeout(() => {
      setIsLoading(false);
      
      // For demo, we'll just accept any OTP
      if (otp === '1234') {
        setError('');
        setStep(3);
      } else {
        setError('Invalid OTP. For demo, use 1234');
      }
    }, 1500);
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    // In a real app, this would call an API to register the user
    setTimeout(() => {
      setIsLoading(false);
      router.push('/patient/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600 mb-2">Patient Registration</h1>
          <p className="text-gray-600">
            {step === 1 && 'Step 1: Basic Information'}
            {step === 2 && 'Step 2: Verify Phone Number'}
            {step === 3 && 'Step 3: Medical History'}
          </p>
          
          <div className="flex justify-center items-center space-x-2 mt-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>3</div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-5 w-5 mr-2 border-b-2 border-white rounded-full"></span>
                  Processing...
                </span>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                One-Time Password
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP sent to your phone"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                For demo purposes, use OTP: 1234
              </p>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-5 w-5 mr-2 border-b-2 border-white rounded-full"></span>
                  Verifying...
                </span>
              ) : (
                'Verify OTP'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg shadow-md transition duration-300"
            >
              Back
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3Submit} className="space-y-4">
            <div>
              <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-1">
                Medical Conditions (Optional)
              </label>
              <textarea
                id="medicalHistory"
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="Enter any medical conditions (allergies, chronic conditions, etc.)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 h-24"
              />
            </div>
            
            <div>
              <label htmlFor="previousOperations" className="block text-sm font-medium text-gray-700 mb-1">
                Previous Operations (Optional)
              </label>
              <textarea
                id="previousOperations"
                value={previousOperations}
                onChange={(e) => setPreviousOperations(e.target.value)}
                placeholder="Enter details of any previous operations"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 h-24"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-5 w-5 mr-2 border-b-2 border-white rounded-full"></span>
                  Completing Registration...
                </span>
              ) : (
                'Complete Registration'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg shadow-md transition duration-300"
            >
              Back
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">Already have an account?</p>
          <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Login
          </Link>
          <div className="mt-4">
            <Link href="/emergency" className="text-red-600 hover:text-red-800 font-medium">
              Emergency? Get help now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
