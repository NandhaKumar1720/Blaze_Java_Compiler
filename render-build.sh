#!/bin/bash

echo "Installing dependencies..."
apt-get update
apt-get install -y openjdk-11-jre python3 python3-pip

echo "Building Java project..."
./gradlew build

echo "Starting the server..."
java -jar build/libs/server.jar
