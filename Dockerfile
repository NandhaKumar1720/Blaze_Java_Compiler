# Use GraalVM as the base image
FROM ghcr.io/graalvm/graalvm-ce:latest

# Install dependencies (including Node.js manually)
RUN wget -qO- https://nodejs.org/dist/v16.20.2/node-v16.20.2-linux-x64.tar.xz | tar -xJ && \
    mv node-v16.20.2-linux-x64 /usr/local/node && \
    ln -s /usr/local/node/bin/node /usr/local/bin/node && \
    ln -s /usr/local/node/bin/npm /usr/local/bin/npm

# Verify Node.js installation
RUN node -v && npm -v

# Install GraalVM's native-image tool
RUN gu install native-image

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
