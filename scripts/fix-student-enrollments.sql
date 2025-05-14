-- Check and fix student data in the database

-- Check for students with missing level information
SELECT id, name, email, level FROM "User" 
WHERE role = 'STUDENT' AND (level IS NULL OR level = '');

-- Update students with missing level information (if any)
-- Uncomment and adjust as needed:
-- UPDATE "User" SET level = '100' WHERE role = 'STUDENT' AND (level IS NULL OR level = '');

-- Check if courses have level information in their code
SELECT id, code, name FROM "Course";

-- Check course assignments to lecturers
SELECT 
  c.code, c.name,
  u.name as lecturer_name,
  u.email as lecturer_email
FROM "Course" c
JOIN "CourseLecturer" cl ON c.id = cl.courseId
JOIN "User" u ON cl.lecturerId = u.id
ORDER BY c.code;

-- Check student enrollments
SELECT
  sc.id as enrollment_id,
  c.code as course_code,
  u.name as student_name,
  u.level as student_level,
  u.matricNumber as matric_number
FROM "StudentCourse" sc
JOIN "Course" c ON sc.courseId = c.id
JOIN "User" u ON sc.studentId = u.id
ORDER BY c.code, u.name;

-- Auto-enroll students in courses matching their level
INSERT INTO "StudentCourse" (id, studentId, courseId, enrolledAt)
SELECT
  lower(hex(randomblob(16))),
  u.id,
  c.id,
  datetime('now')
FROM "User" u
CROSS JOIN "Course" c
WHERE 
  u.role = 'STUDENT' 
  AND u.level IS NOT NULL
  AND c.code LIKE '%' || substr(u.level, 1, 1) || '%'
  AND NOT EXISTS (
    SELECT 1 
    FROM "StudentCourse" sc 
    WHERE sc.studentId = u.id AND sc.courseId = c.id
  );

-- Add level information to students without it
-- This assigns levels based on their email address as a fallback
UPDATE "User"
SET level = 
  CASE 
    WHEN email LIKE '%100%' THEN '100'
    WHEN email LIKE '%200%' THEN '200'
    WHEN email LIKE '%300%' THEN '300' 
    WHEN email LIKE '%400%' THEN '400'
    WHEN email LIKE '%500%' THEN '500'
    ELSE '100' -- Default to 100 level
  END
WHERE role = 'STUDENT' AND (level IS NULL OR level = '');
