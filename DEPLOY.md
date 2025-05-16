# Vercel Deployment Instructions

Since local connection to Supabase isn't working, follow these steps to deploy to Vercel:

## 1. Push your changes to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment with PostgreSQL"
git push
```

## 2. In Vercel, add these environment variables:

- `POSTGRES_PRISMA_URL`: postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require&pgbouncer=true
- `DATABASE_URL`: postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require
- `NODE_ENV`: production

## 3. Deploy your application

Your application should connect to Supabase PostgreSQL successfully from Vercel's environment even though local connection isn't working.

## Why this works

1. Vercel's serverless environment has outbound access to Supabase
2. The `POSTGRES_PRISMA_URL` with pgbouncer is optimized for serverless
3. Your schema.prisma is properly configured for PostgreSQL
