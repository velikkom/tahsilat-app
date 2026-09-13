# Multi-stage build: compile with Maven, run on a slim JRE.
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw

# Cache dependencies separately from source changes.
RUN ./mvnw -q -B dependency:go-offline || true

COPY src ./src
RUN ./mvnw -q -B -DskipTests clean package

FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
