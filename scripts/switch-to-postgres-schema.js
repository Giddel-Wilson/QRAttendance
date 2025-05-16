// filepath: /media/giddel/SAMMY/codeBase/QRAttendance/scripts/switch-to-postgres-schema.js
import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const schemaPath = path.join(projectRoot, 'prisma/schema.prisma');

// Read current schema to preserve models
const currentSchema = fs.readFileSync(schemaPath, 'utf8');
const modelsSection = currentSchema.split('datasource db {')[1].split('}')[1].trim();

// Create PostgreSQL schema
const pgSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("DATABASE_URL")
}

${modelsSection}
`;

// Write new schema file
fs.writeFileSync(schemaPath, pgSchema, 'utf8');

// Create .env for PostgreSQL
const envPath = path.join(projectRoot, '.env');
const envContent = `# PostgreSQL configuration
POSTGRES_PRISMA_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require&pgbouncer=true"
DATABASE_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require"

# Keep these settings
NODE_ENV="development"
PORT=3000
HOST="0.0.0.0"
ALLOW_ORIGIN="*"
`;

fs.writeFileSync(envPath, envContent, 'utf8');

console.log('✅ Switched schema to PostgreSQL');
console.log('Next steps:');
console.log('1. Run: bun prisma generate');
console.log('2. Run: bun prisma db push --accept-data-loss');
