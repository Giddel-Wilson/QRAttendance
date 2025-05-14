-- First, check the current password hash format
SELECT email, passwordHash FROM "User" WHERE email = 'example.g1@gmail.com';

-- Update the password for test account to a known value
-- Password: 'password123'
UPDATE "User" 
SET passwordHash = '$2b$10$3euPcmQFCiblsZeEu5s7p.9wVsrWxI8 kfl8viMxPBCIJsAYKWX3G6' 
WHERE email = 'example.g1@gmail.com';

-- Or alternatively, set it to plain text for testing purposes
-- UPDATE "User" SET passwordHash = 'password123' WHERE email = 'example.g1@gmail.com';
