import fs from 'fs';

// Path to schema file
const schemaPath = '/media/giddel/SAMMY/codeBase/QRAttendance/prisma/schema.prisma';

// Force create the PostgreSQL schema - completely overwrite whatever is there
const pgSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
}

// Test with a simple model first
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  createdAt DateTime @default(now())
}
`;

// Write schema file - force overwrite
try {
  fs.writeFileSync(schemaPath, pgSchema, 'utf8');
  
  // Verify the file was written correctly
  const writtenContent = fs.readFileSync(schemaPath, 'utf8');
  if (writtenContent.includes('provider = "postgresql"') && 
      writtenContent.includes('url      = env("POSTGRES_PRISMA_URL")')) {
    console.log('✅ Schema successfully updated to use PostgreSQL');
  } else {
    console.error('❌ Schema file was not updated correctly');
  }
} catch (error) {
  console.error('❌ Error updating schema file:', error);
}
