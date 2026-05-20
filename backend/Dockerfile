FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -B -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -B -q -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
RUN useradd --system --create-home --uid 1001 cms
COPY --from=build /workspace/target/*.jar /app/app.jar
RUN mkdir -p /app/uploads && chown -R cms:cms /app
USER cms
ENV STORAGE_ROOT=/app/uploads
ENV SERVER_PORT=8080
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
