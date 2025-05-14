#!/bin/bash

cd /home/giddel/Documents/codeBase/departmentalAttendance

# Regenerate Prisma client with updated schema
bun prisma generate

echo "Prisma client regenerated with updated schema"
