import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔄 Setting up database...');

// Ensure prisma directory exists
const prismaDir = path.join(process.cwd(), 'prisma');
if (!fs.existsSync(prismaDir)) {
	console.log('📁 Creating prisma directory...');
	fs.mkdirSync(prismaDir);
}

try {
	// Generate Prisma client
	console.log('🔧 Generating Prisma client...');
	execSync('npx prisma generate', { stdio: 'inherit' });

	// Push schema to database
	console.log('🚀 Creating database tables...');
	execSync('npx prisma db push', { stdio: 'inherit' });

	console.log('✅ Database setup complete!');
} catch (error) {
	console.error('❌ Error setting up database:', error.message);
	process.exit(1);
}
