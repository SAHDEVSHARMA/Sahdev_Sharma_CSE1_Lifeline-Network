"use client";

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistance } from 'date-fns';
import { EmergencyRequest } from '@/lib/types';

interface EmergencyCardProps {
  request: EmergencyRequest;
  onAccept?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  isDriver?: boolean;
  isHospital?: boolean;
}

export function EmergencyCard({ 
  request, 
  onAccept, 
  onComplete, 
  onCancel,
  isDriver = false,
  isHospital = false
}: EmergencyCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'accepted':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'completed':
        return 'bg-green-500 hover:bg-green-600';
      case 'canceled':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>{request.patientName}</CardTitle>
          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-2">
          <div className="text-sm">
            <span className="font-semibold">Location:</span> {request.location.latitude.toFixed(6)}, {request.location.longitude.toFixed(6)}
          </div>
          <div className="text-sm">
            <span className="font-semibold">Requested:</span> {formatDistance(new Date(request.createdAt), new Date(), { addSuffix: true })}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {isDriver && request.status === 'pending' && onAccept && (
          <Button onClick={onAccept} className="bg-blue-500 hover:bg-blue-600">
            Accept
          </Button>
        )}
        {isDriver && request.status === 'accepted' && onComplete && (
          <Button onClick={onComplete} className="bg-green-500 hover:bg-green-600">
            Complete
          </Button>
        )}
        {(isDriver || isHospital) && ['pending', 'accepted'].includes(request.status) && onCancel && (
          <Button onClick={onCancel} variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
            Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}