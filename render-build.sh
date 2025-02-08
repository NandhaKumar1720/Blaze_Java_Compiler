#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status

echo "🔥 Starting Render Build for Java Execution Server..."

# Update and install necessary dependencies
apk update && apk add --no-cache bash openjdk17

# Print Java version for debugging
java -version

# Navigate to project directory
cd $RENDER_PROJECT_ROOT

# Install Node.js dependencies
npm install --production

# Pre-warm the JVM by running a dummy Java process
echo "public class Warmup { public static void main(String[] args) { System.out.println(\"JVM Warmed Up!\"); }}" > Warmup.java
javac Warmup.java
java Warmup
rm -f Warmup.java Warmup.class

echo "✅ Build process completed successfully!"
