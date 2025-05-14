-- Run this in SQLiteBrowser SQL editor

CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "targetRole" TEXT DEFAULT 'ALL', -- ALL, STUDENT, LECTURER, ADMIN
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "UserNotification" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "notificationId" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT 0,
  "readAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE,
  UNIQUE("userId", "notificationId")
);
