# Use GraalVM as the base image
FROM ghcr.io/graalvm/graalvm-ce:latest

# Install Node.js and native-image for GraalVM
RUN gu install nodejs native-image

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose port and start server
EXPOSE 3000
CMD ["node", "server.js"]
