#!/bin/bash

echo "Installing dependencies..."

# Use GraalVM for ultra-fast Java execution
apt-get update
apt-get install -y build-essential
echo "Dependencies installed successfully."

# Run the server
echo "Starting the server..."
npm start
