import {
  Directive,
  input,
  inject,
  effect,
  Renderer2,
  ElementRef,
  contentChild,
  TemplateRef,
  ViewContainerRef,
  EmbeddedViewRef
} from '@angular/core';
import { MAP_CONTEXT } from '../tokens/map-context.token';
import { MarkerCoordinates } from '../models';

// Directive to put markers at specific places on the map
// You can use simple circles or create your own custom marker shapes
// Must be used inside the map's SVG
//
// Simple example: <ng-container [asmMarker]="[-74.006, 40.7128]"></ng-container>
// Custom shape: Add an <ng-template> with your own SVG inside
@Directive({
  selector: '[asmMarker]',
  standalone: true
})
export class MarkerDirective {
  private readonly mapContext = inject(MAP_CONTEXT);
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private markerGroup: SVGGElement | null = null;
  private embeddedView: EmbeddedViewRef<any> | null = null;

  // Where to place the marker on the map
  coordinates = input.required<MarkerCoordinates>({ alias: 'asmMarker' });

  // How big the circle should be (if using default marker)
  radius = input<number>(5);

  // What color to fill the marker with
  fill = input<string>('#FF5533');

  // Color for the marker's border
  stroke = input<string>('#FFFFFF');

  // How thick the border should be
  strokeWidth = input<number>(1);

  // How see-through the marker should be (0-1)
  opacity = input<number>(1);

  // Custom SVG content to use instead of a circle
  customTemplate = contentChild(TemplateRef);

  constructor() {
    effect(() => {
      this.renderMarker();
    });
  }

  private renderMarker(): void {
    const context = this.mapContext();
    const coords = this.coordinates();
    const hostElement = this.elementRef.nativeElement;
    const parentElement = this.renderer.parentNode(hostElement);

    // Convert lat/lng to screen pixels
    const projected = context.projection(coords);
    if (!projected) {
      console.warn('Failed to project marker coordinates:', coords);
      return;
    }

    const [x, y] = projected;

    // Clean up any old marker that was already drawn
    if (this.markerGroup) {
      this.renderer.removeChild(parentElement, this.markerGroup);
      if (this.embeddedView) {
        this.embeddedView.destroy();
        this.embeddedView = null;
      }
    }

    // Make a group to hold all the marker elements
    this.markerGroup = this.renderer.createElement('g', 'svg');
    this.renderer.setAttribute(this.markerGroup, 'data-asm-marker', 'true');
    this.renderer.setAttribute(this.markerGroup, 'transform', `translate(${x}, ${y})`);

    const template = this.customTemplate();
    if (template) {
      // Use the custom SVG template
      this.embeddedView = this.viewContainerRef.createEmbeddedView(template);
      this.embeddedView.detectChanges();

      // Put the custom elements into our marker group
      this.embeddedView.rootNodes.forEach(node => {
        this.renderer.appendChild(this.markerGroup, node);
      });
    } else {
      // Just draw a simple circle
      const circle = this.renderer.createElement('circle', 'svg');
      this.renderer.setAttribute(circle, 'r', String(this.radius()));
      this.renderer.setAttribute(circle, 'fill', this.fill());
      this.renderer.setAttribute(circle, 'stroke', this.stroke());
      this.renderer.setAttribute(circle, 'stroke-width', String(this.strokeWidth()));
      this.renderer.setAttribute(circle, 'opacity', String(this.opacity()));
      this.renderer.appendChild(this.markerGroup, circle);
    }

    // Add the marker to the map
    const nextSibling = this.renderer.nextSibling(hostElement);
    if (nextSibling) {
      this.renderer.insertBefore(parentElement, this.markerGroup, nextSibling);
    } else {
      this.renderer.appendChild(parentElement, this.markerGroup);
    }
  }
}
