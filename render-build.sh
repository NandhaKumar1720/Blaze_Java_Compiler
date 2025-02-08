#!/bin/bash

# Install dependencies for GCJ and Node.js
echo "Installing dependencies..."

# Update package lists
apt-get update

# Install GNU Java Compiler (GCJ) and Node.js
apt-get install -y gcj nodejs npm

# Install Node.js dependencies
npm install

echo "Dependencies installed successfully."

# Run the server
echo "Starting the server..."
npm start
