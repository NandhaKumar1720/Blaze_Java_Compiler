# First stage: Node.js for installing dependencies
FROM node:16 AS node-builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Second stage: GraalVM for ultra-fast execution
FROM ghcr.io/graalvm/graalvm-ce:latest AS graalvm

# Install required utilities
RUN microdnf install -y tar gzip && microdnf clean all

# Set working directory
WORKDIR /app

# Copy installed node_modules from the first stage
COPY --from=node-builder /app/node_modules ./node_modules

# Copy the rest of the app
COPY . .

# Expose port and run server
EXPOSE 3000
CMD ["node", "server.js"]
