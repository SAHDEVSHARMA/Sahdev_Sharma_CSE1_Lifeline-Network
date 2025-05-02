import { NextRequest, NextResponse } from 'next/server';
import { getDB, checkDB } from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import { EmergencyRequest, Location } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const db = getDB(request);
    checkDB(db);
    
    const { action, ...data } = await request.json();
    
    switch (action) {
      case 'createEmergencyRequest':
        return NextResponse.json(await createEmergencyRequest(db, data));
      case 'getNearbyHospitals':
        return NextResponse.json(await getNearbyHospitals(db, data));
      case 'acceptEmergencyRequest':
        return NextResponse.json(await acceptEmergencyRequest(db, data));
      case 'updateAssignmentStatus':
        return NextResponse.json(await updateAssignmentStatus(db, data));
      case 'selectHospital':
        return NextResponse.json(await selectHospital(db, data));
      default:
        return NextResponse.json(errorResponse('Unknown emergency action'), { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      handleApiError(error, 'processing emergency API request'),
      { status: 500 }
    );
  }
}

async function createEmergencyRequest(db, data) {
  try {
    const { patientId, patientName, location } = data;
    
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    
    const request = {
      id,
      patientId,
      patientName,
      location,
      status: 'pending',
      createdAt
    };
    
    await db.prepare(`
      INSERT INTO emergency_requests (id, patient_id, patient_name, latitude, longitude, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(id, patientId, patientName, location.latitude, location.longitude, 'pending', createdAt).run();
    
    return successResponse({ request }, 'Emergency request created successfully');
  } catch (error) {
    return handleApiError(error, 'createEmergencyRequest');
  }
}

async function getNearbyHospitals(db, data) {
  try {
    const { location, radius = 10 } = data; // Default 10km radius
    
    // This is a simplified query - in reality, you'd use geospatial queries
    const results = await db.prepare(`
      SELECT id, name, latitude, longitude, services, available
      FROM hospitals
      WHERE available = 1
    `).all();
    
    const hospitals = results.results.map(row => ({
      id: row.id,
      name: row.name,
      location: {
        latitude: row.latitude,
        longitude: row.longitude
      },
      services: JSON.parse(row.services),
      available: Boolean(row.available)
    }));
    
    return successResponse({ hospitals }, 'Nearby hospitals retrieved successfully');
  } catch (error) {
    return handleApiError(error, 'getNearbyHospitals');
  }
}

async function acceptEmergencyRequest(db, data) {
  try {
    const { requestId, driverId, driverName } = data;
    
    await db.prepare(`
      UPDATE emergency_requests
      SET status = 'accepted', driver_id = ?
      WHERE id = ? AND status = 'pending'
    `).bind(driverId, requestId).run();
    
    // Create notification for patient
    const requestInfo = await db.prepare(`
      SELECT patient_id, patient_name
      FROM emergency_requests
      WHERE id = ?
    `).bind(requestId).first();
    
    if (!requestInfo) {
      return errorResponse('Emergency request not found');
    }
    
    const notificationId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    
    await db.prepare(`
      INSERT INTO notifications (id, user_id, message, read, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      notificationId,
      requestInfo.patient_id,
      `Driver ${driverName} has accepted your emergency request.`,
      0,
      createdAt
    ).run();
    
    return successResponse({}, 'Emergency request accepted successfully');
  } catch (error) {
    return handleApiError(error, 'acceptEmergencyRequest');
  }
}

async function updateAssignmentStatus(db, data) {
  try {
    const { requestId, status } = data;
    
    if (!['accepted', 'completed', 'canceled'].includes(status)) {
      return errorResponse('Invalid status');
    }
    
    await db.prepare(`
      UPDATE emergency_requests
      SET status = ?
      WHERE id = ?
    `).bind(status, requestId).run();
    
    // Create notification for patient
    const requestInfo = await db.prepare(`
      SELECT patient_id, patient_name, driver_id
      FROM emergency_requests
      WHERE id = ?
    `).bind(requestId).first();
    
    if (!requestInfo) {
      return errorResponse('Emergency request not found');
    }
    
    const message = status === 'completed' 
      ? 'Your emergency request has been completed.'
      : status === 'canceled'
        ? 'Your emergency request has been canceled.'
        : 'Your emergency request status has been updated.';
    
    const notificationId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    
    await db.prepare(`
      INSERT INTO notifications (id, user_id, message, read, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(notificationId, requestInfo.patient_id, message, 0, createdAt).run();
    
    return successResponse({}, 'Status updated successfully');
  } catch (error) {
    return handleApiError(error, 'updateAssignmentStatus');
  }
}

async function selectHospital(db, data) {
  try {
    const { requestId, hospitalId, hospitalName } = data;
    
    await db.prepare(`
      UPDATE emergency_requests
      SET hospital_id = ?
      WHERE id = ?
    `).bind(hospitalId, requestId).run();
    
    // Create notifications
    const requestInfo = await db.prepare(`
      SELECT patient_id, patient_name, driver_id
      FROM emergency_requests
      WHERE id = ?
    `).bind(requestId).first();
    
    if (!requestInfo) {
      return errorResponse('Emergency request not found');
    }
    
    // Notify patient
    const patientNotificationId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    
    await db.prepare(`
      INSERT INTO notifications (id, user_id, message, read, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      patientNotificationId,
      requestInfo.patient_id,
      `You are being transported to ${hospitalName}.`,
      0,
      createdAt
    ).run();
    
    // Notify hospital
    const hospitalNotificationId = crypto.randomUUID();
    
    await db.prepare(`
      INSERT INTO notifications (id, user_id, message, read, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      hospitalNotificationId,
      hospitalId,
      `Incoming patient: ${requestInfo.patient_name}.`,
      0,
      createdAt
    ).run();
    
    return successResponse({}, 'Hospital selected successfully');
  } catch (error) {
    return handleApiError(error, 'selectHospital');
  }
} 