import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// Absolute path to ensure we're editing the right file
const schemaPath = '/media/giddel/SAMMY/codeBase/QRAttendance/prisma/schema.prisma';

// Create directory if it doesn't exist
const prismaDir = path.dirname(schemaPath);
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
  console.log(`Created directory: ${prismaDir}`);
}

// Write the correct schema file content
const schemaContent = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
}

// Test with a simple model first
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  createdAt DateTime @default(now())
}`;

// Step 1: Write schema file
console.log(`Writing schema to: ${schemaPath}`);
fs.writeFileSync(schemaPath, schemaContent, 'utf8');

// Step 2: Verify schema was correctly written
const written = fs.readFileSync(schemaPath, 'utf8');
console.log('\nSchema file content:');
console.log('-------------------');
console.log(written);
console.log('-------------------');

// Step 3: Create a temporary .env file with the correct POSTGRES_PRISMA_URL
const envPath = '/media/giddel/SAMMY/codeBase/QRAttendance/.env';
const envContent = `POSTGRES_PRISMA_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require"
NODE_ENV="development"`;

console.log(`Writing environment variables to: ${envPath}`);
fs.writeFileSync(envPath, envContent, 'utf8');

// Step 4: Generate Prisma client
try {
  console.log('\nGenerating Prisma client...');
  execSync('cd /media/giddel/SAMMY/codeBase/QRAttendance && bun prisma generate', {
    stdio: 'inherit',
    env: { 
      ...process.env,
      POSTGRES_PRISMA_URL: "postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require"
    }
  });

  // Step 5: Try pushing the schema
  console.log('\nPushing schema to database...');
  execSync('cd /media/giddel/SAMMY/codeBase/QRAttendance && bun prisma db push --accept-data-loss', {
    stdio: 'inherit',
    env: { 
      ...process.env, 
      POSTGRES_PRISMA_URL: "postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require"
    }
  });
} catch (error) {
  console.error('\nError executing Prisma commands:', error.message);
}

console.log('\nVercel Environment Variables:');
console.log('POSTGRES_PRISMA_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require&pgbouncer=true"');
console.log('POSTGRES_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require"');
console.log('NODE_ENV="production"');
