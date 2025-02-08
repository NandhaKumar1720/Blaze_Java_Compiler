#!/bin/bash

# Install dependencies for OpenJDK and Node.js
echo "Installing dependencies..."

# Update package lists
apt-get update

# Install OpenJDK and Node.js
apt-get install -y openjdk-17-jdk nodejs npm

# Install Node.js dependencies
npm install

echo "Dependencies installed successfully."

# Run the server
echo "Starting the server..."
npm start
