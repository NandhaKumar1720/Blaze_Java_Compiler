# Use the official GraalVM image as the base
FROM ghcr.io/graalvm/graalvm-ce:latest

# Install curl to fetch Node.js installation script
RUN gu install nodejs

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package.json package-lock.json ./

# Install dependencies using npm
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
