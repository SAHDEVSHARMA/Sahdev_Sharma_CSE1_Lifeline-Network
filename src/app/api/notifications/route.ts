import { NextRequest, NextResponse } from 'next/server';
import { getDB, checkDB } from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const db = getDB(request);
    checkDB(db);
    
    const { action, ...data } = await request.json();
    
    switch (action) {
      case 'getNotifications':
        return NextResponse.json(await getNotifications(db, data));
      case 'markNotificationAsRead':
        return NextResponse.json(await markNotificationAsRead(db, data));
      default:
        return NextResponse.json(errorResponse('Unknown notification action'), { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      handleApiError(error, 'processing notification API request'),
      { status: 500 }
    );
  }
}

async function getNotifications(db, data) {
  try {
    const { userId } = data;
    
    const results = await db.prepare(`
      SELECT id, user_id, message, read, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).bind(userId).all();
    
    const notifications = results.results.map(row => ({
      id: row.id,
      userId: row.user_id,
      message: row.message,
      read: Boolean(row.read),
      createdAt: row.created_at
    }));
    
    return successResponse({ notifications }, 'Notifications retrieved successfully');
  } catch (error) {
    return handleApiError(error, 'getNotifications');
  }
}

async function markNotificationAsRead(db, data) {
  try {
    const { notificationId } = data;
    
    await db.prepare(`
      UPDATE notifications
      SET read = 1
      WHERE id = ?
    `).bind(notificationId).run();
    
    return successResponse({}, 'Notification marked as read');
  } catch (error) {
    return handleApiError(error, 'markNotificationAsRead');
  }
} 