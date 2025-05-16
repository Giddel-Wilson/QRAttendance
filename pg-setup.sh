#!/bin/bash

# Replace YOUR_PASSWORD below with your actual Supabase password
export POSTGRES_PRISMA_URL="postgresql://postgres:YOUR_PASSWORD@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres"
export POSTGRES_URL="$POSTGRES_PRISMA_URL"

echo "Step 1: Fixing schema..."
bun run scripts/fix-schema.js

echo "Step 2: Generating Prisma client..."
bun prisma generate

echo "Step 3: Pushing schema to database..."
bun prisma db push --accept-data-loss

echo "Done!"
