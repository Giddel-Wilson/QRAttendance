#!/bin/bash

# Create prisma directory if it doesn't exist
mkdir -p /home/giddel/Documents/codeBase/departmentalAttendance/prisma

# Create a brand new schema file directly in the right location
cat > /home/giddel/Documents/codeBase/departmentalAttendance/prisma/schema.prisma << 'EOF'
datasource db {
  provider = "postgresql"
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

# Verify the file was created
if [ -f /home/giddel/Documents/codeBase/departmentalAttendance/prisma/schema.prisma ]; then
  echo "Schema file created successfully!"
  cat /home/giddel/Documents/codeBase/departmentalAttendance/prisma/schema.prisma
else
  echo "Failed to create schema file!"
fi
