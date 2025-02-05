#!/bin/bash

# Install dependencies for GraalVM and Node.js
echo "Installing dependencies..."

# Update package list
apt-get update

# Install GraalVM and essential build tools
apt-get install -y build-essential curl

# Download and install GraalVM
GRAALVM_VERSION="22.3.0"
GRAALVM_ARCHIVE="graalvm-ce-java17-linux-amd64-${GRAALVM_VERSION}.tar.gz"
curl -LO https://github.com/graalvm/graalvm-ce-builds/releases/download/vm-${GRAALVM_VERSION}/${GRAALVM_ARCHIVE}
tar -xzf ${GRAALVM_ARCHIVE} -C /opt/

# Set GraalVM as the default Java
GRAALVM_DIR="/opt/graalvm-ce-java17-${GRAALVM_VERSION}"
export PATH=${GRAALVM_DIR}/bin:$PATH
export JAVA_HOME=${GRAALVM_DIR}

# Install Node.js dependencies
npm install

# Verify GraalVM installation
java -version
graalvm-ce-java17 --version

# Clean up downloaded files
rm -f ${GRAALVM_ARCHIVE}

echo "Dependencies installed successfully."

# Run the server
echo "Starting the server..."
npm start
