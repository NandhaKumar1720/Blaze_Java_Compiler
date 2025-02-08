# Use a minimal JDK base image for better performance
FROM openjdk:17-alpine

# Set working directory
WORKDIR /app

# Install necessary dependencies
RUN apk add --no-cache bash

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose port and start the server
EXPOSE 3000
CMD ["node", "server.js"]
