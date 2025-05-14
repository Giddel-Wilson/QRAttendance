import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient
const prisma = new PrismaClient();

// Export as both 'prisma' and 'db' to satisfy different import requirements
export const db = prisma;
export { prisma };

// Export any other database-related functions or utilities here
export async function getUserById(id) {
  return await prisma.user.findUnique({
    where: { id }
  });
}

export async function getAllUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateUser(id, data) {
  return await prisma.user.update({
    where: { id },
    data
  });
}

export async function deleteUser(id) {
  return await prisma.user.delete({
    where: { id }
  });
}
