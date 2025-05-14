-- Check if columns exist before adding them
SELECT COUNT(*) FROM pragma_table_info('User') WHERE name LIKE '%createdAt%';
SELECT COUNT(*) FROM pragma_table_info('User') WHERE name LIKE '%updatedAt%';
SELECT COUNT(*) FROM pragma_table_info('User') WHERE name LIKE '%emailVerified%';
SELECT COUNT(*) FROM pragma_table_info('User') WHERE name LIKE '%matricNumber%';
SELECT COUNT(*) FROM pragma_table_info('User') WHERE name LIKE '%level%';

-- Add only the missing columns with safer approach
CREATE TABLE IF NOT EXISTS "_User_temp" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT,
    "email" TEXT UNIQUE,
    "passwordHash" TEXT,
    "role" TEXT,
    "department" TEXT,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "emailVerified" DATETIME,
    "matricNumber" TEXT,
    "level" TEXT
);
