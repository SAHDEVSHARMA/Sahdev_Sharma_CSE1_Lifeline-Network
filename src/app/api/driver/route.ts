import { NextRequest, NextResponse } from 'next/server';
import { getDB, checkDB } from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import { Location } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const db = getDB(request);
    checkDB(db);
    
    const { action, ...data } = await request.json();
    
    switch (action) {
      case 'updateDriverLocation':
        return NextResponse.json(await updateDriverLocation(db, data));
      case 'updateDriverAvailability':
        return NextResponse.json(await updateDriverAvailability(db, data));
      case 'getEmergencyRequests':
        return NextResponse.json(await getEmergencyRequests(db, data));
      default:
        return NextResponse.json(errorResponse('Unknown driver action'), { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      handleApiError(error, 'processing driver API request'),
      { status: 500 }
    );
  }
}

async function updateDriverLocation(db, data) {
  try {
    const { driverId, location } = data;
    
    await db.prepare(`
      UPDATE drivers
      SET latitude = ?, longitude = ?, last_location_update = ?
      WHERE id = ?
    `).bind(location.latitude, location.longitude, new Date().toISOString(), driverId).run();
    
    return successResponse({}, 'Location updated successfully');
  } catch (error) {
    return handleApiError(error, 'updateDriverLocation');
  }
}

async function updateDriverAvailability(db, data) {
  try {
    const { driverId, available } = data;
    
    await db.prepare(`
      UPDATE drivers
      SET available = ?
      WHERE id = ?
    `).bind(available ? 1 : 0, driverId).run();
    
    return successResponse({}, 'Availability updated successfully');
  } catch (error) {
    return handleApiError(error, 'updateDriverAvailability');
  }
}

async function getEmergencyRequests(db, data) {
  try {
    const { driverId, status } = data;
    
    let query = `
      SELECT id, patient_id, patient_name, latitude, longitude, status, created_at, hospital_id
      FROM emergency_requests
    `;
    
    let params = [];
    
    if (driverId) {
      query += ' WHERE driver_id = ?';
      params.push(driverId);
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
    } else if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const stmt = db.prepare(query);
    const results = params.length ? await stmt.bind(...params).all() : await stmt.all();
    
    const requests = results.results.map(row => ({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      location: {
        latitude: row.latitude,
        longitude: row.longitude
      },
      status: row.status,
      createdAt: row.created_at,
      hospitalId: row.hospital_id
    }));
    
    return successResponse({ requests }, 'Emergency requests retrieved successfully');
  } catch (error) {
    return handleApiError(error, 'getEmergencyRequests');
  }
} 