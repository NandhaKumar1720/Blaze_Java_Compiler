# Stage 1: Build Node.js dependencies
FROM node:16 AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# Stage 2: Use IBM Semeru Runtime (OpenJ9)
FROM ibm-semeru-runtimes:open-17-jdk

# Install Node.js separately (since Semeru doesn't include it)
RUN apt-get update && apt-get install -y nodejs npm

WORKDIR /app
COPY --from=builder /app/node_modules /app/node_modules
COPY . .

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
