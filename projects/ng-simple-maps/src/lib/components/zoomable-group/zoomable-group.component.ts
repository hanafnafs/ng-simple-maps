import {
  Directive,
  input,
  output,
  signal,
  computed,
  inject,
  ElementRef,
  Renderer2,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { MAP_CONTEXT } from '../../tokens/map-context.token';

/**
 * Zoom state interface
 */
export interface ZoomState {
  /** Current zoom scale */
  scale: number;
  /** X translation */
  translateX: number;
  /** Y translation */
  translateY: number;
}

/**
 * Zoom event emitted on zoom/pan changes
 */
export interface ZoomableEvent extends ZoomState {
  /** Original DOM event that triggered the zoom */
  sourceEvent?: Event;
}

/**
 * ZoomableGroupDirective - Adds zoom and pan capabilities to map content
 *
 * Apply to an svg:g element to enable zoom and pan functionality.
 * Supports mouse wheel zoom, drag panning, and touch gestures.
 *
 * @example
 * Basic usage:
 * ```html
 * <asm-composable-map [width]="800" [height]="400">
 *   <svg:g asmZoomableGroup #zoomGroup="asmZoomableGroup" [minZoom]="1" [maxZoom]="8">
 *     <ng-container [asmGeographies]="worldData"></ng-container>
 *   </svg:g>
 * </asm-composable-map>
 * ```
 *
 * @example
 * With zoom controls:
 * ```html
 * <svg:g asmZoomableGroup #zoomGroup="asmZoomableGroup" [minZoom]="1" [maxZoom]="8">
 *   <ng-container [asmGeographies]="worldData"></ng-container>
 * </svg:g>
 *
 * <asm-zoom-controls
 *   (zoomIn)="zoomGroup.zoomIn()"
 *   (zoomOut)="zoomGroup.zoomOut()"
 *   (reset)="zoomGroup.resetZoom()">
 * </asm-zoom-controls>
 * ```
 */
@Directive({
  selector: '[asmZoomableGroup]',
  exportAs: 'asmZoomableGroup',
  standalone: true
})
export class ZoomableGroupDirective implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly mapContext = inject(MAP_CONTEXT);

  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private lastTranslateX = 0;
  private lastTranslateY = 0;

  // Bound event handlers for cleanup
  private boundHandleWheel: (e: WheelEvent) => void;
  private boundHandleMouseDown: (e: MouseEvent) => void;
  private boundHandleMouseMove: (e: MouseEvent) => void;
  private boundHandleMouseUp: (e: MouseEvent) => void;
  private boundHandleTouchStart: (e: TouchEvent) => void;
  private boundHandleTouchMove: (e: TouchEvent) => void;
  private boundHandleTouchEnd: (e: TouchEvent) => void;

  /**
   * Minimum zoom level
   */
  minZoom = input<number>(1);

  /**
   * Maximum zoom level
   */
  maxZoom = input<number>(8);

  /**
   * Initial zoom level
   */
  initialZoom = input<number>(1);

  /**
   * Initial center coordinates [x, y] in pixels (relative to map center)
   */
  center = input<[number, number]>([0, 0]);

  /**
   * Zoom sensitivity for mouse wheel (higher = faster zoom)
   */
  zoomSensitivity = input<number>(0.001);

  /**
   * Whether zoom on scroll is enabled
   */
  enableWheelZoom = input<boolean>(true);

  /**
   * Whether pan on drag is enabled
   */
  enablePan = input<boolean>(true);

  /**
   * Whether to enable touch gestures
   */
  enableTouch = input<boolean>(true);

  /**
   * Emits when zoom or pan changes
   */
  zoomChange = output<ZoomableEvent>();

  /**
   * Emits when zoom starts (mouse down or touch start)
   */
  zoomStart = output<ZoomableEvent>();

  /**
   * Emits when zoom ends (mouse up or touch end)
   */
  zoomEnd = output<ZoomableEvent>();

  // Internal zoom state
  private readonly _scale = signal(1);
  private readonly _translateX = signal(0);
  private readonly _translateY = signal(0);

  /**
   * Current zoom scale (read-only)
   */
  readonly scale = this._scale.asReadonly();

  /**
   * Current X translation (read-only)
   */
  readonly translateX = this._translateX.asReadonly();

  /**
   * Current Y translation (read-only)
   */
  readonly translateY = this._translateY.asReadonly();

  /**
   * Computed SVG transform string
   */
  readonly transform = computed(() => {
    const ctx = this.mapContext();
    const centerX = ctx.width / 2;
    const centerY = ctx.height / 2;
    const s = this._scale();
    const tx = this._translateX();
    const ty = this._translateY();

    return `translate(${centerX + tx}, ${centerY + ty}) scale(${s}) translate(${-centerX}, ${-centerY})`;
  });

  constructor() {
    // Bind event handlers
    this.boundHandleWheel = this.handleWheel.bind(this);
    this.boundHandleMouseDown = this.handleMouseDown.bind(this);
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundHandleMouseUp = this.handleMouseUp.bind(this);
    this.boundHandleTouchStart = this.handleTouchStart.bind(this);
    this.boundHandleTouchMove = this.handleTouchMove.bind(this);
    this.boundHandleTouchEnd = this.handleTouchEnd.bind(this);
  }

  ngAfterViewInit(): void {
    // Set initial zoom
    this._scale.set(this.initialZoom());

    // Set initial center offset
    const [cx, cy] = this.center();
    this._translateX.set(cx);
    this._translateY.set(cy);

    // Apply initial transform
    this.updateTransform();

    // Set cursor style
    this.renderer.setStyle(this.elementRef.nativeElement, 'cursor', 'grab');

    // Get the SVG element (parent of our g element)
    const svg = this.getSvgElement();
    if (!svg) return;

    // Add event listeners
    if (this.enableWheelZoom()) {
      svg.addEventListener('wheel', this.boundHandleWheel, { passive: false });
    }

    if (this.enablePan()) {
      svg.addEventListener('mousedown', this.boundHandleMouseDown);
      window.addEventListener('mousemove', this.boundHandleMouseMove);
      window.addEventListener('mouseup', this.boundHandleMouseUp);
    }

    if (this.enableTouch()) {
      svg.addEventListener('touchstart', this.boundHandleTouchStart, { passive: false });
      window.addEventListener('touchmove', this.boundHandleTouchMove, { passive: false });
      window.addEventListener('touchend', this.boundHandleTouchEnd);
    }
  }

  ngOnDestroy(): void {
    const svg = this.getSvgElement();
    if (!svg) return;

    svg.removeEventListener('wheel', this.boundHandleWheel);
    svg.removeEventListener('mousedown', this.boundHandleMouseDown);
    window.removeEventListener('mousemove', this.boundHandleMouseMove);
    window.removeEventListener('mouseup', this.boundHandleMouseUp);
    svg.removeEventListener('touchstart', this.boundHandleTouchStart);
    window.removeEventListener('touchmove', this.boundHandleTouchMove);
    window.removeEventListener('touchend', this.boundHandleTouchEnd);
  }

  /**
   * Programmatically zoom in by a step
   */
  zoomIn(step: number = 1.5): void {
    const newScale = Math.min(this._scale() * step, this.maxZoom());
    this._scale.set(newScale);
    this.updateTransform();
    this.emitZoomChange();
  }

  /**
   * Programmatically zoom out by a step
   */
  zoomOut(step: number = 1.5): void {
    const newScale = Math.max(this._scale() / step, this.minZoom());
    this._scale.set(newScale);
    this.updateTransform();
    this.emitZoomChange();
  }

  /**
   * Reset zoom to initial state
   */
  resetZoom(): void {
    this._scale.set(this.initialZoom());
    const [cx, cy] = this.center();
    this._translateX.set(cx);
    this._translateY.set(cy);
    this.updateTransform();
    this.emitZoomChange();
  }

  /**
   * Set zoom to a specific level
   */
  setZoom(scale: number, translateX?: number, translateY?: number): void {
    this._scale.set(Math.max(this.minZoom(), Math.min(scale, this.maxZoom())));
    if (translateX !== undefined) {
      this._translateX.set(translateX);
    }
    if (translateY !== undefined) {
      this._translateY.set(translateY);
    }
    this.updateTransform();
    this.emitZoomChange();
  }

  private updateTransform(): void {
    const transformValue = this.transform();
    this.renderer.setAttribute(this.elementRef.nativeElement, 'transform', transformValue);
  }

  private getSvgElement(): SVGSVGElement | null {
    let element = this.elementRef.nativeElement;
    while (element && element.tagName !== 'svg') {
      element = element.parentElement;
    }
    return element as SVGSVGElement;
  }

  private handleWheel(event: WheelEvent): void {
    if (!this.enableWheelZoom()) return;

    event.preventDefault();

    const sensitivity = this.zoomSensitivity();
    const delta = -event.deltaY * sensitivity;
    const scaleFactor = 1 + delta;

    const currentScale = this._scale();
    let newScale = currentScale * scaleFactor;
    newScale = Math.max(this.minZoom(), Math.min(newScale, this.maxZoom()));

    if (newScale !== currentScale) {
      // Zoom toward mouse position
      const svg = this.getSvgElement();
      if (svg) {
        const rect = svg.getBoundingClientRect();
        const ctx = this.mapContext();

        // Mouse position relative to SVG center
        const mouseX = event.clientX - rect.left - rect.width / 2;
        const mouseY = event.clientY - rect.top - rect.height / 2;

        // Adjust translation to zoom toward mouse
        const scaleRatio = newScale / currentScale;
        const tx = this._translateX();
        const ty = this._translateY();

        // Scale the SVG dimensions to get proper ratios
        const svgScaleX = rect.width / ctx.width;
        const svgScaleY = rect.height / ctx.height;

        this._translateX.set(tx - (mouseX / svgScaleX - tx) * (scaleRatio - 1));
        this._translateY.set(ty - (mouseY / svgScaleY - ty) * (scaleRatio - 1));
      }

      this._scale.set(newScale);
      this.updateTransform();
      this.emitZoomChange(event);
    }
  }

  private handleMouseDown(event: MouseEvent): void {
    if (!this.enablePan() || event.button !== 0) return;

    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.lastTranslateX = this._translateX();
    this.lastTranslateY = this._translateY();

    this.renderer.setStyle(this.elementRef.nativeElement, 'cursor', 'grabbing');
    this.emitZoomStart(event);
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    const svg = this.getSvgElement();
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const ctx = this.mapContext();

    // Calculate delta in SVG coordinate space
    const svgScaleX = rect.width / ctx.width;
    const svgScaleY = rect.height / ctx.height;

    const deltaX = (event.clientX - this.dragStartX) / svgScaleX;
    const deltaY = (event.clientY - this.dragStartY) / svgScaleY;

    this._translateX.set(this.lastTranslateX + deltaX);
    this._translateY.set(this.lastTranslateY + deltaY);

    this.updateTransform();
    this.emitZoomChange(event);
  }

  private handleMouseUp(event: MouseEvent): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.renderer.setStyle(this.elementRef.nativeElement, 'cursor', 'grab');
      this.emitZoomEnd(event);
    }
  }

  // Touch handling for pinch zoom
  private lastTouchDistance = 0;
  private lastTouchCenter = { x: 0, y: 0 };

  private handleTouchStart(event: TouchEvent): void {
    if (!this.enableTouch()) return;

    if (event.touches.length === 1) {
      // Single touch - pan
      event.preventDefault();
      this.isDragging = true;
      this.dragStartX = event.touches[0].clientX;
      this.dragStartY = event.touches[0].clientY;
      this.lastTranslateX = this._translateX();
      this.lastTranslateY = this._translateY();
      this.emitZoomStart(event);
    } else if (event.touches.length === 2) {
      // Two touches - pinch zoom
      event.preventDefault();
      this.lastTouchDistance = this.getTouchDistance(event.touches);
      this.lastTouchCenter = this.getTouchCenter(event.touches);
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.enableTouch()) return;

    if (event.touches.length === 1 && this.isDragging) {
      event.preventDefault();

      const svg = this.getSvgElement();
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const ctx = this.mapContext();

      const svgScaleX = rect.width / ctx.width;
      const svgScaleY = rect.height / ctx.height;

      const deltaX = (event.touches[0].clientX - this.dragStartX) / svgScaleX;
      const deltaY = (event.touches[0].clientY - this.dragStartY) / svgScaleY;

      this._translateX.set(this.lastTranslateX + deltaX);
      this._translateY.set(this.lastTranslateY + deltaY);

      this.updateTransform();
      this.emitZoomChange(event);
    } else if (event.touches.length === 2) {
      event.preventDefault();

      const distance = this.getTouchDistance(event.touches);
      const scaleFactor = distance / this.lastTouchDistance;

      const currentScale = this._scale();
      let newScale = currentScale * scaleFactor;
      newScale = Math.max(this.minZoom(), Math.min(newScale, this.maxZoom()));

      this._scale.set(newScale);
      this.lastTouchDistance = distance;

      this.updateTransform();
      this.emitZoomChange(event);
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    if (this.isDragging && event.touches.length === 0) {
      this.isDragging = false;
      this.emitZoomEnd(event);
    }
  }

  private getTouchDistance(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getTouchCenter(touches: TouchList): { x: number; y: number } {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  }

  private emitZoomChange(sourceEvent?: Event): void {
    this.zoomChange.emit({
      scale: this._scale(),
      translateX: this._translateX(),
      translateY: this._translateY(),
      sourceEvent
    });
  }

  private emitZoomStart(sourceEvent?: Event): void {
    this.zoomStart.emit({
      scale: this._scale(),
      translateX: this._translateX(),
      translateY: this._translateY(),
      sourceEvent
    });
  }

  private emitZoomEnd(sourceEvent?: Event): void {
    this.zoomEnd.emit({
      scale: this._scale(),
      translateX: this._translateX(),
      translateY: this._translateY(),
      sourceEvent
    });
  }
}

// Re-export as component name for backwards compatibility
export { ZoomableGroupDirective as ZoomableGroupComponent };
