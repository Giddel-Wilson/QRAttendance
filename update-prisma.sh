#!/bin/bash

echo "Updating Prisma schema and regenerating client..."

cd /home/giddel/Documents/codeBase/departmentalAttendance

# Generate Prisma client with updated schema
bun prisma generate

echo "Prisma client updated! Now restart your application with: bun --hot run dev"
