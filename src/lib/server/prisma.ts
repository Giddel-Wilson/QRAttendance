import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient for server-side operations
// This prevents too many connections in development when file changes trigger reloads
let prisma: PrismaClient;

// Check if we're in production to avoid instantiating multiple instances during hot reloads
const globalForPrisma = global as unknown as { prisma: PrismaClient };

if (process.env.NODE_ENV === 'production') {
	prisma = new PrismaClient({
		datasources: {
			db: {
				// Use env var with fallback to relative path
				url: process.env.DATABASE_URL
			}
		},
		log: ['error', 'warn']
	});
} else {
	if (!globalForPrisma.prisma) {
		globalForPrisma.prisma = new PrismaClient({
			log: ['query', 'error', 'warn']
		});
	}
	prisma = globalForPrisma.prisma;
}

// Simple connection without hooks
export { prisma };
