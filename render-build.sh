#!/bin/bash

# Install dependencies for Java and Node.js
echo "Installing dependencies..."

# Install Java JDK
apt-get update
apt-get install -y default-jdk build-essential

# Install Node.js dependencies
npm install

echo "Dependencies installed successfully."

# Run the server
echo "Starting the server..."
npm start
