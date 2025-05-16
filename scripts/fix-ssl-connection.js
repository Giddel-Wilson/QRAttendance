import fs from 'fs';
import path from 'path';

// Project root
const projectRoot = '/media/giddel/SAMMY/codeBase/QRAttendance';
const envPath = path.join(projectRoot, '.env');

// Update .env with more specific SSL parameters
const envContent = `# Supabase PostgreSQL connection with explicit SSL parameters
POSTGRES_PRISMA_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require&connect_timeout=30"
DATABASE_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require&connect_timeout=30"
NODE_ENV="development"

# Keep these settings
PORT=3000
HOST="0.0.0.0"
ALLOW_ORIGIN="*"`;

// Write updated .env file
fs.writeFileSync(envPath, envContent, 'utf8');
console.log('✅ Updated .env file with more specific SSL connection parameters');

// Create a deployment version of schema.prisma specifically for Vercel
const deploymentSchemaPath = path.join(projectRoot, 'prisma/schema.deployment.prisma');
const deploymentSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("DATABASE_URL")
}

// Simple model for deployment
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  createdAt DateTime @default(now())
}`;

fs.writeFileSync(deploymentSchemaPath, deploymentSchema, 'utf8');
console.log('✅ Created deployment schema file for Vercel');

console.log('\n📝 Instructions for deployment:');
console.log('1. Install the pg package: bun add pg');
console.log('2. Test direct connection: bun run scripts/test-pg-connection.js');
console.log('3. If direct connection works but Prisma doesn\'t:');
console.log('   - Deploy to Vercel using the environment variables below');
console.log('   - Vercel\'s environment should have better connectivity to Supabase');
console.log('\n🔍 Vercel environment variables:');
console.log('POSTGRES_PRISMA_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require&pgbouncer=true"');
console.log('DATABASE_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require"');
console.log('NODE_ENV="production"');
