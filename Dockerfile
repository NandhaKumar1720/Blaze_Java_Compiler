# Use lightweight GraalVM-based Java image for ultra-fast execution
FROM ghcr.io/graalvm/graalvm-ce:latest AS graalvm

# Install required utilities
RUN microdnf install -y tar gzip && microdnf clean all

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose port and run server
EXPOSE 3000
CMD ["node", "server.js"]
