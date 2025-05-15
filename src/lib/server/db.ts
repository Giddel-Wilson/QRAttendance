import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Initialize PrismaClient just once and reuse
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a wrapped client that handles errors gracefully
class SafePrismaClient extends PrismaClient {
	constructor() {
		super({
			log: ['error']
		});
		// Remove any $on('beforeExit') hooks here
	}

	// Safe query wrapper with improved error handling
	async safeQuery<T>(queryFn: () => Promise<T>, fallback: T): Promise<T> {
		try {
			return await queryFn();
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2021') {
					// Table does not exist
					console.error(`Database table not found: ${error.meta?.table}`);
				} else if (error.code === 'P2022') {
					// Column does not exist
					console.error(`Database column not found: ${error.meta?.column}`);
				} else if (error.code === 'P2025') {
					// Record not found
					console.error(`Record not found: ${error.meta?.cause}`);
				}
			}
			console.error('Database query error:', error);
			return fallback;
		}
	}
}

export const db = globalForPrisma.prisma || new SafePrismaClient();

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = db;
}

// Export the safe query function
export async function safeQuery<T>(queryFn: () => Promise<T>, fallback: T): Promise<T> {
	return (db as SafePrismaClient).safeQuery(queryFn, fallback);
}
