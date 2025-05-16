# Deployment Instructions

Since you can't connect to Supabase PostgreSQL from your local environment, follow these steps to deploy successfully:

## Local Development

For local development, use SQLite:

```bash
# Switch to SQLite for local work
bun run scripts/use-sqlite-local.js
bun prisma generate
```

## Vercel Deployment

1. **Prepare for deployment**:
   ```bash
   bun run scripts/prepare-deployment.js
   ```

2. **Commit and push changes**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push
   ```

3. **Set up Vercel project**:
   - Create new project from your repository
   - Add these environment variables:
     - `POSTGRES_PRISMA_URL`: postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require&pgbouncer=true
     - `DATABASE_URL`: postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require
     - `NODE_ENV`: production
   - Deploy

4. **After deployment**:
   - The database schema will be created on first deployment
   - You'll need to create initial users through the app
   - Now your application should be able to connect to Supabase from Vercel's environment

## Why This Approach Works

The dual database approach lets you:
- Use SQLite locally for development
- Use PostgreSQL on Vercel for production
- Avoid connectivity issues between your local machine and Supabase
