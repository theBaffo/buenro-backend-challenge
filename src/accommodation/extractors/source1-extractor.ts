import { Injectable } from '@nestjs/common';
import { Accommodation } from '../schemas/accommodation.schema';
import { BaseExtractor } from './base-extractor';

interface Source1RawData {
  id: number;
  name?: string;
  address?: {
    country?: string;
    city?: string;
  };
  isAvailable?: boolean;
  priceForNight?: number;
}

@Injectable()
export class Source1Extractor extends BaseExtractor {
  protected readonly sourceName = 'source1';

  extract(rawData: unknown[]): Accommodation[] {
    return rawData
      .filter((item): item is Source1RawData => this.isValidItem(item))
      .map((item) => this.transformItem(item));
  }

  private isValidItem(item: unknown): item is Source1RawData {
    if (!item || typeof item !== 'object') {
      return false;
    }

    const obj = item as Record<string, unknown>;

    return (
      typeof obj.id === 'number' && obj.id !== null && obj.id !== undefined
    );
  }

  private transformItem(item: Source1RawData): Accommodation {
    const accommodation = this.createAccommodation(
      item.id.toString(),
      item as unknown as Record<string, unknown>,
    );

    if (item.priceForNight !== undefined) {
      accommodation.pricePerNight = this.getNumber(item.priceForNight);
    }

    if (item.name) {
      accommodation.name = this.getString(item.name);
    }

    if (item.address) {
      if (item.address.country) {
        accommodation.country = this.getString(item.address.country);
      }

      if (item.address.city) {
        accommodation.city = this.getString(item.address.city);
      }
    }

    if (item.isAvailable !== undefined) {
      accommodation.isAvailable = this.getBoolean(item.isAvailable);
    }

    return accommodation;
  }
}
