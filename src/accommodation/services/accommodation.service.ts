import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Accommodation,
  AccommodationDocument,
} from '../schemas/accommodation.schema';
import { FilterAccommodationDto } from '../dtos/filter-accommodation.dto';

@Injectable()
export class AccommodationService {
  constructor(
    @InjectModel(Accommodation.name)
    private accommodationModel: Model<AccommodationDocument>,
  ) {}

  async findAll(filters: FilterAccommodationDto) {
    const query = this.buildQuery(filters);
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.accommodationModel.find(query).skip(skip).limit(limit).lean().exec(),
      this.accommodationModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private buildQuery(filters: FilterAccommodationDto) {
    const query: Record<string, unknown> = {};

    // Exact match filters
    if (filters.sourceId) {
      query.sourceId = filters.sourceId;
    }

    if (filters.source) {
      query.source = filters.source;
    }

    if (filters.name) {
      query.name = { $regex: filters.name, $options: 'i' }; // Case-insensitive partial match
    }

    if (filters.city) {
      query.city = { $regex: filters.city, $options: 'i' }; // Case-insensitive partial match
    }

    if (filters.country) {
      query.country = { $regex: filters.country, $options: 'i' }; // Case-insensitive partial match
    }

    // Boolean filters
    if (filters.isAvailable !== undefined) {
      console.log('filters.isAvailable', filters.isAvailable);
      query.isAvailable = filters.isAvailable;
    }

    if (filters.priceSegment) {
      query.priceSegment = filters.priceSegment;
    }

    // Numeric range filter for price
    if (
      filters.pricePerNightMin !== undefined ||
      filters.pricePerNightMax !== undefined
    ) {
      const priceQuery: { $gte?: number; $lte?: number } = {};

      if (filters.pricePerNightMin !== undefined) {
        priceQuery.$gte = filters.pricePerNightMin;
      }

      if (filters.pricePerNightMax !== undefined) {
        priceQuery.$lte = filters.pricePerNightMax;
      }

      query.pricePerNight = priceQuery;
    }

    return query;
  }
}
