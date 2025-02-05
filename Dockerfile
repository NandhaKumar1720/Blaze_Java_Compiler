# Use OpenJDK as the base image
FROM openjdk:17-jdk-slim

# Install required dependencies
RUN apt-get update && apt-get install -y wget curl

# Install Node.js manually
RUN wget -q https://nodejs.org/dist/v16.20.2/node-v16.20.2-linux-x64.tar.xz && \
    tar -xJf node-v16.20.2-linux-x64.tar.xz && \
    mv node-v16.20.2-linux-x64 /usr/local/node && \
    ln -s /usr/local/node/bin/node /usr/local/bin/node && \
    ln -s /usr/local/node/bin/npm /usr/local/bin/npm && \
    rm node-v16.20.2-linux-x64.tar.xz

# Verify installation
RUN node -v && npm -v

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
