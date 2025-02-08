# Use GraalVM with Node.js support
FROM ghcr.io/graalvm/graalvm-ce:latest

# Install Node.js manually
RUN gu install nodejs

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
