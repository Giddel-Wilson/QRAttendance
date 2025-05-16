# QR Attendance System Deployment Guide

This guide will help you switch between local development and production deployment.

## Local Development (SQLite)

Use this for local development:

```bash
# Switch to SQLite
bun run scripts/dev-mode.js

# Start development server
bun run dev
```

## Deployment to Vercel (PostgreSQL)

When you're ready to deploy:

```bash
# Switch to PostgreSQL configuration
bun run scripts/deploy-mode.js

# Commit your changes
git add .
git commit -m "Prepare for deployment"
git push
```

### Vercel Setup

1. Connect your GitHub repository to Vercel
2. Add these environment variables:
   - `POSTGRES_PRISMA_URL`: postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require&pgbouncer=true
   - `DATABASE_URL`: postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require
   - `NODE_ENV`: production
3. Deploy

## How It Works

- Local development uses SQLite (file-based database)
- Production uses Supabase PostgreSQL
- Both use the same Prisma models but different database providers
- The first deployment will create all tables in Supabase automatically
