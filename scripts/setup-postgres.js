import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Make sure we're working with absolute paths to avoid cwd issues
const PROJECT_ROOT = '/media/giddel/SAMMY/codeBase/QRAttendance';
const SCHEMA_PATH = path.join(PROJECT_ROOT, 'prisma/schema.prisma');

async function setupPostgres() {
  try {
    console.log('Setting up PostgreSQL database...');
    
    // 1. Update schema.prisma file
    const schemaContent = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
}

// Rest of your schema remains the same
model User {
  id String @id @default(uuid())
  email String @unique
  passwordHash String
  name String?
  role String @default("STUDENT")
  department String?
  matricNumber String?
  level String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  taughtCourses CourseLecturer[]
  attendances Attendance[] @relation("UserToAttendance")
  enrolledCourses StudentCourse[]
  createdNotifications Notification[] @relation("UserToNotifications")
  userNotifications UserNotification[] @relation("UserToUserNotifications")
}

// ...existing code...`;

    // Ensure the prisma directory exists
    const prismaDir = path.join(PROJECT_ROOT, 'prisma');
    if (!fs.existsSync(prismaDir)) {
      fs.mkdirSync(prismaDir, { recursive: true });
    }

    // Write the updated schema
    fs.writeFileSync(SCHEMA_PATH, schemaContent, 'utf8');
    console.log('Updated schema.prisma with PostgreSQL configuration');
    
    // 2. Generate Prisma client using Bun
    console.log('Generating Prisma client...');
    await execAsync('cd ' + PROJECT_ROOT + ' && bun prisma generate');
    console.log('Prisma client generated successfully');
    
    // 3. Push schema to database
    console.log('Pushing schema to PostgreSQL...');
    await execAsync('cd ' + PROJECT_ROOT + ' && bun prisma db push --accept-data-loss');
    console.log('Schema pushed to database successfully');
    
    console.log('✅ PostgreSQL setup complete!');
  } catch (error) {
    console.error('Error setting up PostgreSQL:', error);
  }
}

setupPostgres();