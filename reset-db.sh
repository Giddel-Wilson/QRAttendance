#!/bin/bash

echo "Resetting SQLite database..."

# Delete existing database file
rm -f /home/giddel/Documents/codeBase/departmentalAttendance/dev.db

# Create fresh database file
touch /home/giddel/Documents/codeBase/departmentalAttendance/dev.db

# Run migration
bun prisma migrate dev --name initial_schema --schema=./prisma/schema.prisma

echo "Database reset complete!"
