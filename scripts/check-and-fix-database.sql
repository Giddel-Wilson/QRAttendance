-- 1. Check if all students have a level assigned
SELECT id, name, email, level 
FROM "User" 
WHERE role = 'STUDENT' AND (level IS NULL OR level = '');

-- Fix: Assign a default level to students without a level
-- Uncomment and adjust as needed:
-- UPDATE "User" 
-- SET level = '100' 
-- WHERE role = 'STUDENT' AND (level IS NULL OR level = '');

-- 2. Check if courses have valid codes
SELECT id, code, name 
FROM "Course" 
WHERE code IS NULL OR code NOT LIKE '% %';

-- Fix: Update course codes if needed
-- Example: Uncomment and adjust as needed:
-- UPDATE "Course" 
-- SET code = 'CSC 100' 
-- WHERE id = 'some-course-id';

-- 3. Check if students are enrolled in courses matching their level
SELECT 
  u.id AS student_id, 
  u.name AS student_name, 
  u.level AS student_level, 
  c.id AS course_id, 
  c.code AS course_code, 
  c.name AS course_name
FROM "User" u
LEFT JOIN "StudentCourse" sc ON u.id = sc.studentId
LEFT JOIN "Course" c ON sc.courseId = c.id
WHERE u.role = 'STUDENT' AND c.code LIKE '%' || substr(u.level, 1, 1) || '%';

-- 4. Auto-enroll students in courses matching their level
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

-- 5. Check if lecturers are assigned to courses
SELECT 
  c.id AS course_id, 
  c.code AS course_code, 
  c.name AS course_name, 
  u.id AS lecturer_id, 
  u.name AS lecturer_name, 
  u.email AS lecturer_email
FROM "Course" c
LEFT JOIN "CourseLecturer" cl ON c.id = cl.courseId
LEFT JOIN "User" u ON cl.lecturerId = u.id
WHERE u.role = 'LECTURER';

-- 6. Check if the CourseLecturer table exists
PRAGMA table_info("CourseLecturer");

-- Fix: Create the CourseLecturer table if it doesn't exist
CREATE TABLE IF NOT EXISTS "CourseLecturer" (
  id TEXT PRIMARY KEY,
  courseId TEXT NOT NULL,
  lecturerId TEXT NOT NULL,
  assignedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES "Course" (id) ON DELETE CASCADE,
  FOREIGN KEY (lecturerId) REFERENCES "User" (id) ON DELETE CASCADE
);

-- 7. Check if the StudentCourse table exists
PRAGMA table_info("StudentCourse");

-- Fix: Create the StudentCourse table if it doesn't exist
CREATE TABLE IF NOT EXISTS "StudentCourse" (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  courseId TEXT NOT NULL,
  enrolledAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES "User" (id) ON DELETE CASCADE,
  FOREIGN KEY (courseId) REFERENCES "Course" (id) ON DELETE CASCADE
);

-- 8. Verify all tables and relationships
SELECT name FROM sqlite_master WHERE type='table';
