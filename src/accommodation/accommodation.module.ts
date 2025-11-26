import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import {
  Accommodation,
  AccommodationSchema,
} from './schemas/accommodation.schema';
import { AccommodationController } from './controllers/accommodation.controller';
import { IngestionController } from './controllers/ingestion.controller';
import { AccommodationService } from './services/accommodation.service';
import { IngestionService } from './services/ingestion.service';
import { IngestionTask } from './tasks/ingestion.task';
import { DownloaderService } from './services/downloader.service';
import { Source1Extractor } from './extractors/source1-extractor';
import { Source2Extractor } from './extractors/source2-extractor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Accommodation.name, schema: AccommodationSchema },
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [AccommodationController, IngestionController],
  providers: [
    AccommodationService,
    IngestionService,
    IngestionTask,
    DownloaderService,
    Source1Extractor,
    Source2Extractor,
  ],
})
export class AccommodationModule implements OnModuleInit {
  constructor(
    private readonly ingestionService: IngestionService,
    private readonly source1Extractor: Source1Extractor,
    private readonly source2Extractor: Source2Extractor,
  ) {}

  onModuleInit() {
    // Configure data sources after module initialization
    const dataSources = [
      {
        url: 'https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/structured_generated_data.json',
        extractor: this.source1Extractor,
        sourceName: 'source1',
      },
      {
        url: 'https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/large_generated_data.json',
        extractor: this.source2Extractor,
        sourceName: 'source2',
      },
    ];

    this.ingestionService.setDataSources(dataSources);
  }
}
