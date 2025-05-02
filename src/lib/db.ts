/**
 * Centralized database access module
 */

export function getDB(context: any) {
  try {
    return context.env.DB;
  } catch (error) {
    console.error('Error getting DB from Cloudflare context:', error);
    return null;
  }
}

export function checkDB(db: any) {
  if (!db) throw new Error('Database not available');
  return db;
} 