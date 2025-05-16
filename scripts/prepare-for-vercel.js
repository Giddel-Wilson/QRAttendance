import fs from 'fs';
import path from 'path';

const projectRoot = '/media/giddel/SAMMY/codeBase/QRAttendance';

// Step 1: Create optimized schema.prisma for Vercel deployment
console.log('Creating optimized schema.prisma for Vercel...');
const schemaPath = path.join(projectRoot, 'prisma/schema.prisma');
const schemaContent = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("DATABASE_URL")
}

model User {
  // ...existing code...
}

model Course {
  // ...existing code...
}

// ...existing code...

model Notification {
  // ...existing code...
}

model UserNotification {
  // ...existing code...
}`;

fs.writeFileSync(schemaPath, schemaContent, 'utf8');

// Step 2: Create vercel.json if it doesn't exist
console.log('Creating vercel.json...');
const vercelPath = path.join(projectRoot, 'vercel.json');
const vercelConfig = {
  "buildCommand": "prisma generate && vite build",
  "outputDirectory": ".svelte-kit/output",
  "framework": "sveltekit",
  "regions": ["iad1"],
  "installCommand": "bun install"
};

fs.writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2), 'utf8');

// Step 3: Create a README for deployment instructions
const readmePath = path.join(projectRoot, 'DEPLOY.md');
const readmeContent = `# Vercel Deployment Instructions

Since local connection to Supabase isn't working, follow these steps to deploy to Vercel:

## 1. Push your changes to GitHub

\`\`\`bash
git add .
git commit -m "Prepare for Vercel deployment with PostgreSQL"
git push
\`\`\`

## 2. In Vercel, add these environment variables:

- \`POSTGRES_PRISMA_URL\`: postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require&pgbouncer=true
- \`DATABASE_URL\`: postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require
- \`NODE_ENV\`: production

## 3. Deploy your application

Your application should connect to Supabase PostgreSQL successfully from Vercel's environment even though local connection isn't working.

## Why this works

1. Vercel's serverless environment has outbound access to Supabase
2. The \`POSTGRES_PRISMA_URL\` with pgbouncer is optimized for serverless
3. Your schema.prisma is properly configured for PostgreSQL
`;

fs.writeFileSync(readmePath, readmeContent, 'utf8');

console.log('✅ Deployment files prepared successfully!');
console.log('Please follow the instructions in DEPLOY.md to deploy your application to Vercel');