-- Check if level column exists
SELECT COUNT(*) FROM pragma_table_info('User') WHERE name='level';
-- If the above returns 0, run this:
-- ALTER TABLE "User" ADD COLUMN "level" TEXT;

-- Check if department column exists
SELECT COUNT(*) FROM pragma_table_info('User') WHERE name='department';
-- If the above returns 0, run this:
-- ALTER TABLE "User" ADD COLUMN "department" TEXT;
