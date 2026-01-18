// Utility functions for creating curved paths and geometric calculations
// Helps with drawing flight paths and other curved lines between points

export class PathHelperUtil {
  /**
   * Create curved path between two points for flight paths and connections
   */
  static createCurvedLinePath(
    projection: any,
    from: [number, number], 
    to: [number, number], 
    curve: number
  ): string {
    const fromProj = projection(from);
    const toProj = projection(to);

    if (!fromProj || !toProj) return '';

    const [x1, y1] = fromProj;
    const [x2, y2] = toProj;

    if (curve === 0) {
      return `M${x1},${y1} L${x2},${y2}`;
    }

    // Calculate midpoint and offset for curve
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Perpendicular offset for the curve
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Perpendicular direction
    const perpX = -dy / dist;
    const perpY = dx / dist;

    // Control point offset (curve amount)
    const offset = dist * curve * 0.3;
    const ctrlX = midX + perpX * offset;
    const ctrlY = midY + perpY * offset;

    return `M${x1},${y1} Q${ctrlX},${ctrlY} ${x2},${y2}`;
  }

  /**
   * Calculate annotation path with optional curve
   */
  static createAnnotationPath(
    x: number, 
    y: number, 
    dx: number, 
    dy: number, 
    curve: number
  ): string {
    const endX = x + dx;
    const endY = y + dy;

    if (curve <= 0) {
      return `M${x},${y} L${endX},${endY}`;
    }

    const midX = x + dx * curve;
    const midY = y + dy * (1 - curve);
    return `M${x},${y} Q${midX},${midY} ${endX},${endY}`;
  }
}