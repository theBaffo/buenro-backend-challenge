import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { IngestionService } from '../services/ingestion.service';

@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  async triggerIngestion() {
    try {
      await this.ingestionService.ingestAll();

      return {
        success: true,
        message: 'Ingestion completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Ingestion failed with unknown error',
        error: error instanceof Error ? error.stack : undefined,
      };
    }
  }
}
