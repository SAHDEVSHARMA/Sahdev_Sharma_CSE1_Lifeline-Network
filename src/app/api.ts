'use server';

import { cookies } from 'next/headers';
import { getCloudflareContext } from '@cloudflare/next-on-pages';
import { getCurrentPatient, getCurrentDriver, getCurrentHospital } from './auth';

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

// Emergency Request Functions
export async function createEmergencyRequest(locationLat: number, locationLng: number, requestType: 'ambulance' | 'hospital_search') {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    // Check if user is logged in
    const patient = await getCurrentPatient();
    const patientId = patient?.id || null;

    // Create emergency request
    const { meta } = await db.prepare(
      'INSERT INTO emergency_requests (patient_id, status, request_type, location_lat, location_lng) VALUES (?, ?, ?, ?, ?)'
    ).bind(patientId, 'pending', requestType, locationLat, locationLng).run();
    
    const requestId = meta.last_row_id;

    if (requestType === 'ambulance') {
      // Find nearby available ambulance drivers
      const { results: nearbyDrivers } = await db.prepare(`
        SELECT id, name, ambulance_number, last_location_lat, last_location_lng,
        (6371 * acos(cos(radians(?)) * cos(radians(last_location_lat)) * cos(radians(last_location_lng) - radians(?)) + sin(radians(?)) * sin(radians(last_location_lat)))) AS distance
        FROM ambulance_drivers
        WHERE is_available = TRUE
        ORDER BY distance
        LIMIT 5
      `).bind(locationLat, locationLng, locationLat).all();

      // Create notifications for nearby drivers
      for (const driver of nearbyDrivers) {
        await db.prepare(
          'INSERT INTO notifications (recipient_type, recipient_id, emergency_request_id, message) VALUES (?, ?, ?, ?)'
        ).bind('ambulance_driver', driver.id, requestId, 'New emergency request nearby').run();
      }
    }

    return { success: true, requestId, requestType };
  } catch (error) {
    console.error('Error in createEmergencyRequest:', error);
    return { success: false, message: 'Server error creating emergency request' };
  }
}

export async function getNearbyHospitals(locationLat: number, locationLng: number) {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    // Find nearby hospitals
    const { results: hospitals } = await db.prepare(`
      SELECT h.id, h.name, h.address, h.emergency_contact, h.location_lat, h.location_lng,
      (6371 * acos(cos(radians(?)) * cos(radians(h.location_lat)) * cos(radians(h.location_lng) - radians(?)) + sin(radians(?)) * sin(radians(h.location_lat)))) AS distance
      FROM hospitals h
      ORDER BY distance
      LIMIT 10
    `).bind(locationLat, locationLng, locationLat).all();

    // Get services for each hospital
    const hospitalsWithServices = await Promise.all(hospitals.map(async (hospital) => {
      const { results: services } = await db.prepare(`
        SELECT service_name, is_available
        FROM hospital_services
        WHERE hospital_id = ?
      `).bind(hospital.id).all();

      return {
        ...hospital,
        distance: `${hospital.distance.toFixed(1)} km`,
        services: services.filter(s => s.is_available).map(s => s.service_name)
      };
    }));

    return { success: true, hospitals: hospitalsWithServices };
  } catch (error) {
    console.error('Error in getNearbyHospitals:', error);
    return { success: false, message: 'Server error finding nearby hospitals' };
  }
}

// Ambulance Driver Functions
export async function updateDriverLocation(locationLat: number, locationLng: number) {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    const driver = await getCurrentDriver();
    if (!driver) {
      return { success: false, message: 'Driver not authenticated' };
    }

    await db.prepare(
      'UPDATE ambulance_drivers SET last_location_lat = ?, last_location_lng = ?, last_location_updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(locationLat, locationLng, driver.id).run();

    return { success: true };
  } catch (error) {
    console.error('Error in updateDriverLocation:', error);
    return { success: false, message: 'Server error updating location' };
  }
}

