// filepath: /media/giddel/SAMMY/codeBase/QRAttendance/scripts/config-for-production.js
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
