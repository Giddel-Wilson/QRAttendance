-- Check the current structure of the Attendance table
PRAGMA table_info("Attendance");

-- Add the missing courseId column
ALTER TABLE "Attendance" ADD COLUMN "courseId" TEXT;

-- Create an index for better performance
CREATE INDEX idx_attendance_courseid ON "Attendance"("courseId");

-- Add a foreign key constraint (optional)
PRAGMA foreign_keys = ON;
ALTER TABLE "Attendance" ADD CONSTRAINT fk_attendance_course
    FOREIGN KEY ("courseId")
    REFERENCES "Course"("id")
    ON DELETE CASCADE;
