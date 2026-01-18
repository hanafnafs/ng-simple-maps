import { Feature, Geometry, GeoJsonProperties, FeatureCollection } from 'geojson';
import { Topology, Objects } from 'topojson-specification';

// A map feature (like a country) with extra data for tracking
export interface GeographyObject extends Feature {
  // Special ID so Angular can track changes efficiently
  rsmKey: string;
  geometry: Geometry;
  properties: GeoJsonProperties;
}

// TopoJSON format (compressed map data)
export type TopoJSON = Topology<Objects>;

// GeoJSON format (standard map data)
export type GeoJSON = Feature | FeatureCollection;

// Map data can be a URL to download or the actual data
export type GeographyInput = string | TopoJSON | GeoJSON;

// Map data after we've processed it and made it ready to use
export interface ParsedGeography {
  // What format the original data was in
  type: 'topojson' | 'geojson';

  // All the shapes (countries, states, etc.) ready to draw
  features: GeographyObject[];

  // Border lines between countries (if available)
  borders?: Geometry;

  // Outline of the whole map area (if available)
  outline?: Geometry;
}

// Custom function to modify map data before displaying
export type ParseGeographiesFn = (geographies: GeographyObject[]) => GeographyObject[];
