# Vercel Deployment Instructions

## 1. Push your code to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

## 2. Set up Vercel deployment
1. Go to Vercel and create a new project from your GitHub repository
2. In "Environment Variables", add:

```
POSTGRES_PRISMA_URL=postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require&pgbouncer=true
DATABASE_URL=postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require
NODE_ENV=production
```

3. Click "Deploy"

## 3. After deployment
- Your application should automatically connect to Supabase
- The database schema will be created during first deployment
- You'll need to set up initial admin user through the app
