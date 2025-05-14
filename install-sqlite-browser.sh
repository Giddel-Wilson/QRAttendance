#!/bin/bash

# Install SQLite Browser
echo "Installing DB Browser for SQLite..."
sudo apt-get update
sudo apt-get install -y sqlitebrowser

echo "Installation complete! Run the command below to open your database:"
echo "sqlitebrowser /home/giddel/Documents/codeBase/departmentalAttendance/dev.db"
