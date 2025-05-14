#!/bin/bash

# Make sure we're in the right directory
cd /home/giddel/Documents/codeBase/departmentalAttendance

echo "Completely resetting Prisma setup..."

# Remove existing database file
rm -f dev.db

# Remove migrations folder to start fresh
rm -rf prisma/migrations

# Force reset using Prisma's built-in command
echo "y" | bun prisma migrate reset --force --schema=./prisma/schema.prisma

# Create initial migration
bun prisma migrate dev --name initial_migration --schema=./prisma/schema.prisma

echo "Database has been completely reset!"

# Create default admin user for testing
cat > create-admin.js << 'EOF'
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
EOF

# Create the admin user
echo "Creating admin user for testing..."
bun create-admin.js

echo "Setup complete! You can now log in with:"
echo "Email: admin@example.com"
echo "Password: admin123"
