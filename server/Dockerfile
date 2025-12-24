# Base runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore
COPY Backend/Backend/Backend.csproj Backend/Backend/
RUN dotnet restore Backend/Backend/Backend.csproj

# Copy full source
COPY Backend/Backend/ Backend/Backend/

# Build
WORKDIR /src/Backend/Backend
RUN dotnet build Backend.csproj -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish Backend.csproj -c Release -o /app/publish /p:UseAppHost=false

# Final image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Backend.dll"]
