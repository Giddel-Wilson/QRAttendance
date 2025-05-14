import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

// Ensure prisma directory exists
const prismaDir = path.join(process.cwd(), 'prisma');
if (!fs.existsSync(prismaDir)) {
	fs.mkdirSync(prismaDir);
}

// Run Prisma commands
console.log('Generating Prisma client...');
exec('npx prisma generate', (error, stdout, stderr) => {
	if (error) {
		console.error(`Error generating Prisma client: ${error.message}`);
		return;
	}
	if (stderr) {
		console.error(`stderr: ${stderr}`);
		return;
	}
	console.log(`${stdout}`);

	console.log('Pushing schema to database...');
	exec('npx prisma db push', (error, stdout, stderr) => {
		if (error) {
			console.error(`Error pushing schema: ${error.message}`);
			return;
		}
		if (stderr) {
			console.error(`stderr: ${stderr}`);
			return;
		}
		console.log(`${stdout}`);
		console.log('Database setup complete!');
	});
});
