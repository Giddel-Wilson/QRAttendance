import { readFileSync, writeFileSync, existsSync } from 'fs';

// Define file paths
const schemaPath = '/home/giddel/Documents/codeBase/departmentalAttendance/schema.prisma';
const targetPath = '/home/giddel/Documents/codeBase/departmentalAttendance/prisma/schema.prisma';

// Complete schema with datasource block
const completeSchema = `datasource db {
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
  
  student    User     @relation(fields: [studentId], references: [id])
  course     Course   @relation(fields: [courseId], references: [id])
  
  @@unique([studentId, courseId])
}

model Schedule {
  id        String   @id @default(uuid())
  courseId  String
  dayOfWeek Int
  startTime String
  endTime   String
  location  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
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
  
  course     Course      @relation(fields: [courseId], references: [id])
  attendances Attendance[]
}

model Attendance {
  id        String   @id @default(uuid())
  userId    String
  sessionId String
  status    String
  timestamp DateTime @default(now())
  notes     String?
  
  user     User     @relation("UserToAttendance", fields: [userId], references: [id])
  session  Session  @relation(fields: [sessionId], references: [id])
  
  @@unique([userId, sessionId])
}`;

// Make sure .env file exists with DATABASE_URL
const envPath = '/home/giddel/Documents/codeBase/departmentalAttendance/.env';
writeFileSync(envPath, 'DATABASE_URL="file:./dev.db"\n', 'utf8');
console.log('.env file updated.');

// Ensure prisma directory exists
if (!existsSync('/home/giddel/Documents/codeBase/departmentalAttendance/prisma')) {
	console.log('Creating prisma directory...');
	try {
		writeFileSync(
			'/home/giddel/Documents/codeBase/departmentalAttendance/prisma/.keep',
			'',
			'utf8'
		);
	} catch (err) {
		console.error('Failed to create prisma directory:', err);
	}
}

// Write the complete schema to both possible locations to ensure it's found
writeFileSync(schemaPath, completeSchema, 'utf8');
writeFileSync(targetPath, completeSchema, 'utf8');

console.log('Schema files written successfully!');
console.log('Now run:');
console.log('bun prisma generate');
console.log('bun prisma migrate dev --name init_schema');
