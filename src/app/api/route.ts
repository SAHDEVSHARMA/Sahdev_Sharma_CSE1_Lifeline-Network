import { NextRequest, NextResponse } from 'next/server';
import { getDB, checkDB } from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import { EmergencyRequest, Hospital, Location } from '@/lib/types';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'API is running' });
}

export async function POST(request: NextRequest) {
  try {
    const context = request.context;
    const db = getDB(context);
    checkDB(db);
    
    const { action, ...data } = await request.json();
    
    let result;
    
    switch (action) {
      case 'createEmergencyRequest':
        result = await createEmergencyRequest(db, data);
        break;
      case 'getNearbyHospitals':
        result = await getNearbyHospitals(db, data);
        break;
      case 'updateDriverLocation':
        result = await updateDriverLocation(db, data);
        break;
      case 'updateDriverAvailability':
        result = await updateDriverAvailability(db, data);
        break;
      case 'getEmergencyRequests':
        result = await getEmergencyRequests(db, data);
        break;
      case 'acceptEmergencyRequest':
        result = await acceptEmergencyRequest(db, data);
        break;
      case 'updateAssignmentStatus':
        result = await updateAssignmentStatus(db, data);
        break;
      case 'selectHospital':
        result = await selectHospital(db, data);
        break;
      case 'updateHospitalServices':
        result = await updateHospitalServices(db, data);
        break;
      case 'getIncomingPatients':
        result = await getIncomingPatients(db, data);
        break;
      case 'getNotifications':
        result = await getNotifications(db, data);
        break;
      case 'markNotificationAsRead':
        result = await markNotificationAsRead(db, data);
        break;
      default:
        return NextResponse.json(errorResponse('Unknown action'), { status: 400 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      handleApiError(error, 'processing API request'),
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

// Additional methods would be implemented here
// But moved to separate files for better organization 