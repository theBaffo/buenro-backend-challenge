import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Accommodation,
  AccommodationDocument,
} from '../schemas/accommodation.schema';
import { DownloaderService } from './downloader.service';
import { BaseExtractor } from '../extractors/base-extractor';

interface DataSource {
  url: string;
  extractor: BaseExtractor;
  sourceName: string;
}

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    @InjectModel(Accommodation.name)
    private accommodationModel: Model<AccommodationDocument>,
    private downloaderService: DownloaderService,
  ) {}

  /**
   * Register data sources for ingestion
   */
  private getDataSources(): DataSource[] {
    // This will be injected via module configuration
    // For now, we'll use a method that can be overridden
    return [];
  }

  /**
   * Set data sources (called by module)
   */
  setDataSources(sources: DataSource[]): void {
    this.dataSources = sources;
  }

  private dataSources: DataSource[] = [];

  /**
   * Ingest data from all registered sources
   */
  async ingestAll(): Promise<void> {
    const sources =
      this.dataSources.length > 0 ? this.dataSources : this.getDataSources();

    if (sources.length === 0) {
      this.logger.warn('No data sources configured');
      return;
    }

    this.logger.log(`Starting ingestion from ${sources.length} source(s)`);

    for (const source of sources) {
      try {
        await this.ingestFromSource(source);
      } catch (error) {
        this.logger.error(
          `Failed to ingest from ${source.sourceName}: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
          error instanceof Error ? error.stack : undefined,
        );

        // Continue with other sources even if one fails
      }
    }

    this.logger.log('Ingestion completed');
  }

  /**
   * Ingest data from a single source
   */
  async ingestFromSource(source: DataSource): Promise<void> {
    this.logger.log(`Ingesting from ${source.sourceName}...`);

    // Fetch raw data
    const rawData = await this.downloaderService.fetchData(source.url);

    // Extract and transform using the appropriate extractor
    const accommodations = source.extractor.extract(rawData);

    if (accommodations.length === 0) {
      this.logger.warn(
        `No valid accommodations extracted from ${source.sourceName}`,
      );
      return;
    }

    // Upsert accommodations (update if exists, insert if not)
    // Using bulkWrite for better performance
    const bulkOps = accommodations.map((acc) => ({
      updateOne: {
        filter: { source: acc.source, sourceId: acc.sourceId },
        update: { $set: acc },
        upsert: true,
      },
    }));

    const result = await this.accommodationModel.bulkWrite(bulkOps, {
      ordered: false, // Continue even if some operations fail
    });

    this.logger.log(
      `Ingested ${result.upsertedCount + result.modifiedCount} accommodations from ${source.sourceName} (${result.upsertedCount} new, ${result.modifiedCount} updated)`,
    );
  }
}
