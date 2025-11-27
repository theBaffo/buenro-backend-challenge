# Buenro Backend Challenge

A NestJS-based backend solution for ingesting accommodation data from multiple external JSON sources, storing them in MongoDB, and exposing them through an API endpoint with filtering capabilities.

## Project Setup

### Prerequisites

- Node.js
- Docker and Docker Compose, for easy MongoDB setup
  - Alternatively is possible to use a local MongoDB instance
- npm or yarn

### Environment Variables

Create a `.env` file in the root directory. You can copy from `.env.example`:

```bash
cp .env.example .env
```

### Running the Application

```bash
# Install dependencies
npm install

# Start MongoDB
# Alternatively, use yourr local MongoDB instance
docker compose up -d

# Development mode (with hot reload)
npm run start:dev
```

The application will:
1. Connect to MongoDB
2. Start the HTTP server (default: http://localhost:3000)
3. Automatically run ingestion every hour (configurable via `INGESTION_CRON`)

## API Endpoints

See [the API_ENDPOINTS.md file](API_ENDPOINTS.md) for details of the API structure.

## Extending the Solution for New Data Sources

See [the EXTENDING_SOLUTION.md file](EXTENDING_SOLUTION.md) for details on how to extend the solution for new data sources.
