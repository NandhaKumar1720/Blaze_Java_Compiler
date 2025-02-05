# Use GraalVM for faster Java execution
FROM ghcr.io/graalvm/graalvm-ce:latest

# Install Node.js
RUN microdnf install -y nodejs npm

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy application code
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
