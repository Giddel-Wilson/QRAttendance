import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

async function migrateDatabase() {
  console.log('🔄 Starting database migration process...');
  
  try {
    // 1. Generate Prisma client
    console.log('Generating Prisma client...');
    await execAsync('npx prisma generate');
    
    // 2. Create migration (development only)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Creating migration...');
      await execAsync('npx prisma migrate dev --name add_notifications --create-only');
      console.log('Migration files created. Inspect them before applying.');
    }
    
    // 3. Apply migration in production
    if (process.env.NODE_ENV === 'production') {
      console.log('Applying migrations in production...');
      await execAsync('npx prisma migrate deploy');
    }
    
    console.log('✅ Database migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateDatabase();
