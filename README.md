# Buenro Backend Challenge - Accommodation Data Ingestion System

A NestJS-based backend solution for ingesting accommodation data from multiple external JSON sources stored in AWS S3, storing them in MongoDB, and exposing them through an API endpoint with filtering capabilities.

## Architecture Overview

The solution is built with a modular, extensible architecture:

- **Accommodation Module**: Core module handling all accommodation-related functionality
- **Abstract Extraction Pattern**: Base extractor class allows easy addition of new data sources
- **Scheduled Ingestion**: Automatic data ingestion at regular intervals
- **Manual Ingestion**: Ability to invoke a manual ingestion through an API call
- **Unified Data Model**: Single schema that accommodates data from different sources
- **Flexible Filtering**: API supports filtering on any attribute with partial text matching and numeric ranges

## Tech Stack

- **TypeScript**: Type-safe development
- **NestJS**: Progressive Node.js framework
- **MongoDB**: Document database with Mongoose ODM
- **Class Validator**: Request validation
- **NestJS Schedule**: Cron-based scheduled tasks

## Project Setup

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose (for easy MongoDB setup, alternatively is possible to use a local MongoDB instance)
- npm or yarn

### Installation

```bash
npm install
```

### Quick Start with Docker Compose

The easiest way to get started is using Docker Compose to run MongoDB:

```bash
# Copy the example environment file
cp .env.example .env

# Start MongoDB
docker-compose up -d

```


This will start a MongoDB container with:
- Username: `admin`
- Password: `password`
- Database: `buenro-accommodations`
- Port: `27017`

The `.env.example` file is pre-configured to connect to this MongoDB instance.

### Environment Variables

Create a `.env` file in the root directory. You can copy from `.env.example`:

```bash
cp .env.example .env
```

**Note:** If you're using your own MongoDB instance (not Docker Compose), update the `MONGODB_URI` accordingly.

### Running the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The application will:
1. Connect to MongoDB
2. Start the HTTP server (default: http://localhost:3000)
3. Automatically run ingestion every hour (configurable via `INGESTION_CRON`)

## API Endpoints

### GET /accommodations

Retrieve accommodations with flexible filtering options.

**Query Parameters:**

- `sourceId` (string): Filter by exact source ID
- `source` (string): Filter by source name (e.g., 'source1', 'source2')
- `name` (string): Partial text match on accommodation name (case-insensitive)
- `city` (string): Partial text match on city (case-insensitive)
- `country` (string): Partial text match on country (case-insensitive)
- `pricePerNightMin` (number): Minimum price per night
- `pricePerNightMax` (number): Maximum price per night
- `isAvailable` (boolean): Filter by availability
- `priceSegment` (string): Filter by price segment (e.g., 'high', 'medium', 'low')
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Items per page (default: 50, max: 1000)

**Example Requests:**

```bash
# Get all accommodations
curl http://localhost:3000/accommodations

# Filter by city and price range
curl "http://localhost:3000/accommodations?city=Paris&pricePerNightMin=200&pricePerNightMax=500"

# Filter by availability and source
curl "http://localhost:3000/accommodations?isAvailable=true&source=source1"

# Search by name with pagination
curl "http://localhost:3000/accommodations?name=hotel&page=1&limit=20"
```

**Response Format:**

```json
{
  "data": [
    {
      "_id": "...",
      "sourceId": "123456",
      "source": "source1",
      "name": "Luxury Hotel",
      "address": {
        "country": "France",
        "city": "Paris"
      },
      "pricePerNight": 250,
      "isAvailable": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1000,
    "totalPages": 20
  }
}
```

### POST /ingestion/trigger

Manually trigger the ingestion process to fetch and process data from all configured sources.

**Request:** No body required

**Example Request:**

```bash
# Trigger ingestion manually
curl -X POST http://localhost:3000/ingestion/trigger
```

**Response Format:**

```json
{
  "success": true,
  "message": "Ingestion completed successfully"
}
```

On error:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "error": "Stack trace (if available)"
}
```

## Data Model

The unified `Accommodation` schema includes:

- `sourceId`: Original ID from the source
- `source`: Source identifier ('source1' or 'source2')
- `name`: Accommodation name (optional)
- `address`: Object with `country` and `city` (optional)
- `city`: city of the accomodation (optional)
- `country`: country of the accomodation (optional)
- `pricePerNight`: Price per night (optional)
- `isAvailable`: Availability boolean (source1)
- `priceSegment`: Price segment if provided by source (not calculated)
- `rawData`: Original data from source for debugging/extensibility

**Indexes:**
- Individual indexes on frequently queried fields
- Compound indexes for common query patterns (city + price, address.city + price)
- Unique compound index on (source, sourceId) to prevent duplicates

## Extending the Solution for New Data Sources

Adding a new data source is straightforward thanks to the abstract extraction pattern:

### Step 1: Create a New Extractor

Create a new file in `src/accommodation/extractors/` (e.g., `source3-extractor.ts`):

```typescript
import { Injectable } from '@nestjs/common';
import { Accommodation } from '../schemas/accommodation.schema';
import { BaseExtractor } from './base-extractor';

