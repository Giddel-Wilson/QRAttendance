#!/bin/bash

# Stop on errors
set -e

echo "===== PostgreSQL Deployment Helper ====="

# Step 1: Fix the schema and env file
echo "Step 1: Creating PostgreSQL schema..."
bun run scripts/fix-schema.js

# Step 2: Edit the password
echo "Step 2: Please edit your .env file NOW to set your real password"
echo "Press Enter when you've updated the .env file..."
read -p ""

# Step 3: Generate client
echo "Step 3: Generating Prisma client..."
bun prisma generate

# Step 4: Push schema
echo "Step 4: Pushing schema to database..."
bun prisma db push --accept-data-loss

echo "===== DEPLOYMENT COMPLETE ====="
echo "Make sure to add these environment variables in Vercel:"
echo "POSTGRES_PRISMA_URL"
echo "POSTGRES_URL"
echo "POSTGRES_URL_NON_POOLING"
echo "NODE_ENV=production"
