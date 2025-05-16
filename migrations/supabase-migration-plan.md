# SQLite to Supabase PostgreSQL Migration Plan

## Step 1: Export Local SQLite Data
```bash
# Run the export script to create JSON files of your data
bun run scripts/export-sqlite-data.js
```

## Step 2: Configure PostgreSQL Schema
```bash
# Update schema.prisma for PostgreSQL
bun run scripts/switch-to-postgres-schema.js

# Check if the schema is valid
bun prisma validate
```

## Step 3: Import Data to Supabase
```bash
# Import data into Supabase
bun run scripts/import-to-supabase.js
```

## Step 4: Verify Migration
```bash
# Verify data was migrated correctly
bun run scripts/verify-migration.js
```

## Step 5: Update Application for Production
```bash
# Configure app to use Supabase in production
bun run scripts/config-for-production.js
```
