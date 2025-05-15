import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient for server-side operations
// This prevents too many connections in development when file changes trigger reloads
let prisma: PrismaClient;

// Check if we're in production to avoid instantiating multiple instances during hot reloads
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Better database URL handling with detailed logging
const getDatabaseUrl = () => {
	if (process.env.NODE_ENV === 'production') {
		// For Vercel Postgres integration
		if (process.env.POSTGRES_PRISMA_URL) {
			console.log('Using Vercel Postgres integration with connection pooling');
			return process.env.POSTGRES_PRISMA_URL;
		}

		// For other PostgreSQL providers
		if (process.env.POSTGRES_URL) {
			console.log('Using standard PostgreSQL connection');
			return process.env.POSTGRES_URL;
		}

		// For DATABASE_URL fallback (not recommended in production)
		if (process.env.DATABASE_URL) {
			console.log('Using generic DATABASE_URL (not recommended for production)');
			return process.env.DATABASE_URL;
		}

		console.warn('⚠️ No production database URL found - this will likely cause errors');
		return 'postgresql://postgres:postgres@localhost:5432/postgres'; // Fail-safe default
	}

	// Development - using SQLite
	return process.env.DATABASE_URL || 'file:./dev.db';
};

// Get the appropriate database URL
const databaseUrl = getDatabaseUrl();

// Configure PrismaClient with more detailed logging
const prismaClientOptions = {
	datasources: {
		db: {
			url: databaseUrl
		}
	},
	log: process.env.NODE_ENV === 'production'
		? ['error', 'warn', 'info']  // More logs in production to diagnose issues
		: ['query', 'error', 'warn']
};

// Create or reuse the PrismaClient instance
if (process.env.NODE_ENV === 'production') {
	prisma = new PrismaClient(prismaClientOptions);
	console.log(`Production database connection initialized (${databaseUrl.split(':')[0]} protocol)`);
} else {
	// In development, reuse the client if it exists
	if (!globalForPrisma.prisma) {
		globalForPrisma.prisma = new PrismaClient(prismaClientOptions);
	}
	prisma = globalForPrisma.prisma;
}

// Export the configured client
export { prisma };
