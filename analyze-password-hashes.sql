-- Query to analyze password hashes in the User table
SELECT 
  email,
  passwordHash,
  LENGTH(passwordHash) as hash_length,
  CASE 
    WHEN passwordHash LIKE '$2a$%' OR passwordHash LIKE '$2b$%' THEN 'bcrypt'
    WHEN passwordHash LIKE '$6$%' THEN 'SHA-512 (crypt)'
    WHEN passwordHash LIKE '$5$%' THEN 'SHA-256 (crypt)'
    WHEN passwordHash LIKE '$1$%' THEN 'MD5 (crypt)'
    WHEN passwordHash LIKE '%:%' THEN 'Possibly PBKDF2 or similar with salt'
    WHEN LENGTH(passwordHash) = 32 THEN 'Possibly MD5'
    WHEN LENGTH(passwordHash) = 40 THEN 'Possibly SHA-1'
    WHEN LENGTH(passwordHash) = 64 THEN 'Possibly SHA-256'
    WHEN LENGTH(passwordHash) = 128 THEN 'Possibly SHA-512'
    ELSE 'Unknown'
  END as likely_hash_type,
  SUBSTR(passwordHash, 1, 10) || '...' as hash_preview
FROM "User"
LIMIT 10;
