# Use a minimal OpenJ9-based Java runtime for performance
FROM adoptopenjdk/openj9:jre-11-bionic

# Set the working directory
WORKDIR /app

# Copy application files
COPY ./build/libs/server.jar ./server.jar

# Expose the port
EXPOSE 3000

# Command to run the server
CMD ["java", "-jar", "server.jar"]
