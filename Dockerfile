# Use a lightweight Java runtime image
FROM amazoncorretto:11-alpine

# Install Node.js
RUN apk add --no-cache nodejs npm

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package.json package-lock.json ./

# Install dependencies using npm
RUN npm install

# Download Janino JAR manually
RUN mkdir -p /app/lib && \
    wget -O /app/lib/janino.jar https://repo1.maven.org/maven2/org/codehaus/janino/janino/3.1.10/janino-3.1.10.jar

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
