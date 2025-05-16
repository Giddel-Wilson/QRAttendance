#!/bin/bash

echo "===== Improved Supabase PostgreSQL Setup ====="

# Step 1: Update connection strings with correct password
echo "Step 1: Updating connection strings..."
bun run scripts/update-connection.js

# Step 2: Update schema.prisma FIRST
echo "Step 2: Updating Prisma schema..."
bun run scripts/fix-pg-schema.js

# Step 3: Verify schema before continuing
if grep -q "provider = \"postgresql\"" prisma/schema.prisma && grep -q "POSTGRES_PRISMA_URL" prisma/schema.prisma; then
  echo "✅ Schema file verified - contains PostgreSQL configuration"
else
  echo "❌ Schema file verification failed. Exiting."
  exit 1
fi

# Step 4: Generate Prisma client with the correct schema
echo "Step 4: Generating Prisma client..."
bun prisma generate

# Step 5: Now test connection with updated schema
echo "Step 5: Testing database connection..."
bun run scripts/test-connection.js

# Step 6: Push schema to database
echo "Step 6: Pushing schema to database..."
POSTGRES_PRISMA_URL="postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require" bun prisma db push --accept-data-loss

echo "===== Setup Complete ====="
echo ""
echo "For Vercel deployment, add these environment variables:"
echo "POSTGRES_PRISMA_URL=postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require&pgbouncer=true"
echo "POSTGRES_URL=postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require"
echo "POSTGRES_URL_NON_POOLING=postgresql://postgres:Njyd2znZan9ibwCF@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres?sslmode=require"
echo "NODE_ENV=production"
