// Different shapes you can use for markers
export type MarkerShape = 'circle' | 'diamond' | 'pin' | 'star' | 'custom';

// Settings for a point on the map
export interface MapMarker {
  // Where to put the marker
  coordinates: [number, number];
  // Text to show (optional)
  label?: string;
  // What color the marker should be
  color?: string;
  // Color for the marker's border
  stroke?: string;
  // How big the marker should be (6-12 works well for most icons)
  size?: number;
  // What shape to use (circle, star, etc. or 'custom' for your own icon)
  shape?: MarkerShape;
  // Your own custom icon (when shape is 'custom')
  // You can use:
  // 1. Just the path data: "M21,16V14L13,9..." (most common)
  // 2. Full SVG: "<svg viewBox='0 0 24 24'><path d='...' /></svg>"
  // 3. Or use customSvgUrl to load from a file instead
  customSvg?: string;
  // Path to an SVG file to use as the icon
  customSvgUrl?: string;
  // Size of the custom icon (usually 24, which works for most icons)
  customSvgSize?: number;
  // Extra data you want to store with this marker
  data?: Record<string, unknown>;
}

// Settings for a text label with a pointing line
export interface MapAnnotation {
  // Where to point to on the map
  coordinates: [number, number];
  // The text to show
  text: string;
  // How far right to move the text from the point
  dx?: number;
  // How far down to move the text from the point
  dy?: number;
  // How curved the connecting line should be (0=straight)
  curve?: number;
  // Color of the text and line
  color?: string;
  // How big the text should be
  fontSize?: number;
  // How bold the text should be
  fontWeight?: string | number;
}

// Settings for the hover popup
export interface TooltipConfig {
  // Background color of the tooltip
  backgroundColor?: string;
  // Color of the text inside
  textColor?: string;
  // Color of the title text
  titleColor?: string;
  // Color of the border
  borderColor?: string;
  // How rounded the corners should be
  borderRadius?: number;
}

// Info about when someone clicks or hovers over a country
export interface MapGeographyEvent {
  // Data about the country (name, population, etc.)
  properties: Record<string, unknown>;
  // Unique ID for this country
  id?: string | number;
  // The actual mouse click/hover event
  event: MouseEvent;
}

// Info about when someone clicks a marker
export interface MapMarkerEvent {
  // Which marker got clicked
  marker: MapMarker;
  // Position of this marker in your markers list
  index: number;
  // The actual mouse click/hover event
  event: MouseEvent;
}

// A line connecting two places (like a flight path)
export interface MapLine {
  // Where the line starts
  from: [number, number];
  // Where the line ends
  to: [number, number];
  // What color the line should be
  color?: string;
  // How thick the line should be
  strokeWidth?: number;
  // How curved the line should be (0=straight, higher=more curved)
  curve?: number;
  // Whether to draw a dashed line instead of solid
  dashed?: boolean;
  // Extra data you want to store with this line
  data?: Record<string, unknown>;
}

// Info about when someone clicks a line
export interface MapLineEvent {
  // Which line got clicked
  line: MapLine;
  // Position of this line in your lines list
  index: number;
  // The actual mouse click/hover event
  event: MouseEvent;
}

// Data that maps country names to numbers (for coloring countries by data)
// Keys should match country names in your map data
export type ChoroplethData = Record<string, number>;

// Settings for coloring countries based on data
export interface ChoroplethConfig {
  // Which property in the map data to match against (usually 'name')
  matchKey?: string;
  // Colors to use from lowest to highest values
  colors?: string[];
  // Force a specific minimum value (otherwise calculated automatically)
  minValue?: number;
  // Force a specific maximum value (otherwise calculated automatically)
  maxValue?: number;
  // Color to use for countries that don't have data
  nullColor?: string;
}

// Settings for the grid lines (latitude/longitude lines)
export interface GraticuleConfig {
  // How far apart the grid lines should be (in degrees)
  step?: [number, number];
  // Color of the grid lines
  color?: string;
  // How thick the grid lines should be
  strokeWidth?: number;
  // How see-through the grid lines should be
  opacity?: number;
}
