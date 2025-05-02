'use server';

import { cookies } from 'next/headers';
import { getCloudflareContext } from '@cloudflare/next-on-pages';

// Database helper functions
async function getDB() {
  try {
    const { env } = getCloudflareContext();
    return env.DB;
  } catch (error) {
    console.error('Error getting DB from Cloudflare context:', error);
    return null;
  }
}

// Patient Authentication
export async function loginPatient(phoneNumber: string, otpCode: string) {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    // Verify OTP
    const { results: otpResults } = await db.prepare(
      'SELECT * FROM otp_verifications WHERE phone_number = ? AND otp_code = ? AND is_verified = FALSE AND expires_at > CURRENT_TIMESTAMP'
    ).bind(phoneNumber, otpCode).all();

    if (otpResults.length === 0) {
      return { success: false, message: 'Invalid or expired OTP' };
    }

    // Mark OTP as verified
    await db.prepare(
      'UPDATE otp_verifications SET is_verified = TRUE WHERE id = ?'
    ).bind(otpResults[0].id).run();

    // Get patient info
    const { results: patientResults } = await db.prepare(
      'SELECT * FROM patients WHERE phone_number = ?'
    ).bind(phoneNumber).all();

    if (patientResults.length === 0) {
      return { success: false, message: 'Patient not found' };
    }

    // Set patient as verified if not already
    if (!patientResults[0].is_verified) {
      await db.prepare(
        'UPDATE patients SET is_verified = TRUE WHERE id = ?'
      ).bind(patientResults[0].id).run();
    }

    // Set authentication cookie
    cookies().set('patient_id', patientResults[0].id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return { 
      success: true, 
      patient: {
        id: patientResults[0].id,
        name: patientResults[0].name,
        phone: patientResults[0].phone_number
      }
    };
  } catch (error) {
    console.error('Error in loginPatient:', error);
    return { success: false, message: 'Server error during login' };
  }
}

export async function sendOTP(phoneNumber: string) {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    // Generate a random 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Set expiration time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Save OTP to database
    await db.prepare(
      'INSERT INTO otp_verifications (phone_number, otp_code, expires_at) VALUES (?, ?, ?)'
    ).bind(phoneNumber, otpCode, expiresAt.toISOString()).run();

    // In a real app, we would send the OTP via SMS
    // For demo purposes, we'll just return the OTP
    return { success: true, otpCode };
  } catch (error) {
    console.error('Error in sendOTP:', error);
    return { success: false, message: 'Server error sending OTP' };
  }
}

export async function registerPatient(name: string, age: number, phoneNumber: string, medicalHistory?: string, previousOperations?: string) {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    // Check if patient already exists
    const { results: existingPatients } = await db.prepare(
      'SELECT * FROM patients WHERE phone_number = ?'
    ).bind(phoneNumber).all();

    let patientId;

    if (existingPatients.length > 0) {
      // Update existing patient
      patientId = existingPatients[0].id;
      await db.prepare(
        'UPDATE patients SET name = ?, age = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind(name, age, patientId).run();
    } else {
      // Create new patient
      const { meta } = await db.prepare(
        'INSERT INTO patients (name, age, phone_number) VALUES (?, ?, ?)'
      ).bind(name, age, phoneNumber).run();
      
      patientId = meta.last_row_id;
    }

    // Add medical history if provided
    if (medicalHistory) {
      await db.prepare(
        'INSERT INTO medical_history (patient_id, condition, notes) VALUES (?, ?, ?)'
      ).bind(patientId, medicalHistory, '').run();
    }

    // Add previous operations if provided
    if (previousOperations) {
      await db.prepare(
        'INSERT INTO medical_history (patient_id, condition, operation_details) VALUES (?, ?, ?)'
      ).bind(patientId, 'Previous Surgery', previousOperations).run();
    }

    return { success: true, patientId };
  } catch (error) {
    console.error('Error in registerPatient:', error);
    return { success: false, message: 'Server error during registration' };
  }
}

// Ambulance Driver Authentication
export async function loginDriver(licenseNumber: string, password: string) {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    // Get driver info
    const { results: driverResults } = await db.prepare(
      'SELECT * FROM ambulance_drivers WHERE license_number = ?'
    ).bind(licenseNumber).all();

    if (driverResults.length === 0) {
      return { success: false, message: 'Driver not found' };
    }

    // In a real app, we would hash passwords
    // For demo purposes, we're comparing plain text
    if (driverResults[0].password !== password) {
      return { success: false, message: 'Invalid password' };
    }

    // Set authentication cookie
    cookies().set('driver_id', driverResults[0].id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return { 
      success: true, 
      driver: {
        id: driverResults[0].id,
        name: driverResults[0].name,
        licenseNumber: driverResults[0].license_number,
        ambulanceNumber: driverResults[0].ambulance_number
      }
    };
  } catch (error) {
    console.error('Error in loginDriver:', error);
    return { success: false, message: 'Server error during login' };
  }
}

