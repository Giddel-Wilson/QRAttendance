-- Find a student and session combination that doesn't have an attendance record yet
INSERT INTO Attendance (id, userId, sessionId, status, timestamp)
SELECT 
  lower(hex(randomblob(16))),
  u.id,
  s.id,
  'PRESENT',
  datetime('now')
FROM "User" u, Session s
WHERE u.role = 'STUDENT'
AND NOT EXISTS (
  SELECT 1 
  FROM Attendance a 
  WHERE a.userId = u.id AND a.sessionId = s.id
)
LIMIT 1;

-- If the above doesn't insert anything, create a new session and use that
INSERT INTO Session (id, courseId, date, title, topic, createdAt, updatedAt)
SELECT
  lower(hex(randomblob(16))),
  (SELECT id FROM Course LIMIT 1),
  datetime('now'),
  'Test Session ' || datetime('now'),
  'Test Topic',
  datetime('now'),
  datetime('now')
WHERE NOT EXISTS (
  SELECT 1 FROM Attendance a 
  JOIN "User" u ON a.userId = u.id
  JOIN Session s ON a.sessionId = s.id
  WHERE u.role = 'STUDENT'
);

-- Then try to create an attendance record with the new session
INSERT INTO Attendance (id, userId, sessionId, status, timestamp)
SELECT 
  lower(hex(randomblob(16))),
  (SELECT id FROM "User" WHERE role = 'STUDENT' LIMIT 1),
  (SELECT id FROM Session ORDER BY createdAt DESC LIMIT 1),
  'PRESENT',
  datetime('now')
WHERE EXISTS (
  SELECT 1 FROM "User" WHERE role = 'STUDENT'
) AND NOT EXISTS (
  SELECT 1 FROM Attendance a 
  WHERE a.userId = (SELECT id FROM "User" WHERE role = 'STUDENT' LIMIT 1) 
  AND a.sessionId = (SELECT id FROM Session ORDER BY createdAt DESC LIMIT 1)
);
