#!/bin/bash

cd /home/giddel/Documents/codeBase/departmentalAttendance

# Remove bcrypt since it's causing issues with Bun
bun remove bcrypt

# Add crypto (if needed, though it's built into Node.js)
echo "Updating dependencies..."
bun install 

# Restart the application
echo "Run your app with: bun --hot run dev"
