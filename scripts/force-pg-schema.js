import fs from 'fs';

// Path to schema file
const schemaPath = '/media/giddel/SAMMY/codeBase/QRAttendance/prisma/schema.prisma';

// Create the complete schema content with PostgreSQL configuration
const fullSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
}

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

model Course {
  id String @id @default(uuid())
  code String @unique
  name String
  description String?
  department String?
  semester String? @default("FIRST")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  lecturers CourseLecturer[]
  schedules Schedule[]
  sessions Session[]
  students StudentCourse[]
}

model CourseLecturer {
  id String @id @default(uuid())
  courseId String
  lecturerId String
  assignedAt DateTime @default(now())

  course Course @relation(fields: [courseId], references: [id])
  lecturer User @relation(fields: [lecturerId], references: [id])

  @@unique([courseId, lecturerId])
}

model StudentCourse {
  id String @id @default(uuid())
  studentId String
  courseId String
  enrolledAt DateTime @default(now())

  student User @relation(fields: [studentId], references: [id])
  course Course @relation(fields: [courseId], references: [id])

  @@unique([studentId, courseId])
}

model Schedule {
  id String @id @default(uuid())
  courseId String
  dayOfWeek Int
  startTime String
  endTime String
  location String?
  createdAt DateTime @default(now())
  updatedAt DateTime @default(now())

  course Course @relation(fields: [courseId], references: [id])
}

model Session {
  id String @id @default(uuid())
  courseId String
  date DateTime
  title String?
  topic String?
  notes String?
  createdAt DateTime @default(now())
  updatedAt DateTime @default(now())

  course Course @relation(fields: [courseId], references: [id])
  attendances Attendance[]
}

model Attendance {
  id String @id @default(uuid())
  userId String
  sessionId String
  status String
  timestamp DateTime @default(now())
  notes String?

  user User @relation("UserToAttendance", fields: [userId], references: [id])
  session Session @relation(fields: [sessionId], references: [id])

  @@unique([userId, sessionId])
}

model Notification {
  id String @id @default(uuid())
  title String
  message String
  targetRole String @default("ALL")
  createdAt DateTime @default(now())
  createdBy String?
  creator User? @relation("UserToNotifications", fields: [createdBy], references: [id])
  userNotifications UserNotification[]
}

model UserNotification {
  id String @id @default(uuid())
  userId String
  notificationId String
  read Boolean @default(false)
  readAt DateTime?
  createdAt DateTime @default(now())

  user User @relation("UserToUserNotifications", fields: [userId], references: [id], onDelete: Cascade)
  notification Notification @relation(fields: [notificationId], references: [id], onDelete: Cascade)

  @@unique([userId, notificationId])
}`;

try {
  // Write the complete schema file
  fs.writeFileSync(schemaPath, fullSchema, 'utf8');
  console.log('Complete PostgreSQL schema written successfully');
  
  // Create/update .env file with proper PostgreSQL URL
  const envPath = '/media/giddel/SAMMY/codeBase/QRAttendance/.env';
  
  let envContent = fs.readFileSync(envPath, 'utf8');
  console.log('Current .env file loaded');
  
  // Check if we need to set POSTGRES_PRISMA_URL
  if (!envContent.includes('POSTGRES_PRISMA_URL=')) {
    envContent += '\n# Added PostgreSQL connection\nPOSTGRES_PRISMA_URL="postgresql://postgres:YOUR_PASSWORD@db.evgkqizxlopqgvxhsakm.supabase.co:5432/postgres"\n';
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('.env file updated with POSTGRES_PRISMA_URL');
  } else {
    console.log('POSTGRES_PRISMA_URL already exists in .env file');
  }
  
  console.log('\nSchema file updated successfully. Check your .env file to ensure password is set correctly.');
} catch (error) {
  console.error('Error updating files:', error);
}
