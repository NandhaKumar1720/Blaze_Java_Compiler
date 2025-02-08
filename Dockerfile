# Use a Node.js image with Debian as the base
FROM node:18-bullseye

# Install GraalVM manually
RUN apt-get update && apt-get install -y curl unzip gcc build-essential
RUN curl -L -o graalvm.tar.gz https://github.com/graalvm/graalvm-ce-builds/releases/download/jdk-21.0.1/graalvm-jdk-21.0.1_linux-x64_bin.tar.gz
RUN tar -xzf graalvm.tar.gz && mv graalvm-jdk-21.0.1 /usr/lib/graalvm
RUN echo 'export PATH="/usr/lib/graalvm/bin:$PATH"' >> ~/.bashrc
RUN /usr/lib/graalvm/bin/gu install native-image

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port and start server
EXPOSE 3000
CMD ["node", "server.js"]
