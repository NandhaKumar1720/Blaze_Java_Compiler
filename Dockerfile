# Use a full Node.js image instead of slim to ensure npm is included
FROM node:16

# Install Java JDK (Minimal dependencies)
RUN apt-get update && apt-get install -y default-jdk-headless

# Ensure npm is installed
RUN corepack enable && npm --version

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
