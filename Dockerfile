# Use OpenJDK 17 as base image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml (if using Maven)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make Maven wrapper executable
RUN chmod +x ./mvnw

# Download dependencies (this layer will be cached if pom.xml doesn't change)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Create uploads directory for file uploads
RUN mkdir -p /app/uploads

# Expose the port (Render will set the PORT environment variable)
EXPOSE 8443

# Set environment variables for Render deployment with MongoDB Atlas
ENV SPRING_PROFILES_ACTIVE=prod
ENV FILE_UPLOAD_DIR=/app/uploads
ENV SPRING_DATA_MONGODB_URI=mongodb+srv://admin:BeautyCenterAdmin@beauty-center.ru5fy7s.mongodb.net/beauty-center-prod?retryWrites=true&w=majority&appName=beauty-center

# Copy SSL keystore
COPY devcert.p12 /app/devcert.p12


# Run the jar file
CMD ["java", "-Xmx512m", "-Xms256m", "-jar", "target/beauty-center-*.jar"]
