import { Injectable } from '@nestjs/common';
import { Accommodation } from '../schemas/accommodation.schema';
import { BaseExtractor } from './base-extractor';

interface Source2RawData {
  id: string;
  city?: string;
  availability?: boolean;
  priceSegment?: string;
  pricePerNight?: number;
}

@Injectable()
export class Source2Extractor extends BaseExtractor {
  protected readonly sourceName = 'source2';

  extract(rawData: unknown[]): Accommodation[] {
    return rawData
      .filter((item): item is Source2RawData => this.isValidItem(item))
      .map((item) => this.transformItem(item));
  }

  private isValidItem(item: unknown): item is Source2RawData {
    if (!item || typeof item !== 'object') {
      return false;
    }

    const obj = item as Record<string, unknown>;

    return typeof obj.id === 'string' && obj.id.length > 0;
  }

  private transformItem(item: Source2RawData): Accommodation {
    const accommodation = this.createAccommodation(
      item.id,
      item as unknown as Record<string, unknown>,
    );

    if (item.pricePerNight !== undefined) {
      accommodation.pricePerNight = item.pricePerNight;
    }

    if (item.city) {
      accommodation.city = this.getString(item.city);
    }

    // Map availability to isAvailable (unified field)
    if (item.availability !== undefined) {
      accommodation.isAvailable = this.getBoolean(item.availability);
    }

    // Only include priceSegment if provided by source (not calculated)
    if (item.priceSegment) {
      accommodation.priceSegment = this.getString(item.priceSegment);
    }

    return accommodation;
  }
}
