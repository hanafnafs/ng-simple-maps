import { Coordinates } from './component-props.types';

// Info about when the user moves the map around
export interface MoveEvent {
  // Where the center of the map is now
  coordinates: Coordinates;

  // How zoomed in the map is
  zoom: number;

  // Is the user currently dragging the map?
  dragging?: boolean;
}

// Info about zoom events
export interface ZoomEvent {
  // X position of where the zoom is centered
  x: number;

  // Y position of where the zoom is centered
  y: number;

  // How much to zoom (1 = normal size)
  k: number;
}

// Info about when someone interacts with a country
export interface GeographyEvent {
  // The actual click or touch event
  event: MouseEvent | PointerEvent;

  // Data about the country that was clicked
  geography: any;
}
