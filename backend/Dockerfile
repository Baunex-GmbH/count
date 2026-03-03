FROM gradle:8.11-jdk21 AS build
WORKDIR /app
COPY . .
RUN gradle build -Dquarkus.package.jar.type=uber-jar -x test

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/build/*-runner.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
