import fs from 'fs';

// Path to .env file
const envPath = '/media/giddel/SAMMY/codeBase/QRAttendance/.env';

// Read current .env file
const currentEnv = fs.readFileSync(envPath, 'utf8');

// Create updated connection strings with the correct password and sslmode=require
const updatedEnv = `# Database connection - Supabase PostgreSQL with SSL
POSTGRES_PRISMA_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require&pgbouncer=true"
POSTGRES_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require"
POSTGRES_URL_NON_POOLING="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require"

# Keep existing settings
NODE_ENV="development"
PORT=3000
HOST="0.0.0.0"
ALLOW_ORIGIN="*"
`;

// Write updated .env file
fs.writeFileSync(envPath, updatedEnv, 'utf8');
console.log('✅ Updated connection strings in .env file with correct password and SSL mode');
