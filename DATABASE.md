# QR Attendance System Database Setup

This guide covers both local development and production deployment.

## Local Development (SQLite)

To completely reset and fix your local environment:

```bash
# Run the force reset script
bun run scripts/force-reset.js

# Start the development server
bun run dev
```

This will:
1. Clear Prisma cache
2. Update all schema files to use SQLite
3. Configure .env file
4. Regenerate Prisma client
5. Create SQLite database tables

## Production Deployment (PostgreSQL on Supabase)

To prepare for deployment to Vercel:

```bash
# Run the Vercel setup script (after making local changes)
bun run scripts/vercel-setup.js

# Commit your changes
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

### Vercel Setup

1. Add these environment variables in your Vercel project settings:
   ```
   DATABASE_URL=postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require
   NODE_ENV=production
   ```

2. Deploy your project.

3. The first deployment will automatically create all tables in your Supabase PostgreSQL database.

## Why This Works

This setup uses two different databases:
- SQLite for local development
- PostgreSQL on Supabase for production

By having separate schema files and a custom build command, we avoid issues with trying to connect to Supabase from your local environment.
