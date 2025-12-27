import mongoose, { Schema, Document } from 'mongoose';

export interface IForecastCache extends Document {
  locationKey: string; // "lat,lon"
  modelName: string; // Renamed from 'model' to avoid Mongoose conflict
  data: any;
  expiresAt: Date;
  createdAt: Date;
}

const ForecastCacheSchema = new Schema<IForecastCache>({
  locationKey: { type: String, required: true, index: true },
  modelName: { type: String, required: true, index: true }, // Renamed from 'model'
  data: { type: Schema.Types.Mixed, required: true },
  expiresAt: { type: Date, required: true, index: true, expires: 0 }, // TTL index
  createdAt: { type: Date, default: Date.now }
});

// Compound index for faster lookups
ForecastCacheSchema.index({ locationKey: 1, modelName: 1 });

export const ForecastCache = mongoose.model<IForecastCache>('ForecastCache', ForecastCacheSchema);

