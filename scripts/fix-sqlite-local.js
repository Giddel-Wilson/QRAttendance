import fs from 'fs';
import path from 'path';

const projectRoot = '/media/giddel/SAMMY/codeBase/QRAttendance';

// Step 1: Fix the schema.prisma file for local development with SQLite
const schemaPath = path.join(projectRoot, 'prisma/schema.prisma');
const sqliteSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ...existing code...`;

fs.writeFileSync(schemaPath, sqliteSchema, 'utf8');

// Step 2: Update .env file for SQLite
const envPath = path.join(projectRoot, '.env');
const envContent = `# Local SQLite configuration
DATABASE_URL="file:./dev.db"

# Keep these settings
NODE_ENV="development"
PORT=3000
HOST="0.0.0.0"
ALLOW_ORIGIN="*"

# PostgreSQL configuration for future migration
# POSTGRES_PRISMA_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require&pgbouncer=true"
# DATABASE_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require"
`;

fs.writeFileSync(envPath, envContent, 'utf8');

console.log('✅ Fixed local SQLite configuration');
console.log('Now regenerate the Prisma client:');
console.log('bun prisma generate');