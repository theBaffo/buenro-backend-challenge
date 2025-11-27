import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AccommodationDocument = Accommodation & Document;

@Schema({ timestamps: true })
export class Accommodation {
  @Prop({ required: true, index: true })
  sourceId: string; // Original ID from source

  @Prop({ required: true, index: true })
  source: string; // Source identifier (e.g., 'source1', 'source2')

  @Prop({ index: true })
  name?: string;

  @Prop({ index: true })
  country?: string;

  @Prop({ index: true })
  city?: string;

  @Prop({ index: true })
  pricePerNight?: number;

  @Prop({ index: true })
  isAvailable?: boolean;

  @Prop({ index: true })
  priceSegment?: string;

  // Store original data for debugging/extensibility
  @Prop({ type: Object })
  rawData?: Record<string, unknown>;
}

export const AccommodationSchema = SchemaFactory.createForClass(Accommodation);

// Create compound indexes for common query patterns
AccommodationSchema.index({ source: 1, sourceId: 1 }, { unique: true });
AccommodationSchema.index({ city: 1, pricePerNight: 1, isAvailable: 1 });
