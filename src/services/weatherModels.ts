import { WeatherModel } from '../types/weather';

export const WEATHER_MODELS: WeatherModel[] = [
  {
    id: 'gfs',
    name: 'GFS',
    provider: 'NOAA',
    description: 'Global Forecast System - Primary US weather model'
  },
  {
    id: 'ecmwf',
    name: 'ECMWF',
    provider: 'European Centre',
    description: 'European Centre for Medium-Range Weather Forecasts'
  },
  {
    id: 'nam',
    name: 'NAM',
    provider: 'NOAA',
    description: 'North American Mesoscale Forecast System'
  },
  {
    id: 'hrrr',
    name: 'HRRR',
    provider: 'NOAA',
    description: 'High-Resolution Rapid Refresh - Short-term forecasts'
  },
  {
    id: 'ukmet',
    name: 'UKMET',
    provider: 'UK Met Office',
    description: 'UK Met Office Global Model'
  },
  {
    id: 'gem',
    name: 'GEM',
    provider: 'Environment Canada',
    description: 'Global Environmental Multiscale Model'
  },
  {
    id: 'jma',
    name: 'JMA',
    provider: 'Japan Meteorological Agency',
    description: 'JMA Global Spectral Model'
  }
];

