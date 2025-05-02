"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Location } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LocationMapProps {
  location: Location;
  className?: string;
  height?: string;
  showCoordinates?: boolean;
}

export function LocationMap({ 
  location, 
  className, 
  height = 'h-[200px]',
  showCoordinates = true 
}: LocationMapProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className={cn('bg-gray-100 relative flex items-center justify-center', height)}>
        {/* This is a placeholder for a real map implementation */}
        <div className="text-center p-4">
          <p className="text-muted-foreground text-sm mb-2">Map View</p>
          {showCoordinates && (
            <div className="text-xs font-mono">
              Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
} 