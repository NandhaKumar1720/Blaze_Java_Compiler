FROM openjdk:17
WORKDIR /app

# Copy Java server and compile it
COPY JavaServer.java .
RUN javac JavaServer.java

# Install Node.js
RUN apt-get update && apt-get install -y nodejs npm

# Copy Node.js server files
COPY package.json package-lock.json ./
RUN npm install --production
COPY . .

# Start both servers
CMD java JavaServer & node server.js
