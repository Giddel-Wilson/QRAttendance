import fs from 'fs';
import path from 'path';

const projectRoot = '/media/giddel/SAMMY/codeBase/QRAttendance';

// Update schema.prisma for local SQLite
const schemaPath = path.join(projectRoot, 'prisma/schema.prisma');
const schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ...existing code...`;

fs.writeFileSync(schemaPath, schema, 'utf8');

// Update .env file
const envPath = path.join(projectRoot, '.env');
const envContent = `# Local development with SQLite
DATABASE_URL="file:./dev.db"

# Keep these settings
NODE_ENV="development"
PORT=3000
HOST="0.0.0.0"
ALLOW_ORIGIN="*"`;

fs.writeFileSync(envPath, envContent, 'utf8');

console.log('✅ Reverted to SQLite for local development');
console.log('Run: bun prisma generate');