# Use GraalVM as the base image
FROM ghcr.io/graalvm/graalvm-ce:latest

# Install required dependencies
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
