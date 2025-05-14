-- Add createdById column to Session table if it doesn't exist
ALTER TABLE "Session" ADD COLUMN "createdById" TEXT REFERENCES "User"("id");
