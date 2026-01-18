import {
  geoEqualEarth,
  geoAlbers,
  geoAlbersUsa,
  geoAzimuthalEqualArea,
  geoAzimuthalEquidistant,
  geoConicConformal,
  geoConicEqualArea,
  geoConicEquidistant,
  geoEquirectangular,
  geoGnomonic,
  geoMercator,
  geoNaturalEarth1,
  geoOrthographic,
  geoStereographic,
  geoTransverseMercator,
} from 'd3-geo';
import { ProjectionType, ProjectionFactory } from '../models';

// All the different map projections we support
// Each one transforms the globe into a flat map differently
export const projectionMap: Record<ProjectionType, ProjectionFactory> = {
  geoEqualEarth,
  geoAlbers,
  geoAlbersUsa,
  geoAzimuthalEqualArea,
  geoAzimuthalEquidistant,
  geoConicConformal,
  geoConicEqualArea,
  geoConicEquidistant,
  geoEquirectangular,
  geoGnomonic,
  geoMercator,
  geoNaturalEarth1,
  geoOrthographic,
  geoStereographic,
  geoTransverseMercator,
};

// Get the right projection function based on the name you want
export function getProjectionFactory(type: ProjectionType): ProjectionFactory {
  const factory = projectionMap[type];
  if (!factory) {
    console.warn(`Unknown projection type: ${type}. Falling back to geoEqualEarth.`);
    return geoEqualEarth;
  }
  return factory;
}
