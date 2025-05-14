-- Check the current structure of the Schedule table
PRAGMA table_info('Schedule');

-- See a sample of data from the Schedule table
SELECT * FROM Schedule LIMIT 5;

-- Check foreign key relationships
PRAGMA foreign_key_list('Schedule');

-- Check if there are any schedules for our courses
SELECT s.*, c.name as courseName 
FROM Schedule s
JOIN Course c ON s.courseId = c.id
LIMIT 10;
