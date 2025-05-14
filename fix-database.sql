-- Create Session table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT PRIMARY KEY,
  "courseId" TEXT NOT NULL,
  "date" DATETIME NOT NULL,
  "title" TEXT,
  "topic" TEXT,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE
);

-- Create QrSession table if it doesn't exist
CREATE TABLE IF NOT EXISTS "QrSession" (
  "id" TEXT PRIMARY KEY,
  "courseId" TEXT NOT NULL,
  "lecturerId" TEXT NOT NULL,
  "qrData" TEXT NOT NULL,
  "duration" INTEGER NOT NULL,
  "expiresAt" DATETIME NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE,
  FOREIGN KEY ("lecturerId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create Attendance table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Attendance" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PRESENT',
  "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE,
  UNIQUE("userId", "sessionId")
);

-- Create ActivityLog table if it doesn't exist
CREATE TABLE IF NOT EXISTS "ActivityLog" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT,
  "entityId" TEXT,
  "details" TEXT,
  "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- For columns, we need to check if they exist first, and then add them if needed
-- Check if matricNumber column exists in User table
SELECT COUNT(*) AS cnt FROM pragma_table_info('User') WHERE name='matricNumber';
-- Add matricNumber column if it doesn't exist (will need to manually add if count is 0)
-- ALTER TABLE "User" ADD COLUMN "matricNumber" TEXT;

-- Check if level column exists in User table
SELECT COUNT(*) AS cnt FROM pragma_table_info('User') WHERE name='level';
-- Add level column if it doesn't exist (will need to manually add if count is 0)
-- ALTER TABLE "User" ADD COLUMN "level" TEXT;

-- Check if department column exists in User table
SELECT COUNT(*) AS cnt FROM pragma_table_info('User') WHERE name='department';
-- Add department column if it doesn't exist (will need to manually add if count is 0)
-- ALTER TABLE "User" ADD COLUMN "department" TEXT;

-- Make sure StudentCourse table exists for course enrollments
CREATE TABLE IF NOT EXISTS "StudentCourse" (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "enrolledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE,
  UNIQUE("studentId", "courseId")
);

-- Run these commands in SQLite Browser to fix potential issues

-- 1. Check User table structure
PRAGMA table_info("User");

-- 2. Make sure all columns exist (these won't run if columns already exist)
-- SQLite has no IF NOT EXISTS for ALTER TABLE so we need to check first
SELECT 1 FROM pragma_table_info('User') WHERE name='matricNumber';
-- If the above returns no rows, run:
-- ALTER TABLE "User" ADD COLUMN "matricNumber" TEXT;

SELECT 1 FROM pragma_table_info('User') WHERE name='level';
-- If the above returns no rows, run:
-- ALTER TABLE "User" ADD COLUMN "level" TEXT;

SELECT 1 FROM pragma_table_info('User') WHERE name='department';
-- If the above returns no rows, run:
-- ALTER TABLE "User" ADD COLUMN "department" TEXT;

-- 3. Check if any columns are misnamed (common issue)
SELECT name FROM pragma_table_info('User') WHERE name LIKE '%matric%';
SELECT name FROM pragma_table_info('User') WHERE name LIKE '%level%';
SELECT name FROM pragma_table_info('User') WHERE name LIKE '%depart%';

-- 4. Fix any integrity issues
PRAGMA integrity_check;

-- 5. Vacuum the database to optimize
VACUUM;
