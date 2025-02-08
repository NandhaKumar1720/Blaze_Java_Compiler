# Use official Node.js image as base
FROM node:latest

# Install Java (OpenJDK) and other dependencies
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port and start server
EXPOSE 3000
CMD ["node", "server.js"]
