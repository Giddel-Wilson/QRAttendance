import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load = async ({ locals }) => {
  // Ensure the user is admin
  if (!locals.user || locals.user.role !== 'ADMIN') {
    throw redirect(302, '/auth/login');
  }

  // Initialize data with safe defaults
  const stats = {
    totalUsers: 0,
    totalSessions: 0,
    totalAttendances: 0
  };
  
  const logs = [];
  
  try {
    // Get basic stats
    stats.totalUsers = await db.user.count();
    stats.totalSessions = await db.session.count();
    stats.totalAttendances = await db.attendance.count();
    
    // Get audit logs with user name and role information
    try {
      // Check if table exists
      const tableExists = await db.$queryRaw`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='AuditLog'
      `;
      
      if (Array.isArray(tableExists) && tableExists.length > 0) {
        // Join with User table to get names and roles
        const rawLogs = await db.$queryRaw`
          SELECT 
            a.*,
            u.name AS userName,
            u.role AS userRole
          FROM "AuditLog" a
          LEFT JOIN "User" u ON a.userId = u.id
          ORDER BY a.timestamp DESC
          LIMIT 100
        `;
        
        if (Array.isArray(rawLogs)) {
          // Map the results to ensure consistent properties
          rawLogs.forEach(log => {
            logs.push({
              timestamp: log.timestamp,
              userName: log.userName || 'System',
              userRole: log.userRole || 'N/A',
              action: log.action || 'Unknown',
              entityType: log.entityType || 'N/A',
              details: log.details || ''
            });
          });
        }
      }
    } catch (e) {
      console.error("Error fetching audit logs:", e);
    }
  } catch (error) {
    console.error("Error in audit page load function:", error);
  }
  
  return {
    stats,
    logs
  };
};
