#!/bin/bash

echo "Installing dependencies..."

# Install Java JDK (Minimal version)
apt-get update && apt-get install -y default-jdk-headless build-essential

# Install Node.js dependencies
npm install

echo "Dependencies installed successfully."

# Run the server
echo "Starting the server..."
npm start
