'use client';

import { useState } from 'react';

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-lg p-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        
        
        <div className="flex justify-center">
          <button
            onClick={() => setCount(count + 1)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
          >
            
            <span>Welcome to Life-Line Network</span>
            
          </button>
      

        </div>
        
        
        <div className="mt-8 text-center">
          <a href="/emergency" className="text-blue-400 hover:text-blue-300 transition-colors">
            Go to Emergency Medical App
          </a>
        </div>
      </div>
    </main>
  );
}
