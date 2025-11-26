import { Accommodation } from '../schemas/accommodation.schema';
import { AccommodationExtractor } from '../interfaces/accommodation-extractor.interface';

export abstract class BaseExtractor implements AccommodationExtractor {
  protected abstract readonly sourceName: string;

  abstract extract(rawData: unknown[]): Accommodation[];

  /**
   * Helper method to safely get string value
   */
  protected getString(value: unknown): string | undefined {
    if (typeof value === 'string') {
      return value;
    }

    return undefined;
  }

  /**
   * Helper method to safely get number value
   */
  protected getNumber(value: unknown): number | undefined {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }

    return undefined;
  }

  /**
   * Helper method to safely get boolean value
   */
  protected getBoolean(value: unknown): boolean | undefined {
    if (typeof value === 'boolean') {
      return value;
    }

    return undefined;
  }

  /**
   * Helper method to create accommodation object with common fields
   */
  protected createAccommodation(
    sourceId: string,
    rawData: Record<string, unknown>,
  ): Accommodation {
    return {
      sourceId,
      source: this.sourceName,
      rawData,
    } as Accommodation;
  }
}
