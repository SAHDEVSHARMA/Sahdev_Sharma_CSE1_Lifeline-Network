-- Migration number: 0001 	 2025-04-26T05:12:00.000Z
-- Drop existing tables if they exist
DROP TABLE IF EXISTS counters;
DROP TABLE IF EXISTS access_logs;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS medical_history;
DROP TABLE IF EXISTS ambulance_drivers;
DROP TABLE IF EXISTS hospitals;
DROP TABLE IF EXISTS hospital_services;
DROP TABLE IF EXISTS emergency_requests;
DROP TABLE IF EXISTS ambulance_assignments;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS otp_verifications;

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  age INTEGER,
  phone_number TEXT UNIQUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create medical_history table
CREATE TABLE IF NOT EXISTS medical_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER,
  condition TEXT,
  operation_details TEXT,
  operation_date TEXT,
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Create ambulance_drivers table
CREATE TABLE IF NOT EXISTS ambulance_drivers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  age INTEGER,
  license_number TEXT UNIQUE,
  ambulance_number TEXT UNIQUE,
  ambulance_image_url TEXT,
  password TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  last_location_lat REAL,
  last_location_lng REAL,
  last_location_updated_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  registration_number TEXT UNIQUE,
  password TEXT,
  emergency_contact TEXT,
  location_lat REAL,
  location_lng REAL,
  address TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create hospital_services table
CREATE TABLE IF NOT EXISTS hospital_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hospital_id INTEGER,
  service_name TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

-- Create emergency_requests table
CREATE TABLE IF NOT EXISTS emergency_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER,
  status TEXT CHECK(status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  request_type TEXT CHECK(request_type IN ('ambulance', 'hospital_search')),
  location_lat REAL,
  location_lng REAL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Create ambulance_assignments table
CREATE TABLE IF NOT EXISTS ambulance_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  emergency_request_id INTEGER,
  ambulance_driver_id INTEGER,
  hospital_id INTEGER,
  status TEXT CHECK(status IN ('assigned', 'picked_up', 'en_route_to_hospital', 'arrived', 'completed')),
  assigned_at DATETIME,
  pickup_at DATETIME,
  hospital_selected_at DATETIME,
  arrived_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (emergency_request_id) REFERENCES emergency_requests(id),
  FOREIGN KEY (ambulance_driver_id) REFERENCES ambulance_drivers(id),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient_type TEXT CHECK(recipient_type IN ('patient', 'ambulance_driver', 'hospital')),
  recipient_id INTEGER,
  emergency_request_id INTEGER,
  ambulance_assignment_id INTEGER,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (emergency_request_id) REFERENCES emergency_requests(id),
  FOREIGN KEY (ambulance_assignment_id) REFERENCES ambulance_assignments(id)
);

-- Create otp_verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone_number TEXT,
  otp_code TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  expires_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_patients_phone_number ON patients(phone_number);
CREATE INDEX idx_ambulance_drivers_license_number ON ambulance_drivers(license_number);
CREATE INDEX idx_hospitals_registration_number ON hospitals(registration_number);
CREATE INDEX idx_emergency_requests_status ON emergency_requests(status);
CREATE INDEX idx_ambulance_assignments_status ON ambulance_assignments(status);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_type, recipient_id);
CREATE INDEX idx_otp_verifications_phone_number ON otp_verifications(phone_number);

-- No pre-added sample data as per user request
-- The database will start empty and all data will be created through the application
