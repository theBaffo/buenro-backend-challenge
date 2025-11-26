import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IngestionService } from '../services/ingestion.service';

@Injectable()
export class IngestionTask {
  private readonly logger = new Logger(IngestionTask.name);

  constructor(private readonly ingestionService: IngestionService) {}

  /**
   * Run ingestion every hour
   * Can be configured via environment variable
   */
  @Cron(process.env.INGESTION_CRON || CronExpression.EVERY_HOUR)
  async handleIngestion(): Promise<void> {
    this.logger.log('Starting scheduled ingestion...');
    try {
      await this.ingestionService.ingestAll();
      this.logger.log('Scheduled ingestion completed successfully');
    } catch (error) {
      this.logger.error(
        `Scheduled ingestion failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
