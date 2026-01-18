import { GeoProjection } from 'd3-geo';
import { Coordinates } from '../models';
import { GeographyObject } from '../models';
import { Feature } from 'geojson';

// Create a unique ID for each country/region so Angular can track them
// Tries to use the country's ID or name, falls back to a generic ID
export function generateRsmKey(feature: Feature, index: number): string {
  if (feature.id !== undefined && feature.id !== null) {
    return String(feature.id);
  }

  if (feature.properties) {
    if (feature.properties['name']) {
      return String(feature.properties['name']);
    }
    if (feature.properties['NAME']) {
      return String(feature.properties['NAME']);
    }
  }

  return `geography-${index}`;
}

// Convert latitude/longitude to pixel coordinates on the screen
export function projectCoordinates(
  coordinates: Coordinates,
  projection: GeoProjection
): [number, number] | null {
  return projection(coordinates);
}

// Add unique IDs to all the map features so we can track them properly
export function addKeysToGeographies(features: Feature[]): GeographyObject[] {
  return features.map((feature, index) => ({
    ...feature,
    rsmKey: generateRsmKey(feature, index),
  } as GeographyObject));
}
