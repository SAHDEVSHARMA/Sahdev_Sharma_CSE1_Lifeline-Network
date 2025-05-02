'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NearbyHospitalsPage({
  searchParams,
}: {
  searchParams: { lat: string; lng: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const { lat, lng } = searchParams;

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For demo purposes, we'll simulate loading hospital data
    const timer = setTimeout(() => {
      setHospitals([
        {
          id: 1,
          name: 'USHA HOSPITAL',
          distance: '1.5 km',
          address: 'Chungi No.: 1, Gurgram Road, adjacent to Eldeco Society, near Tata Motors Showroom, Sohna, Sohna Rural, Haryana 122103',
          services: ['Emergency Room', 'Trauma Center', 'Cardiology'],
          phone: '095182 47365'
        },
        {
          id: 2,
          name: 'UPKAR MULTISPECIALITY HOSPITA',
          distance: '2.8 km',
          address: 'Delhi alwar road, near Honda agency, Shahid Smarak, Sohna, Gurugram, Haryana 122103',
          services: ['Emergency Room', 'Pediatrics', 'Orthopedics'],
          phone: '070300 09010'
        },
        {
          id: 3,
          name: 'BALAJI MEDICARE CENTERl',
        distance: '1.8 km',
        address: 'Chungi no 1, near saini market, Saini Colony, Sohna, Sohna Rural, Haryana 122103',
          services: ['Emergency Room', 'Neurology', 'Oncology', 'Burn Unit'],
          phone: ' 098963 66345'
        }
      ]);
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden p-6 mb-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600 mb-2">Nearby Hospitals</h1>
          <p className="text-gray-600">Based on your current location (Lat: {lat}, Lng: {lng})</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Finding hospitals near you...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hospitals.map((hospital) => (
              <div key={hospital.id} className="border rounded-lg p-4 hover:bg-blue-50 transition duration-200">
                <h2 className="text-xl font-semibold text-blue-800">{hospital.name}</h2>
                <p className="text-gray-600 mb-2">{hospital.distance} away • {hospital.address}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {hospital.services.map((service: string, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {service}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3">
                  <a href={`tel:${hospital.phone}`} className="text-blue-600 font-medium">
                    {hospital.phone}
                  </a>
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    onClick={() => window.open(`https://maps.google.com/?q=${hospital.name}`, '_blank')}
                  >
                    Get Directions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/emergency')}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg shadow-md transition duration-300"
          >
            Back to Emergency
          </button>
        </div>
      </div>
    </div>
  );
}
