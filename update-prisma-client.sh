#!/bin/bash

echo "Regenerating Prisma client with updated schema..."

cd /home/giddel/Documents/codeBase/departmentalAttendance

# Generate the Prisma client with the updated schema
bun prisma generate

echo "Prisma client regenerated successfully!"
echo "Restart your application for changes to take effect."
