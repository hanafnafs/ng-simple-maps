// Position on the map (longitude first, then latitude)
export type MarkerCoordinates = [number, number];

// Settings for a marker on the map
export interface MarkerConfig {
  // Where to put the marker on the map
  coordinates: MarkerCoordinates;

  // How big the marker should be (for circles)
  radius?: number;

  // What color to fill the marker with
  fill?: string;

  // What color the border should be
  stroke?: string;

  // How thick the border should be
  strokeWidth?: number;

  // How see-through the marker is (0 = invisible, 1 = solid)
  opacity?: number;
}
