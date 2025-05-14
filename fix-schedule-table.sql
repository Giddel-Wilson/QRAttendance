-- First get the current table structure to examine it
PRAGMA table_info('Schedule');

-- Add each column (SQLite doesn't support IF NOT EXISTS for columns)
-- We need to execute these commands one by one and catch errors

-- Add dayOfWeek column
ALTER TABLE "Schedule" ADD COLUMN "dayOfWeek" INTEGER;

-- Add startTime column
ALTER TABLE "Schedule" ADD COLUMN "startTime" TEXT;

-- Add endTime column
ALTER TABLE "Schedule" ADD COLUMN "endTime" TEXT;

-- Add courseId column
ALTER TABLE "Schedule" ADD COLUMN "courseId" TEXT;

-- Add location column
ALTER TABLE "Schedule" ADD COLUMN "location" TEXT;
