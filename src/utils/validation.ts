// Input validation utilities for security

export function validateCoordinates(lat: number, lon: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

export function sanitizeSearchQuery(query: string): string {
  // Remove potentially dangerous characters, limit length
  return query
    .trim()
    .slice(0, 100) // Limit length
    .replace(/[<>]/g, ''); // Remove HTML brackets
}

export function validateLocation(location: { lat: number; lon: number }): boolean {
  return validateCoordinates(location.lat, location.lon);
}

