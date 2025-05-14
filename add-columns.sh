#!/bin/bash

echo "Updating Prisma schema and adding columns permanently..."

cd /home/giddel/Documents/codeBase/departmentalAttendance

# Try to run SQLite commands directly
echo "ALTER TABLE \"User\" ADD COLUMN \"matricNumber\" TEXT;
ALTER TABLE \"User\" ADD COLUMN \"level\" TEXT;" | sqlite3 ./dev.db || echo "Failed to modify directly. Please run in SQLiteBrowser."

# Generate Prisma client with the updated schema
bun prisma generate

echo "Changes applied. Restart your app for the changes to take effect."
