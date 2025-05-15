import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient for server-side operations
// This prevents too many connections in development when file changes trigger reloads
let prisma: PrismaClient;

// Check if we're in production to avoid instantiating multiple instances during hot reloads
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// For hosted environments, use PostgreSQL URL if available
// SQLite doesn't work well in serverless environments due to filesystem limitations
const getDatabaseUrl = () => {
	if (process.env.NODE_ENV === 'production') {
		// For Vercel or similar platforms with PostgreSQL
		if (process.env.POSTGRES_PRISMA_URL) {
			return process.env.POSTGRES_PRISMA_URL;
		}

		// For platforms with general PostgreSQL support
		if (process.env.POSTGRES_URL) {
			return process.env.POSTGRES_URL;
		}

		console.warn('No production database URL found, falling back to SQLite (may not work in hosted environment)');
	}

	// Development fallback
	return process.env.DATABASE_URL || 'file:./dev.db';
};

const databaseUrl = getDatabaseUrl();

if (process.env.NODE_ENV === 'production') {
	prisma = new PrismaClient({
		datasources: {
			db: {
				url: databaseUrl
			}
		},
		log: ['error', 'warn']
	});

	// Log database connection attempt in production for debugging
	console.log(`Attempting to connect to database with URL type: ${databaseUrl.split(':')[0]}`);
} else {
	if (!globalForPrisma.prisma) {
		globalForPrisma.prisma = new PrismaClient({
			datasources: {
				db: {
					url: databaseUrl
				}
			},
			log: ['query', 'error', 'warn']
		});
	}
	prisma = globalForPrisma.prisma;
}

// Simple connection without hooks
export { prisma };
