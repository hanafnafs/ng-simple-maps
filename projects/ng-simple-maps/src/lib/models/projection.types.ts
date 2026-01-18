import { GeoProjection } from 'd3-geo';

// All the map projections you can choose from
// Each one shows the world in a different way
export type ProjectionType =
  | 'geoEqualEarth'
  | 'geoAlbers'
  | 'geoAlbersUsa'
  | 'geoAzimuthalEqualArea'
  | 'geoAzimuthalEquidistant'
  | 'geoConicConformal'
  | 'geoConicEqualArea'
  | 'geoConicEquidistant'
  | 'geoEquirectangular'
  | 'geoGnomonic'
  | 'geoMercator'
  | 'geoNaturalEarth1'
  | 'geoOrthographic'
  | 'geoStereographic'
  | 'geoTransverseMercator';

// Settings you can adjust for any map projection
export interface ProjectionConfig {
  // Rotate the globe to show different parts of the world
  rotate?: [number, number, number?];

  // What point should be in the center of the map
  center?: [number, number];

  // How big or small the map should be
  scale?: number;

  // Special setting for cone-shaped projections
  parallels?: [number, number];

  // Move the map left/right or up/down
  translate?: [number, number];

  // How precise the curved lines should be (lower = smoother but slower)
  precision?: number;

  // How much of the globe to show for globe-style projections
  clipAngle?: number;
}

// Function that creates a new projection when called
export type ProjectionFactory = () => GeoProjection;
