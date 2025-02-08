#!/bin/bash

# Install dependencies for GraalVM and Node.js
echo "Installing dependencies..."

# Install GraalVM native-image
gu install native-image

# Install Node.js dependencies
npm install

echo "Dependencies installed successfully."

# Run the server
echo "Starting the server..."
npm start
