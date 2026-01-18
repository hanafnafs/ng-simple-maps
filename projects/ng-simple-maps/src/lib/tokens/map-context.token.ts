import { InjectionToken, Signal } from '@angular/core';
import { GeoProjection, GeoPath } from 'd3-geo';

// Shared map info that all components can access
// Contains the projection, drawing functions, and size
export interface MapContext {
  // Function that converts lat/lng to screen coordinates
  projection: GeoProjection;

  // Function that converts geographic shapes to SVG paths
  path: GeoPath;

  // How wide the map is
  width: number;

  // How tall the map is
  height: number;
}

// Angular dependency injection token for sharing map data between components
// Uses Angular signals so components update when the map changes
export const MAP_CONTEXT = new InjectionToken<Signal<MapContext>>(
  'MAP_CONTEXT',
  {
    providedIn: null,
    factory: () => {
      throw new Error(
        'MAP_CONTEXT token must be provided by ComposableMapComponent. ' +
        'Ensure this component is wrapped in an asm-composable-map component.'
      );
    }
  }
);
