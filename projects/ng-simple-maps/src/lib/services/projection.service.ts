import { Injectable } from '@angular/core';
import { GeoProjection } from 'd3-geo';
import { ProjectionType, ProjectionConfig } from '../models';
import { getProjectionFactory } from '../utils';

// Handles creating different map projections (like globe view, flat maps, etc.)
@Injectable({
  providedIn: 'root'
})
export class ProjectionService {
  // Create a map projection with the settings you want
  // This is what turns spherical Earth into a flat map
  createProjection(
    type: ProjectionType = 'geoEqualEarth',
    config: ProjectionConfig = {},
    width: number = 800,
    height: number = 400
  ): GeoProjection {
    // Get the right projection type (globe, flat, etc.)
    const projectionFactory = getProjectionFactory(type);
    const projection = projectionFactory();

    // Set it up with your custom settings
    this.applyProjectionConfig(projection, config, width, height);

    return projection;
  }

  // Apply all the custom settings to the projection
  private applyProjectionConfig(
    projection: GeoProjection,
    config: ProjectionConfig,
    width: number,
    height: number
  ): void {
    // Rotate the globe to show different sides
    if (config.rotate) {
      projection.rotate(config.rotate as [number, number, number]);
    }

    // Center the map on a specific point
    if (config.center) {
      projection.center(config.center);
    }

    // Move the map around
    if (config.translate) {
      projection.translate(config.translate);
    } else {
      // By default, center the map in the middle
      projection.translate([width / 2, height / 2]);
    }

    // Set standard parallels for cone-shaped projections
    if (config.parallels && 'parallels' in projection) {
      (projection as any).parallels(config.parallels);
    }

    // Set how precise the curves should be
    if (config.precision !== undefined) {
      projection.precision(config.precision);
    }

    // Set the viewing angle for globe-like projections
    if (config.clipAngle !== undefined && 'clipAngle' in projection) {
      (projection as any).clipAngle(config.clipAngle);
    }

    // Turn off auto-clipping for Mercator to avoid weird edges
    if ('clipExtent' in projection) {
      (projection as any).clipExtent(null);
    }

    // Set the size or auto-fit to the container
    if (config.scale !== undefined) {
      projection.scale(config.scale);
    } else {
      // Make it fit perfectly in the container
      this.autoFitProjection(projection, width, height);
    }
  }

  // Automatically scale the map to fit perfectly in the available space
  private autoFitProjection(
    projection: GeoProjection,
    width: number,
    height: number
  ): void {
    try {
      // Try to fit the whole world in the container
      projection.fitSize([width, height], { type: 'Sphere' } as any);
    } catch (error) {
      // Some projections can't auto-fit, so use a reasonable default size
      console.warn('Projection does not support auto-fitting. Using default scale.');
      projection.scale(150);
    }
  }
}
