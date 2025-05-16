import fs from 'fs';
import path from 'path';

const projectRoot = '/media/giddel/SAMMY/codeBase/QRAttendance';

// Update schema.prisma for Vercel deployment
const schemaPath = path.join(projectRoot, 'prisma/schema.prisma');
const schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("DATABASE_URL")
}

// ...existing code...`;

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('✅ Updated schema.prisma for Vercel deployment');

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
console.log('✅ Created vercel.json configuration');

console.log('\n🚀 Deployment preparation complete!');
console.log('\nVercel Environment Variables:');
console.log('POSTGRES_PRISMA_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require&pgbouncer=true"');
console.log('DATABASE_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require"');
console.log('NODE_ENV="production"');