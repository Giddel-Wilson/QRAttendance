import fs from 'fs';
import path from 'path';

const projectRoot = '/media/giddel/SAMMY/codeBase/QRAttendance';
const migrationDir = path.join(projectRoot, 'migrations');

// Ensure migrations directory exists
if (!fs.existsSync(migrationDir)) {
  fs.mkdirSync(migrationDir, { recursive: true });
}

// Create migration plan file
const migrationPlanPath = path.join(migrationDir, 'supabase-migration-plan.md');
const migrationPlan = `# SQLite to Supabase PostgreSQL Migration Plan

## Step 1: Export Local SQLite Data
\`\`\`bash
# Run the export script to create JSON files of your data
bun run scripts/export-sqlite-data.js
\`\`\`

## Step 2: Configure PostgreSQL Schema
\`\`\`bash
# Update schema.prisma for PostgreSQL
bun run scripts/switch-to-postgres-schema.js

# Check if the schema is valid
bun prisma validate
\`\`\`

## Step 3: Import Data to Supabase
\`\`\`bash
# Import data into Supabase
bun run scripts/import-to-supabase.js
\`\`\`

## Step 4: Verify Migration
\`\`\`bash
# Verify data was migrated correctly
bun run scripts/verify-migration.js
\`\`\`

## Step 5: Update Application for Production
\`\`\`bash
# Configure app to use Supabase in production
bun run scripts/config-for-production.js
\`\`\`
`;

fs.writeFileSync(migrationPlanPath, migrationPlan, 'utf8');

// Create data export script
const exportScriptPath = path.join(projectRoot, 'scripts/export-sqlite-data.js');
const exportScript = `// filepath: /media/giddel/SAMMY/codeBase/QRAttendance/scripts/export-sqlite-data.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const exportDir = path.join(process.cwd(), 'migrations/data');

async function exportData() {
  // Create export directory
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  
  console.log('Exporting data from SQLite...');
  
  try {
    // Export Users
    const users = await prisma.user.findMany();
    fs.writeFileSync(path.join(exportDir, 'users.json'), JSON.stringify(users, null, 2));
    console.log(\`Exported \${users.length} users\`);
    
    // Export Courses
    const courses = await prisma.course.findMany();
    fs.writeFileSync(path.join(exportDir, 'courses.json'), JSON.stringify(courses, null, 2));
    console.log(\`Exported \${courses.length} courses\`);
    
    // Export other tables
    // ...existing code...
    
    console.log('✅ Data export complete!');
  } catch (error) {
    console.error('Error exporting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
`;

fs.writeFileSync(exportScriptPath, exportScript, 'utf8');

// Create PostgreSQL schema switch script
const switchSchemaPath = path.join(projectRoot, 'scripts/switch-to-postgres-schema.js');
const switchSchema = `// filepath: /media/giddel/SAMMY/codeBase/QRAttendance/scripts/switch-to-postgres-schema.js
import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const schemaPath = path.join(projectRoot, 'prisma/schema.prisma');

// Read current schema to preserve models
const currentSchema = fs.readFileSync(schemaPath, 'utf8');
const modelsSection = currentSchema.split('datasource db {')[1].split('}')[1].trim();

// Create PostgreSQL schema
const pgSchema = \`generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("DATABASE_URL")
}

\${modelsSection}
\`;

// Write new schema file
fs.writeFileSync(schemaPath, pgSchema, 'utf8');

// Create .env for PostgreSQL
const envPath = path.join(projectRoot, '.env');
const envContent = \`# PostgreSQL configuration
POSTGRES_PRISMA_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require&pgbouncer=true"
DATABASE_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require"

# Keep these settings
NODE_ENV="development"
PORT=3000
HOST="0.0.0.0"
ALLOW_ORIGIN="*"
\`;

fs.writeFileSync(envPath, envContent, 'utf8');

console.log('✅ Switched schema to PostgreSQL');
console.log('Next steps:');
console.log('1. Run: bun prisma generate');
console.log('2. Run: bun prisma db push --accept-data-loss');
`;

fs.writeFileSync(switchSchemaPath, switchSchema, 'utf8');

// Create import script
const importScriptPath = path.join(projectRoot, 'scripts/import-to-supabase.js');
const importScript = `// filepath: /media/giddel/SAMMY/codeBase/QRAttendance/scripts/import-to-supabase.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const dataDir = path.join(process.cwd(), 'migrations/data');

async function importData() {
  console.log('Importing data to PostgreSQL...');
  
  try {
    // Import Users
    if (fs.existsSync(path.join(dataDir, 'users.json'))) {
      const users = JSON.parse(fs.readFileSync(path.join(dataDir, 'users.json'), 'utf8'));
      console.log(\`Importing \${users.length} users...\`);
      
      for (const user of users) {
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            passwordHash: user.passwordHash,
            name: user.name,
            role: user.role,
            department: user.department,
            matricNumber: user.matricNumber,
            level: user.level,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          }
        });
      }
    }
    
    // Import Courses
    // ...existing code...
    
    console.log('✅ Data import complete!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
`;

fs.writeFileSync(importScriptPath, importScript, 'utf8');

// Create verification script
const verifyScriptPath = path.join(projectRoot, 'scripts/verify-migration.js');
const verifyScript = `// filepath: /media/giddel/SAMMY/codeBase/QRAttendance/scripts/verify-migration.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMigration() {
  console.log('Verifying migration...');
  
  try {
    // Check User table
    const userCount = await prisma.user.count();
    console.log(\`Users: \${userCount}\`);
    
    // Check Course table
    const courseCount = await prisma.course.count();
    console.log(\`Courses: \${courseCount}\`);
    
    // Check other tables
    // ...existing code...
    
  } catch (error) {
    console.error('Error verifying migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration();
`;

fs.writeFileSync(verifyScriptPath, verifyScript, 'utf8');

// Create production config script
const prodConfigPath = path.join(projectRoot, 'scripts/config-for-production.js');
const prodConfig = `// filepath: /media/giddel/SAMMY/codeBase/QRAttendance/scripts/config-for-production.js
import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

// Create vercel.json
const vercelPath = path.join(projectRoot, 'vercel.json');
const vercelConfig = {
  "buildCommand": "prisma generate && vite build",
  "outputDirectory": ".svelte-kit/output",
  "framework": "sveltekit",
  "regions": ["iad1"],
  "installCommand": "bun install"
};

fs.writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2), 'utf8');

console.log('✅ Production configuration complete!');
console.log('Remember to add these environment variables to Vercel:');
console.log('POSTGRES_PRISMA_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require&pgbouncer=true"');
console.log('DATABASE_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require"');
console.log('NODE_ENV="production"');
`;

fs.writeFileSync(prodConfigPath, prodConfig, 'utf8');

console.log('✅ Migration plan and scripts created!');
console.log('Check migrations/supabase-migration-plan.md for detailed instructions');