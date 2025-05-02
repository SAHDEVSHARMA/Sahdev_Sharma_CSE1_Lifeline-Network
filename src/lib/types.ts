/**
 * Central type definitions for the application
 */

export type Location = {
  latitude: number;
  longitude: number;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'driver' | 'hospital';
};

export type Hospital = {
  id: string;
  name: string;
  location: Location;
  services: string[];
  available: boolean;
};

export type Driver = {
  id: string;
  name: string;
  ambulanceNumber: string;
  location: Location;
  available: boolean;
};

export type EmergencyRequest = {
  id: string;
  patientId: string;
  patientName: string;
  location: Location;
  status: 'pending' | 'accepted' | 'completed' | 'canceled';
  driverId?: string;
  hospitalId?: string;
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}; 