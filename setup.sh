#!/bin/bash
set -e

echo "Setting up SQLite database..."

# Make sure prisma folder exists
mkdir -p prisma

# Create proper schema file
cat > prisma/schema.prisma << 'EOF'
datasource db {
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
}
EOF

# Setup .env file
echo 'DATABASE_URL="file:./dev.db"' > .env

# Generate prisma client
bun prisma generate

# Run migrations
bun prisma migrate dev --name fresh_start

# Install SQLiteBrowser if needed
command -v sqlitebrowser >/dev/null 2>&1 || {
  echo "Installing SQLiteBrowser..."
  sudo apt-get update && sudo apt-get install -y sqlitebrowser
}

echo "Setup complete! You can view your database with: sqlitebrowser ./dev.db"
