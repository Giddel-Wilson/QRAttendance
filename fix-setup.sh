#!/bin/bash
set -e

echo "Setting up SQLite database correctly..."

# Make sure we're in the right directory
cd /home/giddel/Documents/codeBase/departmentalAttendance

# Make sure prisma folder exists
mkdir -p prisma

# Write schema directly to a file instead of using cat redirection
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

# Make sure the file exists and has content
echo "Checking schema file..."
if [ -s prisma/schema.prisma ]; then
  echo "Schema file created successfully!"
  cat prisma/schema.prisma | head -5
else
  echo "Failed to create schema file!"
  exit 1
fi

# Setup .env file with simple path
echo 'DATABASE_URL="file:./dev.db"' > .env

echo "Running Prisma commands..."
# Generate prisma client
bun prisma generate

# Run migrations
bun prisma migrate dev --name fresh_start --schema=./prisma/schema.prisma

echo "Setup complete! Your database is ready."
