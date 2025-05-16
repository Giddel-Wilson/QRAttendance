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

// Create deployment README
const readmePath = path.join(projectRoot, 'VERCEL_DEPLOY.md');
const readmeContent = `# Vercel Deployment Instructions

## 1. Push your code to GitHub
\`\`\`bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
\`\`\`

## 2. Set up Vercel deployment
1. Go to Vercel and create a new project from your GitHub repository
2. In "Environment Variables", add:

\`\`\`
POSTGRES_PRISMA_URL=postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require&pgbouncer=true
DATABASE_URL=postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require
NODE_ENV=production
\`\`\`

3. Click "Deploy"

## 3. After deployment
- Your application should automatically connect to Supabase
- The database schema will be created during first deployment
- You'll need to set up initial admin user through the app
`;

fs.writeFileSync(readmePath, readmeContent, 'utf8');
console.log('✅ Created VERCEL_DEPLOY.md with instructions');

console.log('\n🚀 Deployment preparation complete!');
console.log('Follow the instructions in VERCEL_DEPLOY.md to deploy your application');