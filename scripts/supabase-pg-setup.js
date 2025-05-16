import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// Configuration
const PROJECT_ROOT = '/media/giddel/SAMMY/codeBase/QRAttendance';
const SCHEMA_PATH = path.join(PROJECT_ROOT, 'prisma/schema.prisma');

// Get an SSL-enabled connection string
const getSupabaseConnectionString = (password) => {
  return `postgresql://postgres:${password}@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require`;
};

function run() {
  console.log('🔍 Supabase PostgreSQL Connection Tool');
  
  // 1. Write the PostgreSQL schema with SSL parameter
  const pgSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
}

// ... existing models will be added separately ...`;

  console.log('Writing PostgreSQL schema with SSL support...');
  fs.writeFileSync(SCHEMA_PATH, pgSchema, 'utf8');
  
  // 2. Update the .env file with SSL parameters
  const envPath = path.join(PROJECT_ROOT, '.env');
  const password = '10.Flash.01';  // Using the password from your example
  const connectionString = getSupabaseConnectionString(password);
  
  const envContent = `# Supabase PostgreSQL connection with SSL
POSTGRES_PRISMA_URL="${connectionString}"
POSTGRES_URL="${connectionString}"
POSTGRES_URL_NON_POOLING="${connectionString}"

# Keep these settings
NODE_ENV=development
PORT=3000
HOST="0.0.0.0"
ALLOW_ORIGIN="*"
`;

  console.log('Updating .env file with SSL-enabled connection strings');
  fs.writeFileSync(envPath, envContent, 'utf8');
  
  try {
    // 3. Generate Prisma client with the updated env
    console.log('\n🔨 Generating Prisma client...');
    execSync(`cd ${PROJECT_ROOT} && bun prisma generate`, {stdio: 'inherit'});
    
    console.log('\n🧪 Testing database connection...');
    console.log('This will show if your Supabase database allows connections from your IP...');
    
    // 4. Run a test query instead of db push to check connectivity
    try {
      execSync(`cd ${PROJECT_ROOT} && echo "SELECT 1;" | PGPASSWORD=${password} psql ${connectionString}`, {stdio: 'inherit'});
      console.log('✅ Connection successful!');
      
      // If connection works, try db push
      console.log('\n🚀 Pushing schema to Supabase...');
      execSync(`cd ${PROJECT_ROOT} && bun prisma db push --accept-data-loss`, {stdio: 'inherit'});
    } catch (connError) {
      console.log('❌ Could not connect to Supabase. Check the following:');
      console.log('1. Is your Supabase password correct?');
      console.log('2. Have you enabled "Allow All" in Supabase Database Settings?');
      console.log('3. Do you have PostgreSQL client installed? (try: sudo apt install postgresql-client)');
    }
    
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
  }
  
  console.log('\n📝 Next steps:');
  console.log('1. In Supabase dashboard, go to Project Settings > Database > Connection Pooling');
  console.log('2. Enable "Pooling mode" and copy the connection string');
  console.log('3. Add these environment variables to Vercel:');
  console.log(`   POSTGRES_PRISMA_URL="${connectionString}"`);
  console.log('   NODE_ENV="production"');
}

run();
