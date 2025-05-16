import { execSync } from 'child_process';

// Step 1: Fix local SQLite connection
console.log('Step 1: Fixing local SQLite connection...');
execSync('bun run scripts/fix-sqlite-local.js', { stdio: 'inherit' });
execSync('bun prisma generate', { stdio: 'inherit' });

// Step 2: Create migration plan and scripts
console.log('\nStep 2: Creating migration plan...');
execSync('bun run scripts/supabase-migration-plan.js', { stdio: 'inherit' });

console.log('\n✅ Setup complete!');
console.log('\n1. First verify your local SQLite works:');
console.log('   bun run dev');
console.log('\n2. Then follow the migration plan in migrations/supabase-migration-plan.md');
