# API Endpoints

**Note**: inside the [postman](postman) folder you can find a Postman collection file which can help you test the API easily.

## GET /accommodations

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
      "country": "France",
      "city": "Paris",
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

## POST /ingestion/trigger

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