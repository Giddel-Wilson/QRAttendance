#!/bin/bash

# Check if sqlite3 is installed
if ! command -v sqlite3 &> /dev/null; then
  echo "SQLite3 command-line tool not found. Installing..."
  sudo apt-get update
  sudo apt-get install -y sqlite3
fi

# Open the database
echo "Opening SQLite database..."
echo ""
echo "Type '.tables' to see all tables"
echo "Type 'SELECT * FROM User;' to see all users"
echo "Type '.quit' to exit"
echo ""

sqlite3 /home/giddel/Documents/codeBase/departmentalAttendance/dev.db
