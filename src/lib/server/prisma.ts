import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient for server-side operations
// This prevents too many connections in development when file changes trigger reloads
let prisma: PrismaClient;

// Check if we're in production to avoid instantiating multiple instances during hot reloads
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Define a fallback URL for when the environment variable is not set
const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';

if (process.env.NODE_ENV === 'production') {
	// In production, ensure we have a proper database URL
	prisma = new PrismaClient({
		datasources: {
			db: {
				url: databaseUrl
			}
		},
		log: ['error', 'warn']
	});
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
