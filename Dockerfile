# Use a lightweight base image with GCJ support
FROM debian:latest

# Install GNU Java Compiler (GCJ) and Node.js
RUN apt-get update && apt-get install -y \
    gcj \
    nodejs \
    npm

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
