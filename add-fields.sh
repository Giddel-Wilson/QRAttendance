#!/bin/bash

# Apply schema changes to Prisma
cd /home/giddel/Documents/codeBase/departmentalAttendance

# Generate client with updated schema
bun prisma generate

echo "Prisma client updated with matricNumber and level fields!"

# Don't try to migrate - use SQL Lite Browser to keep the data
echo "Your database already has these fields, so we don't need to run a migration."
echo "Use SQLite Browser to view and edit these fields directly."
