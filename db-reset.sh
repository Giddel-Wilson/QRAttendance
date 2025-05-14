#!/bin/bash
set -e

echo "Setting up complete database with all tables..."

# Make sure we're in the project directory
cd /home/giddel/Documents/codeBase/departmentalAttendance

# Update .env file
echo 'DATABASE_URL="file:./dev.db"' > .env

# Delete existing database and migrations
rm -f dev.db
rm -rf prisma/migrations

# Generate Prisma client
bun prisma generate

# Apply migrations
echo "y" | bun prisma migrate reset --force
bun prisma migrate dev --name complete_schema

# Create initial data
cat > setup-db.js << 'EOF'
import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/lib/utils/auth.js';

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log('Creating admin account...');
  
  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: 'ADMIN'
    }
  });
  
  console.log('Creating lecturer accounts...');
  
  // Create lecturers
  const lecturer1 = await prisma.user.create({
    data: {
      name: 'Dr. John Smith',
      email: 'john.smith@example.com',
      passwordHash: await hashPassword('password123'),
      role: 'LECTURER',
      department: 'Computer Science'
    }
  });
  
  const lecturer2 = await prisma.user.create({
    data: {
      name: 'Prof. Sarah Johnson',
      email: 'sarah.johnson@example.com',
      passwordHash: await hashPassword('password123'),
      role: 'LECTURER',
      department: 'Information Technology'
    }
  });

  console.log('Creating courses...');
  
  // Create courses
  const course1 = await prisma.course.create({
    data: {
      code: 'CS101',
      name: 'Introduction to Programming',
      description: 'Basic concepts of programming using Python',
      department: 'Computer Science',
      semester: 'FIRST',
      lecturerId: lecturer1.id
    }
  });
  
  const course2 = await prisma.course.create({
    data: {
      code: 'IT205',
      name: 'Database Systems',
      description: 'Introduction to database design and SQL',
      department: 'Information Technology',
      semester: 'SECOND',
      lecturerId: lecturer2.id
    }
  });
  
  console.log('Creating student account...');
  
  // Create student
  const student = await prisma.user.create({
    data: {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      passwordHash: await hashPassword('password123'),
      role: 'STUDENT',
      department: 'Computer Science'
    }
  });
  
  console.log('Enrolling student in courses...');
  
  // Enroll student in courses
  await prisma.studentCourse.create({
    data: {
      studentId: student.id,
      courseId: course1.id
    }
  });
  
  console.log('Creating schedule...');
  
  // Create schedule
  await prisma.schedule.create({
    data: {
      courseId: course1.id,
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '11:00',
      location: 'Room 101'
    }
  });
  
  console.log('Creating session...');
  
  // Create session
  const session = await prisma.session.create({
    data: {
      courseId: course1.id,
      date: new Date(),
      title: 'Introduction to Variables',
      topic: 'Variables and Data Types'
    }
  });
  
  console.log('Recording attendance...');
  
  // Record attendance
  await prisma.attendance.create({
    data: {
      userId: student.id,
      sessionId: session.id,
      status: 'PRESENT'
    }
  });
  
  console.log('Database seeded successfully!');
  
  // Print login credentials
  console.log('\n--- LOGIN CREDENTIALS ---');
  console.log('Admin: admin@example.com / admin123');
  console.log('Lecturer: john.smith@example.com / password123');
  console.log('Student: jane.doe@example.com / password123');
}

seedDatabase()
  .catch(e => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF

# Run the setup script
echo "Seeding database with initial data..."
bun setup-db.js

echo "Database setup complete!"
