#!/bin/bash

# Check if SQLiteBrowser is already installed
if command -v sqlitebrowser &> /dev/null; then
  echo "SQLiteBrowser is already installed."
else
  # Install SQLiteBrowser GUI
  echo "Installing SQLiteBrowser GUI..."
  sudo apt-get update
  sudo apt-get install -y sqlitebrowser
fi

# Verify the database file exists
if [ -f "/home/giddel/Documents/codeBase/departmentalAttendance/dev.db" ]; then
  echo "Database file found. Opening with SQLiteBrowser..."
  sqlitebrowser "/home/giddel/Documents/codeBase/departmentalAttendance/dev.db" &
else
  echo "Database file not found at expected location."
  echo "Please make sure your database is at: /home/giddel/Documents/codeBase/departmentalAttendance/dev.db"
fi

echo "To open your database manually in the future, use:"
echo "sqlitebrowser /home/giddel/Documents/codeBase/departmentalAttendance/dev.db"