export async function updateDriverAvailability(isAvailable: boolean) {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    const driver = await getCurrentDriver();
    if (!driver) {
      return { success: false, message: 'Driver not authenticated' };
    }

    await db.prepare(
      'UPDATE ambulance_drivers SET is_available = ? WHERE id = ?'
    ).bind(isAvailable, driver.id).run();

    return { success: true };
  } catch (error) {
    console.error('Error in updateDriverAvailability:', error);
    return { success: false, message: 'Server error updating availability' };
  }
}

export async function getEmergencyRequests() {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    const driver = await getCurrentDriver();
    if (!driver) {
      return { success: false, message: 'Driver not authenticated' };
    }

    // Get driver's location
    const driverLat = driver.last_location_lat;
    const driverLng = driver.last_location_lng;

    // Find nearby pending emergency requests
    const { results: requests } = await db.prepare(`
      SELECT er.id, er.location_lat, er.location_lng, er.created_at,
      (6371 * acos(cos(radians(?)) * cos(radians(er.location_lat)) * cos(radians(er.location_lng) - radians(?)) + sin(radians(?)) * sin(radians(er.location_lat)))) AS distance,
      p.name as patient_name, p.phone_number as patient_phone
      FROM emergency_requests er
      LEFT JOIN patients p ON er.patient_id = p.id
      WHERE er.status = 'pending' AND er.request_type = 'ambulance'
      ORDER BY distance
      LIMIT 10
    `).bind(driverLat, driverLng, driverLat).all();

    // Format the requests
    const formattedRequests = requests.map(req => {
      const requestTime = new Date(req.created_at);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - requestTime.getTime()) / (1000 * 60));
      
      return {
        id: req.id,
        patientLocation: { lat: req.location_lat, lng: req.location_lng },
        distanceAway: `${req.distance.toFixed(1)} km`,
        requestTime: diffMinutes < 60 
          ? `${diffMinutes} mins ago` 
          : `${Math.floor(diffMinutes / 60)} hours ago`,
        patientInfo: req.patient_name || 'Anonymous user',
        patientPhone: req.patient_phone || 'Not available'
      };
    });

    return { success: true, requests: formattedRequests };
  } catch (error) {
    console.error('Error in getEmergencyRequests:', error);
    return { success: false, message: 'Server error getting emergency requests' };
  }
}

export async function acceptEmergencyRequest(requestId: number) {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    const driver = await getCurrentDriver();
    if (!driver) {
      return { success: false, message: 'Driver not authenticated' };
    }

    // Update emergency request status
    await db.prepare(
      'UPDATE emergency_requests SET status = ? WHERE id = ?'
    ).bind('accepted', requestId).run();

    // Create ambulance assignment
    const { meta } = await db.prepare(
      'INSERT INTO ambulance_assignments (emergency_request_id, ambulance_driver_id, status, assigned_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)'
    ).bind(requestId, driver.id, 'assigned').run();
    
    const assignmentId = meta.last_row_id;

    // Update driver availability
    await db.prepare(
      'UPDATE ambulance_drivers SET is_available = FALSE WHERE id = ?'
    ).bind(driver.id).run();

    // Get patient info for notification
    const { results: requestResults } = await db.prepare(`
      SELECT er.patient_id, p.name as patient_name
      FROM emergency_requests er
      LEFT JOIN patients p ON er.patient_id = p.id
      WHERE er.id = ?
    `).bind(requestId).all();

    // Create notification for patient if they're registered
    if (requestResults.length > 0 && requestResults[0].patient_id) {
      await db.prepare(
        'INSERT INTO notifications (recipient_type, recipient_id, emergency_request_id, ambulance_assignment_id, message) VALUES (?, ?, ?, ?, ?)'
      ).bind('patient', requestResults[0].patient_id, requestId, assignmentId, `Ambulance ${driver.ambulance_number} is on the way`).run();
    }

    return { success: true, assignmentId };
  } catch (error) {
    console.error('Error in acceptEmergencyRequest:', error);
    return { success: false, message: 'Server error accepting request' };
  }
}

