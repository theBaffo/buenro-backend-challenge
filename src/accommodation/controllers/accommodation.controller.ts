import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { AccommodationService } from '../services/accommodation.service';
import { FilterAccommodationDto } from '../dtos/filter-accommodation.dto';

@Controller('accommodations')
export class AccommodationController {
  constructor(private readonly accommodationService: AccommodationService) {}

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    filters: FilterAccommodationDto,
  ) {
    return this.accommodationService.findAll(filters);
  }
}
