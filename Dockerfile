# Use GraalVM as the base image
FROM ghcr.io/graalvm/graalvm-ce:latest

# Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest

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
