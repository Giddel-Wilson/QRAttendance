// filepath: /media/giddel/SAMMY/codeBase/QRAttendance/scripts/verify-migration.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMigration() {
  console.log('Verifying migration...');
  
  try {
    // Check User table
    const userCount = await prisma.user.count();
    console.log(`Users: ${userCount}`);
    
    // Check Course table
    const courseCount = await prisma.course.count();
    console.log(`Courses: ${courseCount}`);
    
    // Check other tables
    // ...existing code...
    
  } catch (error) {
    console.error('Error verifying migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration();
