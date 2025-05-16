import fs from 'fs';

// Path to schema file
const schemaPath = '/media/giddel/SAMMY/codeBase/QRAttendance/prisma/schema.prisma';

try {
  console.log('Creating new schema file with PostgreSQL configuration...');
  
  // Read the current schema to preserve most of its content
  let currentSchema = fs.readFileSync(schemaPath, 'utf8');
  
  // Extract everything after the datasource block
  const modelsPart = currentSchema.split('datasource db {')[1].split('}')[1];
  
  // Create new schema content with PostgreSQL configuration
  const newSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
}
${modelsPart}`;
  
  // Write the new schema
  fs.writeFileSync(schemaPath, newSchema, 'utf8');
  
  // Create/update .env file with proper PostgreSQL URL
  const envPath = '/media/giddel/SAMMY/codeBase/QRAttendance/.env';
  const envContent = `# PostgreSQL connection (fill in your password)
POSTGRES_PRISMA_URL="postgresql://postgres:YOUR_PASSWORD@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres"
POSTGRES_URL="postgresql://postgres:YOUR_PASSWORD@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres"
POSTGRES_URL_NON_POOLING="postgresql://postgres:YOUR_PASSWORD@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres"

# Keep these settings
NODE_ENV=development
PORT=3000
HOST="0.0.0.0"
ALLOW_ORIGIN="*"
`;

  fs.writeFileSync(envPath, envContent, 'utf8');
  
  console.log('Schema and .env files updated successfully');
  console.log('\nIMPORTANT: Edit your .env file to replace YOUR_PASSWORD with your actual database password');
} catch (error) {
  console.error('Error updating files:', error);
}
