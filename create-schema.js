import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

// Ensure prisma directory exists
const schemaDir = '/home/giddel/Documents/codeBase/departmentalAttendance/prisma';
if (!existsSync(schemaDir)) {
	mkdirSync(schemaDir, { recursive: true });
}

const schemaPath = `${schemaDir}/schema.prisma`;

// Complete schema definition
const schema = `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id              String       @id @default(uuid())
  email           String       @unique
  passwordHash    String
  name            String?
  role            String       @default("STUDENT")
  department      String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  // Relations
  taughtCourses   Course[]     @relation("CourseToLecturer")
  attendances     Attendance[] @relation("UserToAttendance")
  enrolledCourses StudentCourse[]
}

model Course {
  id          String       @id @default(uuid())
  code        String       @unique
  name        String
  description String?
  department  String?
  semester    String?      @default("FIRST")
  lecturerId  String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  // Relations
  lecturer    User?        @relation("CourseToLecturer", fields: [lecturerId], references: [id])
  schedules   Schedule[]
  sessions    Session[]
  students    StudentCourse[]
}

model StudentCourse {
  id        String   @id @default(uuid())
  studentId String
  courseId  String
  enrolledAt DateTime @default(now())
  
  // Relations
  student    User     @relation(fields: [studentId], references: [id])
  course     Course   @relation(fields: [courseId], references: [id])
  
  @@unique([studentId, courseId])
}

model Schedule {
  id        String   @id @default(uuid())
  courseId  String
  dayOfWeek Int      // 0 = Sunday, 1 = Monday, etc.
  startTime String
  endTime   String
  location  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  course    Course   @relation(fields: [courseId], references: [id])
}

model Session {
  id        String       @id @default(uuid())
  courseId  String
  date      DateTime
  title     String?
  topic     String?
  notes     String?
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
  
  // Relations
  course     Course      @relation(fields: [courseId], references: [id])
  attendances Attendance[]
}

model Attendance {
  id        String   @id @default(uuid())
  userId    String
  sessionId String
  status    String   // PRESENT, ABSENT, LATE
  timestamp DateTime @default(now())
  notes     String?
  
  // Relations
  user     User     @relation("UserToAttendance", fields: [userId], references: [id])
  session  Session  @relation(fields: [sessionId], references: [id])
  
  @@unique([userId, sessionId])
}`;

// Write the schema to file
writeFileSync(schemaPath, schema, 'utf8');

// Verify the file was created correctly
const fileContent = readFileSync(schemaPath, 'utf8');
if (fileContent.includes('datasource db {')) {
	console.log('Schema file created successfully with datasource block!');
	console.log(`Schema file path: ${schemaPath}`);
} else {
	console.error('Schema file creation failed. Please check permissions and try again.');
	process.exit(1);
}

// Create or update .env file
const envPath = '/home/giddel/Documents/codeBase/departmentalAttendance/.env';
writeFileSync(envPath, 'DATABASE_URL="file:./dev.db"\n', 'utf8');
console.log('.env file updated successfully.');

console.log('\nNext steps:');
console.log('1. Run: bun prisma generate');
console.log('2. Run: bun prisma migrate dev --name complete_schema');
console.log('3. Run your seed script to populate the database');
