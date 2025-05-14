-- Add createdAt and updatedAt columns to User table
ALTER TABLE "User" ADD COLUMN "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Add any other commonly expected fields that might be missing
ALTER TABLE "User" ADD COLUMN "emailVerified" DATETIME DEFAULT NULL;
ALTER TABLE "User" ADD COLUMN "matricNumber" TEXT DEFAULT NULL;
ALTER TABLE "User" ADD COLUMN "level" TEXT DEFAULT NULL;

-- Add missing columns to User table
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "title" TEXT;
ALTER TABLE "User" ADD COLUMN "staffId" TEXT;
