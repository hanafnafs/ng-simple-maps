/**
 * SVG style properties for different interaction states
 */
export interface StyleState {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'miter' | 'round' | 'bevel';
  strokeDasharray?: string;
  opacity?: number;
  fillOpacity?: number;
  strokeOpacity?: number;
}

/**
 * Style states for interactive elements (default, hover, pressed)
 */
export interface StyleStates {
  default?: StyleState;
  hover?: StyleState;
  pressed?: StyleState;
}

/**
 * Connector properties for annotations
 */
export interface ConnectorProps extends StyleState {
  /**
   * Connector line type
   */
  type?: 'straight' | 'curved';
}

/**
 * Coordinate tuple [longitude, latitude]
 */
export type Coordinates = [number, number];

/**
 * Line coordinates configuration
 */
export interface LineCoordinates {
  /**
   * Start coordinates [longitude, latitude]
   */
  from?: Coordinates;

  /**
   * End coordinates [longitude, latitude]
   */
  to?: Coordinates;

  /**
   * Array of coordinates for multi-segment lines
   */
  coordinates?: Coordinates[];
}

/**
 * Graticule step configuration
 */
export type GraticuleStep = [number, number];
