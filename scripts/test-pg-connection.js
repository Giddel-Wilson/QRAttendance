import { Client } from 'pg';

// Connection string with SSL parameters
const connectionString = "postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres";

async function testConnection() {
  console.log('🔍 Testing direct PostgreSQL connection to Supabase...');
  
  // Create client with proper SSL configuration
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Required for Supabase connections
    }
  });
  
  try {
    console.log('Connecting...');
    await client.connect();
    
    console.log('Running test query...');
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Connection successful!');
    console.log('Server time:', result.rows[0].current_time);
    
    await client.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n📋 Connection troubleshooting:');
    console.log('1. Check if your network allows outbound connections to port 5432');
    console.log('2. Verify Supabase is allowing connections from your IP address');
    console.log('3. Make sure your password is correct');
    console.log('4. Try connecting via a different network (e.g., mobile hotspot)');
  }
}

testConnection();
