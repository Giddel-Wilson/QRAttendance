import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/lib/utils/auth.js';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hashPassword('admin123');
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'System Administrator',
      passwordHash,
      role: 'ADMIN',
      department: 'Administration'
    }
  });
  
  console.log(`Admin user created: ${adminUser.id}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
