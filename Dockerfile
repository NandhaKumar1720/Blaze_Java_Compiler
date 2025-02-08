# Use Debian-based image (supports apt-get)
FROM openjdk:17-bullseye

# Set working directory
WORKDIR /app

# Copy Java server and compile it
COPY JavaServer.java .
RUN javac JavaServer.java

# Install Node.js and npm
RUN apt-get update && apt-get install -y nodejs npm

# Copy Node.js server files
COPY package.json package-lock.json ./
RUN npm install --production
COPY . .

# Start both servers
CMD java JavaServer & node server.js
