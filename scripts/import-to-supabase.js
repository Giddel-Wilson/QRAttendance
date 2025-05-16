// filepath: /media/giddel/SAMMY/codeBase/QRAttendance/scripts/import-to-supabase.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const dataDir = path.join(process.cwd(), 'migrations/data');

async function importData() {
  console.log('Importing data to PostgreSQL...');
  
  try {
    // Import Users
    if (fs.existsSync(path.join(dataDir, 'users.json'))) {
      const users = JSON.parse(fs.readFileSync(path.join(dataDir, 'users.json'), 'utf8'));
      console.log(`Importing ${users.length} users...`);
      
      for (const user of users) {
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            passwordHash: user.passwordHash,
            name: user.name,
            role: user.role,
            department: user.department,
            matricNumber: user.matricNumber,
            level: user.level,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          }
        });
      }
    }
    
    // Import Courses
    // ...existing code...
    
    console.log('✅ Data import complete!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
