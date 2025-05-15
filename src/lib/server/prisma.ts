import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient for server-side operations
// This prevents too many connections in development when file changes trigger reloads
let prisma: PrismaClient;

// Check if we're in production to avoid instantiating multiple instances during hot reloads
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Validate a database URL to catch connection problems early
function isValidDatabaseUrl(url: string | undefined): boolean {
  if (!url) return false;
  
  try {
    // Simple validation for PostgreSQL URLs
    if (url.startsWith('postgres:') || url.startsWith('postgresql:')) {
      const match = url.match(/^(postgresql|postgres):\/\/[^:]+:[^@]+@[^:]+:\d+\/\w+/);
      return !!match;
    }
    
    // For SQLite, just check basic format
    if (url.startsWith('file:')) {
      return true;
    }
    
    return false;
  } catch (e) {
    console.error('Error validating database URL:', e);
    return false;
  }
}

// Better database URL handling with validation
const getDatabaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // For Vercel Postgres integration
    const pgUrl = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
    
    if (pgUrl && isValidDatabaseUrl(pgUrl)) {
      console.log(`Using PostgreSQL database (${pgUrl.split(':')[0]} protocol)`);
      return pgUrl;
    }
    
    // Fallback to DATABASE_URL if specified
    if (process.env.DATABASE_URL && isValidDatabaseUrl(process.env.DATABASE_URL)) {
      console.log('Using fallback DATABASE_URL');
      return process.env.DATABASE_URL;
    }
    
    // If we're here, no valid URL was found - log error but return something to prevent crash
    console.error('⚠️ No valid database URL found - application may fail to connect to database');
    console.error('Make sure POSTGRES_URL or POSTGRES_PRISMA_URL is properly set in environment variables');
    
    // Return the development database as fallback
    return 'file:./dev.db';
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
    log: process.env.NODE_ENV === 'production' 
      ? ['error', 'warn']
      : ['query', 'error', 'warn']
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
