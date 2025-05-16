import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  
  // Log available database URLs (redacted for security)
  if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL:', process.env.DATABASE_URL.split(':')[0] + ':****');
  }
  
  if (process.env.POSTGRES_URL) {
    console.log('POSTGRES_URL:', process.env.POSTGRES_URL.split(':')[0] + ':****');
  }
  
  if (process.env.POSTGRES_PRISMA_URL) {
    console.log('POSTGRES_PRISMA_URL:', process.env.POSTGRES_PRISMA_URL.split(':')[0] + ':****');
  }
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  try {
    // Simple query to test connection
    console.log('Attempting database connection...');
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('✅ Connection successful:', result);
    
    // Try to count users - basic schema test
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Schema verification successful: Found ${userCount} users`);
    } catch (e) {
      console.error('❌ Schema verification failed:', e);
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    
    // Provide helpful diagnostics
    if (error.message.includes('does not exist')) {
      console.log('💡 The database exists but schema may not be migrated.');
      console.log('Run: npx prisma migrate deploy');
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Could not connect to database server. Check:');
      console.log('- Database URL is correct (host, port)');
      console.log('- Network/firewall allows the connection');
      console.log('- Database server is running');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
