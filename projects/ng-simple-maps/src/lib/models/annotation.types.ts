// Position for an annotation (longitude first, then latitude)
export type AnnotationCoordinates = [number, number];

// How the line connecting the dot to the text should look
export interface ConnectorStyle {
  stroke?: string;
  strokeWidth?: number;
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'miter' | 'round' | 'bevel';
  strokeDasharray?: string;
}

// The little dot that marks what you're labeling
export interface AnnotationSubject {
  radius?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

// Settings for a text label with a pointer line
export interface AnnotationConfig {
  // Where on the map to point to
  coordinates: AnnotationCoordinates;

  // How far to move the text from the point
  dx?: number;
  dy?: number;

  // How curved the connecting line should be
  curve?: number;

  // How the connecting line should look
  connectorStyle?: ConnectorStyle;

  // How the little dot should look
  subjectStyle?: AnnotationSubject;
}
