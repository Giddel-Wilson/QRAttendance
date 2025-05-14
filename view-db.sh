#!/bin/bash

# Option 1: Using sqlite3 command line (if installed)
if command -v sqlite3 &> /dev/null; then
  echo "Opening database with sqlite3..."
  sqlite3 /home/giddel/Documents/codeBase/departmentalAttendance/dev.db '.tables'
  echo "Type '.help' for commands, '.quit' to exit"
  sqlite3 /home/giddel/Documents/codeBase/departmentalAttendance/dev.db
  exit 0
fi

# Option 2: Try with Bun directly
echo "Trying to view database with Bun..."
cat > /home/giddel/Documents/codeBase/departmentalAttendance/view-db.js << 'EOL'
import { Database } from 'bun:sqlite';

const db = new Database('/home/giddel/Documents/codeBase/departmentalAttendance/dev.db');
console.log("Database opened successfully!");

// Get list of tables
const tables = db.query("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("Tables in database:", tables.map(t => t.name));

// For each table, show contents
tables.forEach(table => {
  if (table.name.startsWith('_')) return; // Skip Prisma internal tables
  
  console.log(`\n== Contents of table ${table.name} ==`);
  const rows = db.query(`SELECT * FROM ${table.name}`).all();
  console.table(rows);
});
EOL

bun run /home/giddel/Documents/codeBase/departmentalAttendance/view-db.js
