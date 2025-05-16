import fs from 'fs';
import path from 'path';

// Configuration
const PROJECT_ROOT = '/media/giddel/SAMMY/codeBase/QRAttendance';
const SCHEMA_PATH = path.join(PROJECT_ROOT, 'prisma/schema.prisma');

// Get current schema header (datasource and generator)
const currentSchema = fs.readFileSync(SCHEMA_PATH, 'utf8');
const schemaHeader = currentSchema.split('// ... existing models')[0];

// The complete schema with all your models
const fullSchema = `${schemaHeader}

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

// Write the complete schema
fs.writeFileSync(SCHEMA_PATH, fullSchema, 'utf8');
console.log('✅ Full schema with all models written successfully');
console.log('Now run: bun prisma generate && bun prisma db push');
