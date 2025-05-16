import { PrismaClient } from '@prisma/client';

// Create the connection string with SSL mode required
const connectionUrl = "postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require";

async function testConnection() {
  console.log('Testing connection to Supabase PostgreSQL...');
  
  // Create a new PrismaClient with explicit connection details
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionUrl
      }
    }
  });
  
  try {
    // Try a simple query
    console.log('Attempting query...');
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('✅ Connection successful!', result);
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Verify the password is correct');
    console.log('2. Check if Supabase allows connections from your IP address');
    console.log('3. Verify SSL is properly configured');
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
