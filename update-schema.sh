#!/bin/bash

# Run migration to add new fields
cd /home/giddel/Documents/codeBase/departmentalAttendance
bun prisma migrate dev --name add_matric_and_level

echo "Database schema updated with matricNumber and level fields!"
