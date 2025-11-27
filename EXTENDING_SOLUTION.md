# Extending the Solution for New Data Sources

Adding a new data source is straightforward thanks to the abstract extraction pattern:

## Step 1: Create a New Extractor

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

## Step 2: Register the Extractor in the Module

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