export async function updateAssignmentStatus(assignmentId: number, status: 'picked_up' | 'en_route_to_hospital' | 'arrived' | 'completed') {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    const driver = await getCurrentDriver();
    if (!driver) {
      return { success: false, message: 'Driver not authenticated' };
    }

    // Update status field
    await db.prepare(
      'UPDATE ambulance_assignments SET status = ? WHERE id = ? AND ambulance_driver_id = ?'
    ).bind(status, assignmentId, driver.id).run();

    // Update timestamp based on status
    if (status === 'picked_up') {
      await db.prepare(
        'UPDATE ambulance_assignments SET pickup_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind(assignmentId).run();
    } else if (status === 'en_route_to_hospital') {
      await db.prepare(
        'UPDATE ambulance_assignments SET hospital_selected_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind(assignmentId).run();
    } else if (status === 'arrived') {
      await db.prepare(
        'UPDATE ambulance_assignments SET arrived_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind(assignmentId).run();
    } else if (status === 'completed') {
      await db.prepare(
        'UPDATE ambulance_assignments SET completed_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind(assignmentId).run();
      
      // Make driver available again
      await db.prepare(
        'UPDATE ambulance_drivers SET is_available = TRUE WHERE id = ?'
      ).bind(driver.id).run();
      
      // Update emergency request status
      const { results } = await db.prepare(
        'SELECT emergency_request_id FROM ambulance_assignments WHERE id = ?'
      ).bind(assignmentId).all();
      
      if (results.length > 0) {
        await db.prepare(
          'UPDATE emergency_requests SET status = ? WHERE id = ?'
        ).bind('completed', results[0].emergency_request_id).run();
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateAssignmentStatus:', error);
    return { success: false, message: 'Server error updating assignment status' };
  }
}

export async function selectHospital(assignmentId: number, hospitalId: number) {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    const driver = await getCurrentDriver();
    if (!driver) {
      return { success: false, message: 'Driver not authenticated' };
    }

    // Update assignment with selected hospital
    await db.prepare(
      'UPDATE ambulance_assignments SET hospital_id = ?, status = ?, hospital_selected_at = CURRENT_TIMESTAMP WHERE id = ? AND ambulance_driver_id = ?'
    ).bind(hospitalId, 'en_route_to_hospital', assignmentId, driver.id).run();

    // Get assignment details for notification
    const { results: assignmentResults } = await db.prepare(`
      SELECT aa.emergency_request_id, er.patient_id
      FROM ambulance_assignments aa
      JOIN emergency_requests er ON aa.emergency_request_id = er.id
      WHERE aa.id = ?
    `).bind(assignmentId).all();

    // Create notification for hospital
    await db.prepare(
      'INSERT INTO notifications (recipient_type, recipient_id, emergency_request_id, ambulance_assignment_id, message) VALUES (?, ?, ?, ?, ?)'
    ).bind('hospital', hospitalId, assignmentResults[0].emergency_request_id, assignmentId, `Ambulance ${driver.ambulance_number} is en route with a patient`).run();

    // Create notification for patient if they're registered
    if (assignmentResults[0].patient_id) {
      // Get hospital name
      const { results: hospitalResults } = await db.prepare(
        'SELECT name FROM hospitals WHERE id = ?'
      ).bind(hospitalId).all();

      await db.prepare(
        'INSERT INTO notifications (recipient_type, recipient_id, emergency_request_id, ambulance_assignment_id, message) VALUES (?, ?, ?, ?, ?)'
      ).bind('patient', assignmentResults[0].patient_id, assignmentResults[0].emergency_request_id, assignmentId, 
        `You are being transported to ${hospitalResults[0].name}`).run();
    }

    return { success: true };
  } catch (error) {
    console.error('Error in selectHospital:', error);
    return { success: false, message: 'Server error selecting hospital' };
  }
}

// Hospital Functions
export async function updateHospitalServices(services: {name: string, isAvailable: boolean}[]) {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    const hospital = await getCurrentHospital();
    if (!hospital) {
      return { success: false, message: 'Hospital not authenticated' };
    }

    // Update each service
    for (const service of services) {
      // Check if service exists
      const { results } = await db.prepare(
        'SELECT id FROM hospital_services WHERE hospital_id = ? AND service_name = ?'
      ).bind(hospital.id, service.name).all();

      if (results.length > 0) {
        // Update existing service
        await db.prepare(
          'UPDATE hospital_services SET is_available = ? WHERE id = ?'
        ).bind(service.isAvailable, results[0].id).run();
      } else {
        // Create new service
        await db.prepare(
          'INSERT INTO hospital_services (hospital_id, service_name, is_available) VALUES (?, ?, ?)'
        ).bind(hospital.id, service.name, service.isAvailable).run();
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateHospitalServices:', error);
    return { success: false, message: 'Server error updating services' };
  }
}

export async function getIncomingPatients() {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    const hospital = await getCurrentHospital();
    if (!hospital) {
      return { success: false, message: 'Hospital not authenticated' };
    }

    // Get incoming patients (en_route_to_hospital status)
    const { results } = await db.prepare(`
      SELECT aa.id, aa.emergency_request_id, aa.ambulance_driver_id, aa.hospital_selected_at,
      ad.name as driver_name, ad.ambulance_number, ad.last_location_lat, ad.last_location_lng,
      er.patient_id, p.name as patient_name, p.age as patient_age
      FROM ambulance_assignments aa
      JOIN ambulance_drivers ad ON aa.ambulance_driver_id = ad.id
      JOIN emergency_requests er ON aa.emergency_request_id = er.id
      LEFT JOIN patients p ON er.patient_id = p.id
      WHERE aa.hospital_id = ? AND aa.status = 'en_route_to_hospital'
      ORDER BY aa.hospital_selected_at DESC
    `).bind(hospital.id).all();

    // Calculate ETA and format data
    const incomingPatients = results.map(patient => {
      // Calculate rough ETA based on distance
      const hospitalLat = hospital.location_lat;
      const hospitalLng = hospital.location_lng;
      const driverLat = patient.last_location_lat;
      const driverLng = patient.last_location_lng;
      
      // Haversine formula for distance
      const R = 6371; // Earth radius in km
      const dLat = (hospitalLat - driverLat) * Math.PI / 180;
      const dLon = (hospitalLng - driverLng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(driverLat * Math.PI / 180) * Math.cos(hospitalLat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      // Assume average speed of 50 km/h
      const etaMinutes = Math.round(distance / 50 * 60);
      
      return {
        id: patient.id,
        ambulanceNumber: patient.ambulance_number,
        driverName: patient.driver_name,
        eta: etaMinutes <= 0 ? 'Arriving now' : `${etaMinutes} minutes`,
        patientInfo: patient.patient_name || 'Anonymous user',
        patientAge: patient.patient_age || 'Unknown',
        condition: 'Unknown' // In a real app, this would come from medical history or emergency details
      };
    });

    return { success: true, incomingPatients };
  } catch (error) {
    console.error('Error in getIncomingPatients:', error);
    return { success: false, message: 'Server error getting incoming patients' };
  }
}

// Notification Functions
export async function getNotifications() {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    // Check which type of user is logged in
    const patient = await getCurrentPatient();
    const driver = await getCurrentDriver();
    const hospital = await getCurrentHospital();

    let recipientType, recipientId;

    if (patient) {
      recipientType = 'patient';
      recipientId = patient.id;
    } else if (driver) {
      recipientType = 'ambulance_driver';
      recipientId = driver.id;
    } else if (hospital) {
      recipientType = 'hospital';
      recipientId = hospital.id;
    } else {
      return { success: false, message: 'User not authenticated' };
    }

    // Get notifications for this user
    const { results } = await db.prepare(`
      SELECT id, message, is_read, created_at
      FROM notifications
      WHERE recipient_type = ? AND recipient_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(recipientType, recipientId).all();

    return { success: true, notifications: results };
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return { success: false, message: 'Server error getting notifications' };
  }
}

export async function markNotificationAsRead(notificationId: number) {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    await db.prepare(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?'
    ).bind(notificationId).run();

    return { success: true };
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return { success: false, message: 'Server error updating notification' };
  }
}
