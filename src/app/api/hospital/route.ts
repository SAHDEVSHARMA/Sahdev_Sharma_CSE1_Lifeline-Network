import { NextRequest, NextResponse } from 'next/server';
import { getDB, checkDB } from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const db = getDB(request);
    checkDB(db);
    
    const { action, ...data } = await request.json();
    
    switch (action) {
      case 'updateHospitalServices':
        return NextResponse.json(await updateHospitalServices(db, data));
      case 'getIncomingPatients':
        return NextResponse.json(await getIncomingPatients(db, data));
      default:
        return NextResponse.json(errorResponse('Unknown hospital action'), { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      handleApiError(error, 'processing hospital API request'),
      { status: 500 }
    );
  }
}

async function updateHospitalServices(db, data) {
  try {
    const { hospitalId, services } = data;
    
    await db.prepare(`
      UPDATE hospitals
      SET services = ?
      WHERE id = ?
    `).bind(JSON.stringify(services), hospitalId).run();
    
    return successResponse({}, 'Services updated successfully');
  } catch (error) {
    return handleApiError(error, 'updateHospitalServices');
  }
}

async function getIncomingPatients(db, data) {
  try {
    const { hospitalId } = data;
    
    const results = await db.prepare(`
      SELECT er.id, er.patient_id, er.patient_name, er.latitude, er.longitude, 
             er.status, er.created_at, er.driver_id, d.name as driver_name
      FROM emergency_requests er
      LEFT JOIN drivers d ON er.driver_id = d.id
      WHERE er.hospital_id = ? AND er.status NOT IN ('completed', 'canceled')
      ORDER BY er.created_at DESC
    `).bind(hospitalId).all();
    
    const patients = results.results.map(row => ({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      location: {
        latitude: row.latitude,
        longitude: row.longitude
      },
      status: row.status,
      createdAt: row.created_at,
      driver: row.driver_id ? {
        id: row.driver_id,
        name: row.driver_name
      } : null
    }));
    
    return successResponse({ patients }, 'Incoming patients retrieved successfully');
  } catch (error) {
    return handleApiError(error, 'getIncomingPatients');
  }
} 