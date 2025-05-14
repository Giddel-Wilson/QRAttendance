-- Reset password for a test account - replace with SHA-256 of 'password123'
UPDATE "User" 
SET passwordHash = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f' 
WHERE email = 'example.g1@gmail.com';

-- Or for plain text (just for testing)
-- UPDATE "User" SET passwordHash = 'password123' WHERE email = 'example.g1@gmail.com';
