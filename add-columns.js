import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { exec } from 'child_process';

// Create migration SQL
const migrationSQL = `-- Add matricNumber and level columns
ALTER TABLE "User" ADD COLUMN "matricNumber" TEXT;
ALTER TABLE "User" ADD COLUMN "level" TEXT;
`;

// Path to the migration
const migrationDir =
	'/home/giddel/Documents/codeBase/departmentalAttendance/prisma/migrations/manual_add_columns';

// Create migration directory and files
try {
	// Create directory
	if (!fs.existsSync(migrationDir)) {
		fs.mkdirSync(migrationDir, { recursive: true });
	}

	// Write migration SQL file
	fs.writeFileSync(`${migrationDir}/migration.sql`, migrationSQL);

	// Mark this migration as applied
	const migrationMeta = {
		version: '0.3.0',
		description: 'Add matricNumber and level columns',
		applied_steps_count: 1
	};
	fs.writeFileSync(`${migrationDir}/migration.toml`, JSON.stringify(migrationMeta));

	console.log('Migration files created');

	// Apply the migration directly using SQLite
	const dbPath = '/home/giddel/Documents/codeBase/departmentalAttendance/dev.db';
	console.log('Applying migration directly to SQLite database...');

	// We can try to apply it directly with sqlite3 CLI if available
	exec(`echo "${migrationSQL}" | sqlite3 ${dbPath}`, (error, stdout, stderr) => {
		if (error) {
			console.log(`Error applying migration: ${error.message}`);
			console.log('Please run the SQL statements manually in SQLiteBrowser');
		} else {
			console.log('Migration applied successfully!');
		}
	});

	// Generate Prisma client
	console.log('Generating Prisma client...');
	exec('bun prisma generate', (error) => {
		if (error) {
			console.log(`Error generating Prisma client: ${error.message}`);
		} else {
			console.log('Prisma client generated successfully!');
		}
	});
} catch (err) {
	console.error('Error creating migration:', err);
}
