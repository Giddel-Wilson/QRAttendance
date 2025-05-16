import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// Project root
const projectRoot = '/media/giddel/SAMMY/codeBase/QRAttendance';
const mainSchemaPath = path.join(projectRoot, 'prisma/schema.prisma');

// Step 1: Find all schema.prisma files in the project
console.log('🔍 Searching for all schema.prisma files...');
try {
  const findResult = execSync(`find ${projectRoot} -name "schema.prisma"`, { encoding: 'utf8' });
  const schemaFiles = findResult.split('\n').filter(Boolean);
  
  console.log(`Found ${schemaFiles.length} schema files:`);
  schemaFiles.forEach(file => console.log(`- ${file}`));
  
  // Step 2: Update ALL schema files to use PostgreSQL
  console.log('\n✍️ Updating all schema files to use PostgreSQL...');
  const pgSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
}

// Simple model for testing
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  createdAt DateTime @default(now())
}`;

  schemaFiles.forEach(file => {
    fs.writeFileSync(file, pgSchema, 'utf8');
    console.log(`Updated: ${file}`);
  });
  
  // Step 3: Clear Prisma cache
  console.log('\n🧹 Clearing Prisma cache...');
  const prismaCache = path.join(projectRoot, 'node_modules/.prisma');
  if (fs.existsSync(prismaCache)) {
    execSync(`rm -rf ${prismaCache}`);
    console.log('Prisma cache cleared');
  }
  
  // Step 4: Update or create .env file with correct variables
  const envPath = path.join(projectRoot, '.env');
  const envContent = `POSTGRES_PRISMA_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require"
DATABASE_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require"
NODE_ENV="development"`;

  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('\n✅ Updated .env file with both POSTGRES_PRISMA_URL and DATABASE_URL');
  
  // Step 5: Generate Prisma client with explicit schema path
  console.log('\n🔄 Generating Prisma client with explicit schema path...');
  execSync(`cd ${projectRoot} && POSTGRES_PRISMA_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require" DATABASE_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require" bun prisma generate --schema=${mainSchemaPath}`, 
    { stdio: 'inherit' });
  
  // Step 6: Push schema with explicit schema path
  console.log('\n🚀 Pushing schema to database with explicit schema path...');
  execSync(`cd ${projectRoot} && POSTGRES_PRISMA_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require" DATABASE_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require" bun prisma db push --schema=${mainSchemaPath} --accept-data-loss`, 
    { stdio: 'inherit' });
    
} catch (error) {
  console.error('\n❌ Error:', error.message);
}

console.log('\n📝 Vercel Environment Variables (add these to your project settings):');
console.log('POSTGRES_PRISMA_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require&pgbouncer=true"');
console.log('DATABASE_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require"');
console.log('NODE_ENV="production"');
