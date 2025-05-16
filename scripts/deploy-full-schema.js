import fs from 'fs';

// Path to schema file
const schemaPath = '/media/giddel/SAMMY/codeBase/QRAttendance/prisma/schema.prisma';

// Read current schema to get the header
let currentSchema = fs.readFileSync(schemaPath, 'utf8');
const headerPart = currentSchema.split('// Test with')[0];

// Full schema with all your models
const fullSchema = `${headerPart}

// Full application models
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

model CourseLecturer {
  id String @id @default(uuid())
  courseId String
  lecturerId String
  createdAt DateTime @default(now())

  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lecturer User @relation(fields: [lecturerId], references: [id], onDelete: Cascade)
}

model Attendance {
  id String @id @default(uuid())
  date DateTime @default(now())
  status String
  remarks String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation("UserToAttendance", fields: [userId], references: [id], onDelete: Cascade)
}

model StudentCourse {
  id String @id @default(uuid())
  courseId String
  studentId String
  semester String
  year Int
  createdAt DateTime @default(now())

  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  student User @relation(fields: [studentId], references: [id], onDelete: Cascade)
}

model Course {
  id String @id @default(uuid())
  code String @unique
  name String
  description String?
  credits Int
  semester String
  year Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  taughtBy CourseLecturer[]
  enrolledStudents StudentCourse[]
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

// Write the full schema
fs.writeFileSync(schemaPath, fullSchema, 'utf8');
console.log('✅ Full schema with all models written successfully');
console.log('Run: bun prisma db push --accept-data-loss');