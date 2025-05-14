-- First, create some students if none exist
INSERT INTO "User" (id, name, email, passwordHash, role, department, level)
SELECT 
  lower(hex(randomblob(16))),
  'Student 1',
  'student1@example.com',
  'password-hash', -- In a real app, this would be an actual password hash
  'STUDENT',
  'Computer Science',
  '300'
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE email = 'student1@example.com');

INSERT INTO "User" (id, name, email, passwordHash, role, department, level)
SELECT 
  lower(hex(randomblob(16))),
  'Student 2',
  'student2@example.com',
  'password-hash', -- In a real app, this would be an actual password hash
  'STUDENT',
  'Computer Science',
  '400'
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE email = 'student2@example.com');

-- Get all courses taught by lecturers
INSERT INTO StudentCourse (id, studentId, courseId)
SELECT 
  lower(hex(randomblob(16))),
  s.id,
  c.id
FROM "User" s
CROSS JOIN Course c
WHERE s.role = 'STUDENT' 
AND NOT EXISTS (
  SELECT 1 FROM StudentCourse sc 
  WHERE sc.studentId = s.id AND sc.courseId = c.id
);

-- Show the enrollment counts after changes
SELECT c.code, c.name, COUNT(sc.id) as enrolledStudents
FROM Course c
LEFT JOIN StudentCourse sc ON c.id = sc.courseId
GROUP BY c.id
ORDER BY c.code;