interface Source3RawData {
  id: string;
  // Define the structure of your new source
  propertyName?: string;
  location?: string;
  price?: number;
  // ... other fields
}

@Injectable()
export class Source3Extractor extends BaseExtractor {
  protected readonly sourceName = 'source3';

  extract(rawData: unknown[]): Accommodation[] {
    return rawData
      .filter((item): item is Source3RawData => this.isValidItem(item))
      .map((item) => this.transformItem(item));
  }

  private isValidItem(item: unknown): item is Source3RawData {
    if (!item || typeof item !== 'object') {
      return false;
    }
    const obj = item as Record<string, unknown>;
    // Validate required fields
    return (
      typeof obj.id === 'string' &&
      obj.id.length > 0
    );
  }

  private transformItem(item: Source3RawData): Accommodation {
    const accommodation = this.createAccommodation(
      item.id,
      item as unknown as Record<string, unknown>,
    );

    // Map source-specific fields to unified schema
    if (item.propertyName) {
      accommodation.name = this.getString(item.propertyName);
    }

    // Add any other mappings as needed
    // Note: Only include priceSegment if provided by source

    return accommodation;
  }
}
```

### Step 2: Register the Extractor in the Module

Update `src/accommodation/accommodation.module.ts`:

```typescript
import { Source3Extractor } from './extractors/source3-extractor';

@Module({
  // ... existing imports
  providers: [
    // ... existing providers
    Source3Extractor, // Add new extractor
  ],
})
export class AccommodationModule implements OnModuleInit {
  constructor(
    // ... existing injections
    private readonly source3Extractor: Source3Extractor, // Inject new extractor
  ) {}

  onModuleInit() {
    const dataSources = [
      // ... existing sources
      {
        url: 'https://your-s3-bucket.s3.region.amazonaws.com/source3-data.json',
        extractor: this.source3Extractor,
        sourceName: 'source3',
      },
    ];
    this.ingestionService.setDataSources(dataSources);
  }
}
```

That's it! The new source will be automatically ingested on the next scheduled run.

### Key Design Principles

1. **Extend BaseExtractor**: All extractors extend `BaseExtractor` which provides helper methods and enforces the `sourceName` property.

2. **Map to Unified Schema**: Transform source-specific data to the unified `Accommodation` schema.

3. **Don't Calculate Fields**: Only include fields that exist in the source data. For example, don't calculate `priceSegment` if it's not provided.

4. **Validation**: Always validate incoming data in `isValidItem()` to ensure data quality.

5. **Error Handling**: The ingestion service continues processing other sources even if one fails.

## Performance Considerations

1. **Streaming Downloads**: The downloader service uses streaming to fetch and parse large JSON files efficiently. Instead of loading entire files into memory, data is processed incrementally as it arrives, making it suitable for handling very large files (150MB+) without memory issues.

2. **Bulk Operations**: Ingestion uses MongoDB `bulkWrite` with upsert for efficient database operations.

3. **Indexing**: Strategic indexes on frequently queried fields and compound indexes for common query patterns.

4. **Pagination**: API responses are paginated to handle large result sets.

5. **Scheduled Ingestion**: Runs automatically without manual intervention, with configurable schedule.

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Notes

- The system handles both small and large JSON files efficiently using streaming downloads that process data incrementally without loading entire files into memory.
- Data is upserted based on `(source, sourceId)` to prevent duplicates while allowing updates.
- The ingestion task runs automatically every hour but can be triggered manually or configured via environment variables.
- All source data is preserved in the `rawData` field for debugging and future extensibility.
