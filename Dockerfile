# Build stage: publish only the API project (the test project lives in a subfolder and is excluded).
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY BitesAndMore.API.csproj ./
RUN dotnet restore BitesAndMore.API.csproj
COPY . .
RUN dotnet publish BitesAndMore.API.csproj -c Release -o /app --no-restore

# Runtime stage.
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app ./
ENV ASPNETCORE_ENVIRONMENT=Production
# Render injects PORT; fall back to 8080 elsewhere.
CMD ["sh", "-c", "ASPNETCORE_URLS=http://0.0.0.0:${PORT:-8080} exec dotnet BitesAndMore.API.dll"]
