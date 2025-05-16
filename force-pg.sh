#!/bin/bash

# Stop on errors
set -e

echo "===== PostgreSQL Force Deployment ====="

# Step 1: Force writing the schema file with PostgreSQL
echo "Step 1: Writing complete PostgreSQL schema..."
bun run scripts/force-pg-schema.js

# Display current .env content (hiding password)
echo "Current .env file contains:"
grep -v PASSWORD .env | grep -v password

# Step 2: Make sure password is set
echo ""
echo "Step 2: If your POSTGRES_PRISMA_URL in .env doesn't have the real password, please edit it now."
read -p "Press Enter when ready to continue..."

# Step 3: Generate client
echo "Step 3: Generating Prisma client..."
POSTGRES_PRISMA_URL=$(grep POSTGRES_PRISMA_URL .env | cut -d '=' -f2- | tr -d '"')
export POSTGRES_PRISMA_URL
bun prisma generate

# Step 4: Push schema
echo "Step 4: Pushing schema to database..."
bun prisma db push --accept-data-loss

echo "===== DEPLOYMENT COMPLETE ====="
echo "Make sure to add these environment variables in Vercel:"
echo "POSTGRES_PRISMA_URL"
echo "NODE_ENV=production"
