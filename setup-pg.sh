#!/bin/bash

echo "===== Supabase PostgreSQL Setup ====="

# Step 1: Update connection strings with correct password
echo "Step 1: Updating connection strings..."
bun run scripts/update-connection.js

# Step 2: Test connection
echo "Step 2: Testing database connection..."
bun run scripts/test-connection.js

# Step 3: Update schema.prisma
echo "Step 3: Updating Prisma schema..."
bun run scripts/fix-pg-schema.js

# Step 4: Generate Prisma client
echo "Step 4: Generating Prisma client..."
bun prisma generate

# Step 5: Push schema to database
echo "Step 5: Pushing schema to database..."
bun prisma db push --accept-data-loss

echo "===== Setup Complete ====="
echo ""
echo "For Vercel deployment, add these environment variables:"
echo "POSTGRES_PRISMA_URL=postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require&pgbouncer=true"
echo "POSTGRES_URL=postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require"
echo "POSTGRES_URL_NON_POOLING=postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require"
echo "NODE_ENV=production"
