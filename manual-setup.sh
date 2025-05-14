#!/bin/bash

# Make sure we're in the right directory
cd /home/giddel/Documents/codeBase/departmentalAttendance

echo "Creating schema file manually..."

# Create the prisma directory
mkdir -p prisma

# Write the schema file directly with correct indentation
echo 'datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String?
  role         String   @default("STUDENT") 
  department   String?
  courses      Course[]
}

model Course {
  id          String  @id @default(uuid())
  code        String  @unique
  name        String
  description String?
  department  String?
  semester    String? @default("FIRST")
  lecturerId  String?
  lecturer    User?   @relation(fields: [lecturerId], references: [id])
}' > prisma/schema.prisma

# Verify schema content
echo "Verifying schema content..."
cat prisma/schema.prisma
echo "-----------------------------------"

# Create a proper .env file
echo 'DATABASE_URL="file:./dev.db"' > .env

# Actually create a minimal SQLite database file manually
echo "Creating SQLite database file..."
touch dev.db

# Don't run Prisma commands yet - let's check the schema file first
echo "Schema file created. Please verify it contains the datasource block shown above."
echo "Then run: bun prisma generate"
