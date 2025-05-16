import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// Configuration
const PROJECT_ROOT = '/media/giddel/SAMMY/codeBase/QRAttendance';
const SCHEMA_PATH = path.join(PROJECT_ROOT, 'prisma/schema.prisma');

// Function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (e) {
    return false;
  }
}

function run() {
  console.log('🔍 PostgreSQL Deployment Tool');
  
  // 1. Check if prisma directory exists
  const prismaDir = path.join(PROJECT_ROOT, 'prisma');
  if (!fileExists(prismaDir)) {
    console.log('Creating prisma directory...');
    fs.mkdirSync(prismaDir, { recursive: true });
  }

  // 2. Write the PostgreSQL schema
  const pgSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
}

// ... existing code for your models ...`;

  console.log('Writing PostgreSQL schema to:', SCHEMA_PATH);
  fs.writeFileSync(SCHEMA_PATH, pgSchema, 'utf8');
  
  // 3. Verify the schema was written correctly
  const writtenSchema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  if (!writtenSchema.includes('provider = "postgresql"')) {
    console.error('❌ Failed to write PostgreSQL schema correctly!');
    process.exit(1);
  }
  console.log('✅ Schema written successfully with PostgreSQL provider');
  
  // 4. Create a temporary env file just for the generation and push commands
  const tempEnvPath = path.join(PROJECT_ROOT, '.pg-temp-env');
  const envContent = `POSTGRES_PRISMA_URL="postgresql://postgres:10.Flash.01@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres"`;
  
  console.log('Creating temporary env file for Prisma commands');
  fs.writeFileSync(tempEnvPath, envContent, 'utf8');
  
  try {
    // 5. Generate Prisma client with the temporary env file
    console.log('\n🔨 Generating Prisma client...');
    execSync(`cd ${PROJECT_ROOT} && POSTGRES_PRISMA_URL="postgresql://postgres:10.Flash.01@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres" bun prisma generate --schema=${SCHEMA_PATH}`, {stdio: 'inherit'});
    
    // 6. Push schema with the temporary env file
    console.log('\n🚀 Pushing schema to PostgreSQL database...');
    execSync(`cd ${PROJECT_ROOT} && POSTGRES_PRISMA_URL="postgresql://postgres:10.Flash.01@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres" bun prisma db push --schema=${SCHEMA_PATH} --accept-data-loss`, {stdio: 'inherit'});
    
    console.log('\n✅ PostgreSQL setup completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during Prisma commands:', error.message);
  } finally {
    // Clean up temporary env file
    if (fileExists(tempEnvPath)) {
      fs.unlinkSync(tempEnvPath);
    }
  }
  
  console.log('\n📝 Next steps:');
  console.log('1. Add these environment variables to Vercel:');
  console.log('   POSTGRES_PRISMA_URL="postgresql://postgres:10.Flash.01@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres"');
  console.log('   NODE_ENV="production"');
  console.log('2. Deploy your app to Vercel');
}

run();