export async function registerDriver(name: string, age: number, licenseNumber: string, ambulanceNumber: string, password: string, ambulanceImageUrl?: string) {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    // Check if driver already exists
    const { results: existingDrivers } = await db.prepare(
      'SELECT * FROM ambulance_drivers WHERE license_number = ? OR ambulance_number = ?'
    ).bind(licenseNumber, ambulanceNumber).all();

    if (existingDrivers.length > 0) {
      return { success: false, message: 'Driver with this license or ambulance number already exists' };
    }

    // Create new driver
    const { meta } = await db.prepare(
      'INSERT INTO ambulance_drivers (name, age, license_number, ambulance_number, password, ambulance_image_url) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(name, age, licenseNumber, ambulanceNumber, password, ambulanceImageUrl || '').run();
    
    const driverId = meta.last_row_id;

    return { success: true, driverId };
  } catch (error) {
    console.error('Error in registerDriver:', error);
    return { success: false, message: 'Server error during registration' };
  }
}

// Hospital Authentication
export async function loginHospital(registrationNumber: string, password: string) {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    // Get hospital info
    const { results: hospitalResults } = await db.prepare(
      'SELECT * FROM hospitals WHERE registration_number = ?'
    ).bind(registrationNumber).all();

    if (hospitalResults.length === 0) {
      return { success: false, message: 'Hospital not found' };
    }

    // In a real app, we would hash passwords
    // For demo purposes, we're comparing plain text
    if (hospitalResults[0].password !== password) {
      return { success: false, message: 'Invalid password' };
    }

    // Set authentication cookie
    cookies().set('hospital_id', hospitalResults[0].id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return { 
      success: true, 
      hospital: {
        id: hospitalResults[0].id,
        name: hospitalResults[0].name,
        registrationNumber: hospitalResults[0].registration_number
      }
    };
  } catch (error) {
    console.error('Error in loginHospital:', error);
    return { success: false, message: 'Server error during login' };
  }
}

export async function registerHospital(name: string, registrationNumber: string, address: string, emergencyContact: string, 
  locationLat: number, locationLng: number, password: string, services: string[]) {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    // Check if hospital already exists
    const { results: existingHospitals } = await db.prepare(
      'SELECT * FROM hospitals WHERE registration_number = ?'
    ).bind(registrationNumber).all();

    if (existingHospitals.length > 0) {
      return { success: false, message: 'Hospital with this registration number already exists' };
    }

    // Create new hospital
    const { meta } = await db.prepare(
      'INSERT INTO hospitals (name, registration_number, password, emergency_contact, location_lat, location_lng, address) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(name, registrationNumber, password, emergencyContact, locationLat, locationLng, address).run();
    
    const hospitalId = meta.last_row_id;

    // Add services
    for (const service of services) {
      await db.prepare(
        'INSERT INTO hospital_services (hospital_id, service_name) VALUES (?, ?)'
      ).bind(hospitalId, service).run();
    }

    return { success: true, hospitalId };
  } catch (error) {
    console.error('Error in registerHospital:', error);
    return { success: false, message: 'Server error during registration' };
  }
}

// Authentication Check
export async function getCurrentPatient() {
  const patientId = cookies().get('patient_id')?.value;
  if (!patientId) return null;

  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    const { results } = await db.prepare(
      'SELECT id, name, age, phone_number FROM patients WHERE id = ?'
    ).bind(parseInt(patientId)).all();

    if (results.length === 0) {
      cookies().delete('patient_id');
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Error in getCurrentPatient:', error);
    return null;
  }
}

export async function getCurrentDriver() {
  const driverId = cookies().get('driver_id')?.value;
  if (!driverId) return null;

  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    const { results } = await db.prepare(
      'SELECT id, name, license_number, ambulance_number, is_available FROM ambulance_drivers WHERE id = ?'
    ).bind(parseInt(driverId)).all();

    if (results.length === 0) {
      cookies().delete('driver_id');
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Error in getCurrentDriver:', error);
    return null;
  }
}

export async function getCurrentHospital() {
  const hospitalId = cookies().get('hospital_id')?.value;
  if (!hospitalId) return null;

  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    const { results } = await db.prepare(
      'SELECT id, name, registration_number, emergency_contact, location_lat, location_lng, address FROM hospitals WHERE id = ?'
    ).bind(parseInt(hospitalId)).all();

    if (results.length === 0) {
      cookies().delete('hospital_id');
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Error in getCurrentHospital:', error);
    return null;
  }
}

// Logout
export async function logout() {
  cookies().delete('patient_id');
  cookies().delete('driver_id');
  cookies().delete('hospital_id');
  return { success: true };
}
