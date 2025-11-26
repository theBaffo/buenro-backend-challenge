import { Accommodation } from '../schemas/accommodation.schema';

export interface AccommodationExtractor {
  /**
   * Extract and transform raw data from a source into unified Accommodation format
   * @param rawData - Raw data from the source (can be any format)
   * @returns Array of Accommodation objects
   */
  extract(rawData: unknown[]): Accommodation[];
}
