import {
  Directive,
  input,
  inject,
  effect,
  Renderer2,
  ElementRef
} from '@angular/core';
import { MAP_CONTEXT } from '../tokens/map-context.token';
import { AnnotationCoordinates, ConnectorStyle, AnnotationSubject } from '../models';

/**
 * Directive for adding annotations (labels with connector lines) to map locations
 *
 * Renders a point marker, connector line, and text label at geographic coordinates.
 * Must be used on ng-container inside an SVG element.
 *
 * @example
 * Basic annotation:
 * ```html
 * <asm-composable-map>
 *   <ng-container
 *     [asmAnnotation]="[-74.006, 40.7128]"
 *     text="New York">
 *   </ng-container>
 * </asm-composable-map>
 * ```
 *
 * @example
 * Customized annotation with curved connector:
 * ```html
 * <ng-container
 *   [asmAnnotation]="[139.6917, 35.6895]"
 *   text="Tokyo"
 *   [dx]="50"
 *   [dy]="-40"
 *   [curve]="0.5"
 *   [fontSize]="16"
 *   connectorStroke="#FF5533"
 *   subjectFill="#FF5533">
 * </ng-container>
 * ```
 */
@Directive({
  selector: '[asmAnnotation]',
  standalone: true
})
export class AnnotationDirective {
  private readonly mapContext = inject(MAP_CONTEXT);
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private annotationGroup: SVGGElement | null = null;

  /**
   * Geographic coordinates [longitude, latitude]
   */
  coordinates = input.required<AnnotationCoordinates>({ alias: 'asmAnnotation' });

  /**
   * Annotation text
   */
  text = input<string>('');

  /**
   * Horizontal offset from coordinate (pixels)
   */
  dx = input<number>(30);

  /**
   * Vertical offset from coordinate (pixels)
   */
  dy = input<number>(-30);

  /**
   * Connector curve amount (0 = straight, 1 = curved)
   */
  curve = input<number>(0);

  /**
   * Subject (point) radius
   */
  subjectRadius = input<number>(4);

  /**
   * Subject fill color
   */
  subjectFill = input<string>('#FF5533');

  /**
   * Subject stroke color
   */
  subjectStroke = input<string>('#FFFFFF');

  /**
   * Subject stroke width
   */
  subjectStrokeWidth = input<number>(1);

  /**
   * Connector stroke color
   */
  connectorStroke = input<string>('#FF5533');

  /**
   * Connector stroke width
   */
  connectorStrokeWidth = input<number>(1);

  /**
   * Text fill color
   */
  textFill = input<string>('#000000');

  /**
   * Text font size
   */
  fontSize = input<number>(14);

  /**
   * Text font weight
   */
  fontWeight = input<string | number>('normal');

  /**
   * Text anchor (alignment)
   */
  textAnchor = input<'start' | 'middle' | 'end'>('start');

  constructor() {
    effect(() => {
      this.renderAnnotation();
    });
  }

  private renderAnnotation(): void {
    const context = this.mapContext();
    const coords = this.coordinates();
    const hostElement = this.elementRef.nativeElement;
    const parentElement = this.renderer.parentNode(hostElement);

    // Project coordinates to pixel space
    const projected = context.projection(coords);
    if (!projected) {
      console.warn('Failed to project annotation coordinates:', coords);
      return;
    }

    const [x, y] = projected;
    const endX = x + this.dx();
    const endY = y + this.dy();

    // Remove existing annotation group if any
    if (this.annotationGroup) {
      this.renderer.removeChild(parentElement, this.annotationGroup);
    }

    // Create annotation group
    this.annotationGroup = this.renderer.createElement('g', 'svg');
    this.renderer.setAttribute(this.annotationGroup, 'data-asm-annotation', 'true');

    // Create connector line (curved if curve > 0)
    const connector = this.renderer.createElement('path', 'svg');
    const pathData = this.curve() > 0
      ? this.createCurvedPath(x, y, endX, endY, this.curve())
      : `M${x},${y} L${endX},${endY}`;

    this.renderer.setAttribute(connector, 'd', pathData);
    this.renderer.setAttribute(connector, 'stroke', this.connectorStroke());
    this.renderer.setAttribute(connector, 'stroke-width', String(this.connectorStrokeWidth()));
    this.renderer.setAttribute(connector, 'fill', 'none');
    this.renderer.appendChild(this.annotationGroup, connector);

    // Create subject (point marker)
    const subject = this.renderer.createElement('circle', 'svg');
    this.renderer.setAttribute(subject, 'cx', String(x));
    this.renderer.setAttribute(subject, 'cy', String(y));
    this.renderer.setAttribute(subject, 'r', String(this.subjectRadius()));
    this.renderer.setAttribute(subject, 'fill', this.subjectFill());
    this.renderer.setAttribute(subject, 'stroke', this.subjectStroke());
    this.renderer.setAttribute(subject, 'stroke-width', String(this.subjectStrokeWidth()));
    this.renderer.appendChild(this.annotationGroup, subject);

    // Create text label
    if (this.text()) {
      const textElement = this.renderer.createElement('text', 'svg');
      this.renderer.setAttribute(textElement, 'x', String(endX));
      this.renderer.setAttribute(textElement, 'y', String(endY));
      this.renderer.setAttribute(textElement, 'fill', this.textFill());
      this.renderer.setAttribute(textElement, 'font-size', String(this.fontSize()));
      this.renderer.setAttribute(textElement, 'font-weight', String(this.fontWeight()));
      this.renderer.setAttribute(textElement, 'text-anchor', this.textAnchor());
      this.renderer.setAttribute(textElement, 'dy', '0.35em');

      const textNode = this.renderer.createText(this.text());
      this.renderer.appendChild(textElement, textNode);
      this.renderer.appendChild(this.annotationGroup, textElement);
    }

    // Insert annotation group into SVG
    const nextSibling = this.renderer.nextSibling(hostElement);
    if (nextSibling) {
      this.renderer.insertBefore(parentElement, this.annotationGroup, nextSibling);
    } else {
      this.renderer.appendChild(parentElement, this.annotationGroup);
    }
  }

  private createCurvedPath(x1: number, y1: number, x2: number, y2: number, curve: number): string {
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Control point for quadratic curve
    const controlX = x1 + dx / 2;
    const controlY = y1 + dy / 2 - (dx * curve * 0.5);

    return `M${x1},${y1} Q${controlX},${controlY} ${x2},${y2}`;
  }
}
