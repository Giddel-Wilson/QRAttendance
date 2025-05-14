import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

// GET notifications for the current user
export async function GET({ locals }) {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    console.log(`Fetching notifications for user ${locals.user.email} with role ${locals.user.role}`);
    
    // Create notification table if it doesn't exist
    await db.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Notification" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdBy" TEXT NOT NULL,
        "forStudents" BOOLEAN NOT NULL DEFAULT false,
        "forLecturers" BOOLEAN NOT NULL DEFAULT false,
        "read" BOOLEAN NOT NULL DEFAULT false
      )
    `;

    // Check if we have any notifications at all
    const count = await db.$queryRaw`SELECT COUNT(*) as count FROM "Notification"`;
    const notificationCount = Number(count[0]?.count || 0);
    
    console.log(`Total notifications in database: ${notificationCount}`);
    
    // Add sample notification if none exist
    if (notificationCount === 0) {
      console.log("Adding sample notification to empty database");
      await db.$executeRaw`
        INSERT INTO "Notification" (
          id, title, message, createdBy, forStudents, forLecturers, "createdAt"
        ) VALUES (
          'sample-notification',
          'Welcome to the System', 
          'This is an automatically generated notification. Admins can create notifications for students and lecturers.', 
          'system',
          true,
          true,
          datetime('now')
        )
      `;
    }

    let notifications;
    const userRole = locals.user.role;
    
    // For admins, get all notifications
    if (userRole === 'ADMIN') {
      notifications = await db.$queryRaw`
        SELECT * FROM "Notification" 
        ORDER BY "createdAt" DESC
      `;
    } 
    // For lecturers, get notifications for lecturers
    else if (userRole === 'LECTURER') {
      notifications = await db.$queryRaw`
        SELECT * FROM "Notification" 
        WHERE "forLecturers" = true
        ORDER BY "createdAt" DESC
      `;
    } 
    // For students, get notifications for students
    else if (userRole === 'STUDENT') {
      notifications = await db.$queryRaw`
        SELECT * FROM "Notification" 
        WHERE "forStudents" = true
        ORDER BY "createdAt" DESC
      `;
    }

    console.log(`Retrieved ${notifications?.length || 0} notifications for ${userRole}`);
    return json(notifications || []);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return json([]);
  }
}

// POST a new notification (admin only)
export async function POST({ request, locals }) {
  if (!locals.user || locals.user.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { title, message, forStudents, forLecturers } = await request.json();
    
    if (!title || !message || (!forStudents && !forLecturers)) {
      return json({ error: 'Title, message, and at least one recipient group are required' }, { status: 400 });
    }

    // Generate unique ID
    const id = crypto.randomUUID();
    
    // Create the notification
    await db.$executeRaw`
      INSERT INTO "Notification" (
        id, 
        title, 
        message, 
        "createdBy",
        "forStudents",
        "forLecturers",
        "createdAt"
      ) 
      VALUES (
        ${id},
        ${title},
        ${message},
        ${locals.user.id},
        ${Boolean(forStudents)},
        ${Boolean(forLecturers)},
        datetime('now')
      )
    `;

    console.log(`Created notification: ${title}`);
    return json({ success: true, id });
  } catch (error) {
    console.error("Error creating notification:", error);
    return json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
