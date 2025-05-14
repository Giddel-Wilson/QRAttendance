import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient for server-side operations
// This prevents too many connections in development when file changes trigger reloads
let prisma: PrismaClient;

// Check if we're in production to avoid instantiating multiple instances during hot reloads
const globalForPrisma = global as unknown as { prisma: PrismaClient };

if (process.env.NODE_ENV === 'production') {
	prisma = new PrismaClient();
} else {
	if (!globalForPrisma.prisma) {
		globalForPrisma.prisma = new PrismaClient();
	}
	prisma = globalForPrisma.prisma;
}

export { prisma };
