import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient for server-side operations
// This prevents too many connections in development when file changes trigger reloads
let prisma: PrismaClient;

// Check if we're in production to avoid instantiating multiple instances during hot reloads
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Better database URL handling with validation and placeholder detection
const getDatabaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // Check for Vercel Postgres integration URLs
    const pgUrl = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
    
    if (pgUrl) {
      // Check if URL contains placeholder values
      if (pgUrl.includes('hostname:') || pgUrl.includes('username:') || pgUrl.includes('password@')) {
        console.error('⚠️ Database URL contains placeholder values! Please set actual connection details in environment variables.');
        console.error('Current URL appears to contain placeholder values instead of real connection details.');
      }
      
      console.log(`Using PostgreSQL database connection`);
      return pgUrl;
    }
    
    // Fallback to DATABASE_URL if specified
    if (process.env.DATABASE_URL) {
      console.log('Using fallback DATABASE_URL');
      return process.env.DATABASE_URL;
    }
    
    // If we're here, no valid URL was found
    console.error('⚠️ No database URL found - application will fail to connect');
    console.error('Please set POSTGRES_URL or POSTGRES_PRISMA_URL in your environment variables');
  }
  
  // Development - using SQLite
  return process.env.DATABASE_URL || 'file:./dev.db';
};

// Get the appropriate database URL
const databaseUrl = getDatabaseUrl();

// Create or reuse the PrismaClient instance
try {
  // Configure PrismaClient
  const prismaClientOptions = {
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: ['error', 'warn']
  };

  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient(prismaClientOptions);
  } else {
    // In development, reuse the client if it exists
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient(prismaClientOptions);
    }
    prisma = globalForPrisma.prisma;
  }
} catch (e) {
  console.error('Failed to initialize PrismaClient:', e);
  // Create a minimal client that will show errors properly
  prisma = new PrismaClient();
}

// Export the configured client
export { prisma };
