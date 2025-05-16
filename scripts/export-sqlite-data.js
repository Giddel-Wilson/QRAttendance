// filepath: /media/giddel/SAMMY/codeBase/QRAttendance/scripts/export-sqlite-data.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const exportDir = path.join(process.cwd(), 'migrations/data');

async function exportData() {
  // Create export directory
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  
  console.log('Exporting data from SQLite...');
  
  try {
    // Export Users
    const users = await prisma.user.findMany();
    fs.writeFileSync(path.join(exportDir, 'users.json'), JSON.stringify(users, null, 2));
    console.log(`Exported ${users.length} users`);
    
    // Export Courses
    const courses = await prisma.course.findMany();
    fs.writeFileSync(path.join(exportDir, 'courses.json'), JSON.stringify(courses, null, 2));
    console.log(`Exported ${courses.length} courses`);
    
    // Export other tables
    // ...existing code...
    
    console.log('✅ Data export complete!');
  } catch (error) {
    console.error('Error exporting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
