import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  effect,
  inject,
  ElementRef,
  Renderer2,
  AfterViewInit,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, map, catchError, of } from 'rxjs';
import { geoPath, geoGraticule, geoCentroid, geoBounds } from 'd3-geo';
import { ProjectionService } from '../../services';
import { GeographyLoaderService } from '../../services';
import { ProjectionType, ProjectionConfig, GeographyInput, GeographyObject } from '../../models';
import { filterByContinents, Continent } from '../../utils';
import { MarkerRendererUtil } from '../../utils/marker-renderer.util';
import { PathHelperUtil } from '../../utils/path-helper.util';
import {
  MapMarker,
  MapAnnotation,
  MapLine,
  TooltipConfig,
  ChoroplethData,
  ChoroplethConfig,
  GraticuleConfig,
  MapGeographyEvent,
  MapMarkerEvent,
  MapLineEvent,
  MarkerShape
} from './map.types';

// The main map component that brings everything together
// Just pass in your data and customize however you like!
//
// Basic usage: <asm-map [geography]="worldData"></asm-map>
// With all the bells and whistles:
// <asm-map [geography]="worldData" [markers]="markers" [zoomable]="true" [showTooltip]="true"></asm-map>
@Component({
  selector: 'asm-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private readonly projectionService = inject(ProjectionService);
  private readonly geographyLoader = inject(GeographyLoaderService);
  private readonly renderer = inject(Renderer2);

  @ViewChild('svgElement') private svgElement!: ElementRef<SVGSVGElement>;
  @ViewChild('zoomGroup') private zoomGroupElement!: ElementRef<SVGGElement>;

  // Main map settings

  // The map data - can be a URL or the data itself
  geography = input.required<GeographyInput>();

  // How wide the map should be
  width = input<number>(800);

  // How tall the map should be
  height = input<number>(400);

  // Max width in pixels (optional)
  maxWidth = input<number | null>(null);

  // What kind of map projection to use
  projection = input<ProjectionType>('geoEqualEarth');

  // Extra settings for the projection
  projectionConfig = input<ProjectionConfig>({});

  // Show only specific continents if you want
  continents = input<Continent | Continent[] | null>(null);

  // How the map looks

  // Color to fill countries with
  fill = input<string>('#ECECEC');

  // Color for country borders
  stroke = input<string>('#D6D6D6');

  // How thick the borders should be
  strokeWidth = input<number>(0.5);

  // Color when you hover over countries (optional)
  hoverFill = input<string | null>(null);

  // Points and labels on the map

  // List of points to show on the map
  markers = input<MapMarker[]>([]);

  // Text labels with lines pointing to places
  annotations = input<MapAnnotation[]>([]);

  // What color markers should be by default
  markerColor = input<string>('#FF5533');

  // How big markers should be by default
  markerSize = input<number>(6);

  // Lines connecting places (like flight paths)

  // List of lines to draw between places
  lines = input<MapLine[]>([]);

  // What color lines should be by default
  lineColor = input<string>('#FF5533');

  // How thick lines should be by default
  lineStrokeWidth = input<number>(2);

  // Color countries based on data (like population density)

  // Data that maps country names to values
  choroplethData = input<ChoroplethData | null>(null);

  // Settings for how the data coloring works
  choroplethConfig = input<ChoroplethConfig | null>(null);

  // Grid lines (latitude/longitude)

  // Whether to show the grid lines or not
  showGraticule = input<boolean>(false);

  // How the grid lines should look
  graticuleConfig = input<GraticuleConfig | null>(null);

  // Zoom and pan controls

  // Let users zoom in/out and drag the map around
  zoomable = input<boolean>(false);

  // Show the +/- buttons for zooming
  showZoomControls = input<boolean>(true);

  // How far out users can zoom
  minZoom = input<number>(1);

  // How far in users can zoom
  maxZoom = input<number>(8);

  // Should clicking a country zoom into it?
  zoomOnClick = input<boolean>(false);

  // How much to zoom when clicking a country
  zoomOnClickLevel = input<number>(4);

  // How long zoom animations should take (in milliseconds)
  zoomAnimationDuration = input<number>(800);

  // Hover tooltips

  // Show little popup when hovering over countries
  showTooltip = input<boolean>(false);

  // How the tooltip should look (colors, etc.)
  tooltipConfig = input<TooltipConfig | null>(null);

  // Country name labels

  // Display country names on the map
  showLabels = input<boolean>(false);

  // Only show labels when zoomed in enough
  labelMinZoom = input<number>(1);

  // How big the country name text should be
  labelFontSize = input<number>(12);

  // What color the country names should be
  labelColor = input<string>('#333');

  // How bold the country names should be
  labelFontWeight = input<string | number>('normal');

  // Events that get fired when stuff happens

  // Fires when someone clicks on a country
  countryClick = output<MapGeographyEvent>();

  // Fires when someone hovers over a country
  countryHover = output<MapGeographyEvent>();

  // Fires when mouse stops hovering over a country
  countryLeave = output<void>();

  // Fires when someone clicks on a marker
  markerClick = output<MapMarkerEvent>();

  // Fires when someone clicks on a line
  lineClick = output<MapLineEvent>();

  // Internal stuff for keeping track of zoom and pan

  private readonly _scale = signal(1);
  private readonly _translateX = signal(0);
  private readonly _translateY = signal(0);

  protected readonly tooltipVisible = signal(false);
  protected readonly tooltipX = signal(0);
  protected readonly tooltipY = signal(0);
  protected readonly tooltipContent = signal('');

  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private lastTranslateX = 0;
  private lastTranslateY = 0;

  // Keep track of event listeners so we can clean them up later
  private wheelHandler?: (e: WheelEvent) => void;
  private mouseDownHandler?: (e: MouseEvent) => void;
  private mouseMoveHandler?: (e: MouseEvent) => void;
  private mouseUpHandler?: (e: MouseEvent) => void;

  // SVG viewbox dimensions
  protected readonly viewBox = computed(() =>
    `0 0 ${this.width()} ${this.height()}`
  );

  // The map projection we're using
  private readonly proj = computed(() =>
    this.projectionService.createProjection(
      this.projection(),
      this.projectionConfig(),
      this.width(),
      this.height()
    )
  );

  // Converts geographic coordinates to SVG paths
  private readonly pathGenerator = computed(() =>
    geoPath().projection(this.proj())
  );

  // The actual country/geography data after loading
  private readonly geographies = toSignal(
    toObservable(this.geography).pipe(
      switchMap(geo =>
        this.geographyLoader.load(geo).pipe(
          map(data => {
            let features = data.features;
            const continentFilter = this.continents();
            if (continentFilter) {
              features = filterByContinents(features, continentFilter);
            }
            return features;
          }),
          catchError(err => {
            console.error('Error loading geographies:', err);
            return of([] as GeographyObject[]);
          })
        )
      )
    ),
    { initialValue: [] as GeographyObject[] }
  );

  constructor() {
    // Redraw the map when data or styles change
    effect(() => {
      const geos = this.geographies();
      if (geos.length > 0 && this.zoomGroupElement) {
        this.render();
      }
    });

    // Redraw labels when zoom or label settings change
    effect(() => {
      const showLabels = this.showLabels();
      const labelMinZoom = this.labelMinZoom();
      const scale = this._scale();
      
      if (this.zoomGroupElement && this.geographies().length > 0) {
        this.render();
      }
    });
  }

  ngAfterViewInit(): void {
    // Draw the map for the first time
    setTimeout(() => this.render(), 0);

    // Set up mouse/wheel events for zooming if enabled
    if (this.zoomable()) {
      this.setupZoomHandlers();
    }
  }

  ngOnDestroy(): void {
    this.cleanupZoomHandlers();
  }

  // Public methods for controlling zoom

  zoomIn(): void {
    const newScale = Math.min(this._scale() * 1.5, this.maxZoom());
    this._scale.set(newScale);
    this.updateTransform();
  }

  zoomOut(): void {
    const newScale = Math.max(this._scale() / 1.5, this.minZoom());
    this._scale.set(newScale);
    this.updateTransform();
  }

  resetZoom(): void {
    this._scale.set(1);
    this._translateX.set(0);
    this._translateY.set(0);
    this.updateTransform();
  }

  // Focus the map on a specific country or region
  zoomToFeature(geo: GeographyObject): void {
    const projection = this.proj();
    
    // Find the center point of the country
    const centroid = geoCentroid(geo);
    const projectedCentroid = projection(centroid);
    
    if (!projectedCentroid) return;
    
    const width = this.width();
    const height = this.height();
    
    // Use the zoom level from settings
    let targetScale = this.zoomOnClickLevel();
    
    // Make sure zoom level is within allowed range
    targetScale = Math.max(this.minZoom(), Math.min(targetScale, this.maxZoom()));
    
    // The transform is: translate(w/2 + tx, h/2 + ty) scale(s) translate(-w/2, -h/2)
    // We want the projected centroid to end up at the center of the viewport (w/2, h/2)
    // 
    // After the full transform, a point at [x, y] becomes:
    // [(x - w/2) * s + w/2 + tx, (y - h/2) * s + h/2 + ty]
    //
    // We want projectedCentroid to map to [w/2, h/2], so:
    // (projectedCentroid[0] - w/2) * s + w/2 + tx = w/2
    // (projectedCentroid[1] - h/2) * s + h/2 + ty = h/2
    //
    // Solving for tx and ty:
    // tx = -(projectedCentroid[0] - w/2) * s
    // ty = -(projectedCentroid[1] - h/2) * s
    
    const translateX = -(projectedCentroid[0] - width / 2) * targetScale;
    const translateY = -(projectedCentroid[1] - height / 2) * targetScale;
    
    // Smoothly move to the new view
    this.animateToZoom(targetScale, translateX, translateY);
  }

  // Smoothly animate to a new zoom level and position
  private animateToZoom(targetScale: number, targetX: number, targetY: number): void {
    const startScale = this._scale();
    const startX = this._translateX();
    const startY = this._translateY();
    
    const duration = this.zoomAnimationDuration();
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use a nice smooth easing function
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      // Interpolate values
      const currentScale = startScale + (targetScale - startScale) * eased;
      const currentX = startX + (targetX - startX) * eased;
      const currentY = startY + (targetY - startY) * eased;
      
      // Apply the interpolated values
      this._scale.set(currentScale);
      this._translateX.set(currentX);
      this._translateY.set(currentY);
      this.updateTransform();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  // ===== Internal Methods =====

  protected onMouseMove(event: MouseEvent): void {
    if (this.showTooltip() && this.tooltipVisible()) {
      this.tooltipX.set(event.clientX + 10);
      this.tooltipY.set(event.clientY + 10);
    }
  }

  private render(): void {
    if (!this.zoomGroupElement) return;

    const group = this.zoomGroupElement.nativeElement;
    const geos = this.geographies();
    const path = this.pathGenerator();
    const proj = this.proj();

    // Clear existing content
    this.clearSvgContent(group);

    // Render all layers in order
    this.renderGraticule(group, path);
    this.renderGeographies(group, geos, path);
    this.renderLines(group, proj);
    this.renderMarkers(group, proj);
    this.renderAnnotations(group, proj);
    this.renderLabels(group, geos, proj);

    // Apply current transform
    this.updateTransform();
  }

  private clearSvgContent(group: SVGGElement): void {
    while (group.firstChild) {
      group.removeChild(group.firstChild);
    }
  }

  private renderGraticule(group: SVGGElement, path: any): void {
    if (!this.showGraticule()) return;

    const config = this.graticuleConfig();
    const graticule = geoGraticule();

    if (config?.step) {
      graticule.step(config.step);
    }

    // Render graticule lines (grid lines)
    const graticuleLines = graticule.lines();
    graticuleLines.forEach(line => {
      const lineEl = this.renderer.createElement('path', 'svg');
      const pathData = path(line) || '';

      this.renderer.setAttribute(lineEl, 'd', pathData);
      this.renderer.setAttribute(lineEl, 'fill', 'none');
      this.renderer.setAttribute(lineEl, 'stroke', config?.color || '#ccc');
      this.renderer.setAttribute(lineEl, 'stroke-width', String(config?.strokeWidth || 0.5));
      this.renderer.setAttribute(lineEl, 'opacity', String(config?.opacity || 0.5));

      this.renderer.appendChild(group, lineEl);
    });

    // Optionally render graticule outline (sphere)
    const outline = graticule.outline();
    if (outline) {
      const outlineEl = this.renderer.createElement('path', 'svg');
      const outlineData = path(outline) || '';

      this.renderer.setAttribute(outlineEl, 'd', outlineData);
      this.renderer.setAttribute(outlineEl, 'fill', 'none');
      this.renderer.setAttribute(outlineEl, 'stroke', config?.color || '#ccc');
      this.renderer.setAttribute(outlineEl, 'stroke-width', String((config?.strokeWidth || 0.5) * 2));
      this.renderer.setAttribute(outlineEl, 'opacity', String((config?.opacity || 0.5) * 0.3));

      this.renderer.appendChild(group, outlineEl);
    }
  }

  private renderGeographies(group: SVGGElement, geos: GeographyObject[], path: any): void {
    geos.forEach(geo => {
      const pathEl = this.renderer.createElement('path', 'svg');
      const pathData = path(geo) || '';

      // Determine fill color (choropleth takes priority)
      const choroplethColor = this.getChoroplethColor(geo);
      const baseFill = choroplethColor || this.fill();

      this.renderer.setAttribute(pathEl, 'd', pathData);
      this.renderer.setAttribute(pathEl, 'fill', baseFill);
      this.renderer.setAttribute(pathEl, 'stroke', this.stroke());
      this.renderer.setAttribute(pathEl, 'stroke-width', String(this.strokeWidth()));
      this.renderer.setStyle(pathEl, 'cursor', 'pointer');

      // Store original fill for hover restoration
      pathEl.dataset['originalFill'] = baseFill;

      this.addGeographyEventHandlers(pathEl, geo);
      this.renderer.appendChild(group, pathEl);
    });
  }

  private addGeographyEventHandlers(pathEl: SVGPathElement, geo: GeographyObject): void {
    this.renderer.listen(pathEl, 'mouseenter', (e: MouseEvent) => {
      if (this.hoverFill()) {
        this.renderer.setAttribute(pathEl, 'fill', this.hoverFill()!);
      }
      const props = geo.properties || {};
      this.countryHover.emit({ properties: props, id: geo.id, event: e });

      if (this.showTooltip()) {
        this.tooltipContent.set(String(props['name'] || 'Unknown'));
        this.tooltipX.set(e.clientX + 10);
        this.tooltipY.set(e.clientY + 10);
        this.tooltipVisible.set(true);
      }
    });

    this.renderer.listen(pathEl, 'mouseleave', () => {
      // Restore original fill (could be choropleth color)
      const originalFill = pathEl.dataset['originalFill'] || this.fill();
      this.renderer.setAttribute(pathEl, 'fill', originalFill);
      this.countryLeave.emit();
      this.tooltipVisible.set(false);
    });

    this.renderer.listen(pathEl, 'click', (e: MouseEvent) => {
      const props = geo.properties || {};
      
      // Zoom to country if enabled
      if (this.zoomOnClick()) {
        this.zoomToFeature(geo);
      }
      
      this.countryClick.emit({ properties: props, id: geo.id, event: e });
    });
  }

  private renderLines(group: SVGGElement, proj: any): void {
    this.lines().forEach((line, index) => {
      const curve = line.curve ?? 0;
      const linePathData = PathHelperUtil.createCurvedLinePath(proj, line.from, line.to, curve);

      if (!linePathData) return;

      const linePath = this.renderer.createElement('path', 'svg');

      this.renderer.setAttribute(linePath, 'd', linePathData);
      this.renderer.setAttribute(linePath, 'fill', 'none');
      this.renderer.setAttribute(linePath, 'stroke', line.color || this.lineColor());
      this.renderer.setAttribute(linePath, 'stroke-width', String(line.strokeWidth || this.lineStrokeWidth()));
      this.renderer.setStyle(linePath, 'cursor', 'pointer');

      if (line.dashed) {
        this.renderer.setAttribute(linePath, 'stroke-dasharray', '5,3');
      }

      // Line click handler
      this.renderer.listen(linePath, 'click', (e: MouseEvent) => {
        e.stopPropagation();
        this.lineClick.emit({ line, index, event: e });
      });

      this.renderer.appendChild(group, linePath);

      this.renderLineEndpoints(group, line, proj);
    });
  }

  private renderLineEndpoints(group: SVGGElement, line: MapLine, proj: any): void {
    const fromProj = proj(line.from);
    const toProj = proj(line.to);

    if (fromProj) {
      const startDot = this.renderer.createElement('circle', 'svg');
      this.renderer.setAttribute(startDot, 'cx', String(fromProj[0]));
      this.renderer.setAttribute(startDot, 'cy', String(fromProj[1]));
      this.renderer.setAttribute(startDot, 'r', '3');
      this.renderer.setAttribute(startDot, 'fill', line.color || this.lineColor());
      this.renderer.appendChild(group, startDot);
    }

    if (toProj) {
      const endDot = this.renderer.createElement('circle', 'svg');
      this.renderer.setAttribute(endDot, 'cx', String(toProj[0]));
      this.renderer.setAttribute(endDot, 'cy', String(toProj[1]));
      this.renderer.setAttribute(endDot, 'r', '3');
      this.renderer.setAttribute(endDot, 'fill', line.color || this.lineColor());
      this.renderer.appendChild(group, endDot);
    }
  }

  private renderMarkers(group: SVGGElement, proj: any): void {
    this.markers().forEach((marker, index) => {
      const projected = proj(marker.coordinates);
      if (!projected) return;

      const [x, y] = projected;
      const markerGroup = this.renderer.createElement('g', 'svg');
      this.renderer.setAttribute(markerGroup, 'transform', `translate(${x}, ${y})`);
      this.renderer.setStyle(markerGroup, 'cursor', 'pointer');

      const shape = marker.shape || 'circle';
      const size = marker.size || this.markerSize();
      const color = marker.color || this.markerColor();
      const strokeColor = marker.stroke || '#FFFFFF';

      // Handle custom SVG URL (async loading)
      if (shape === 'custom' && marker.customSvgUrl) {
        MarkerRendererUtil.loadSvgMarker(this.renderer, marker.customSvgUrl, markerGroup, size, color, strokeColor, marker.customSvgSize);
      } else {
        const shapeEl = MarkerRendererUtil.createMarkerShape(
          this.renderer,
          shape,
          size,
          color,
          strokeColor,
          marker.customSvg,
          marker.customSvgSize
        );
        this.renderer.appendChild(markerGroup, shapeEl);
      }

      // Marker click handler
      this.renderer.listen(markerGroup, 'click', (e: MouseEvent) => {
        e.stopPropagation();
        this.markerClick.emit({ marker, index, event: e });
      });

      this.renderer.appendChild(group, markerGroup);
    });
  }

  private renderAnnotations(group: SVGGElement, proj: any): void {
    this.annotations().forEach(annotation => {
      const projected = proj(annotation.coordinates);
      if (!projected) return;

      const [x, y] = projected;
      const dx = annotation.dx || 30;
      const dy = annotation.dy || -30;
      const curve = annotation.curve || 0;

      const annotationGroup = this.renderer.createElement('g', 'svg');

      // Connector line
      const endX = x + dx;
      const endY = y + dy;

      const pathEl = this.renderer.createElement('path', 'svg');
      const pathD = PathHelperUtil.createAnnotationPath(x, y, dx, dy, curve);

      this.renderer.setAttribute(pathEl, 'd', pathD);
      this.renderer.setAttribute(pathEl, 'fill', 'none');
      this.renderer.setAttribute(pathEl, 'stroke', annotation.color || '#FF5533');
      this.renderer.setAttribute(pathEl, 'stroke-width', '1');
      this.renderer.appendChild(annotationGroup, pathEl);

      // Subject dot
      const dot = this.renderer.createElement('circle', 'svg');
      this.renderer.setAttribute(dot, 'cx', String(x));
      this.renderer.setAttribute(dot, 'cy', String(y));
      this.renderer.setAttribute(dot, 'r', '4');
      this.renderer.setAttribute(dot, 'fill', annotation.color || '#FF5533');
      this.renderer.appendChild(annotationGroup, dot);

      // Text
      const text = this.renderer.createElement('text', 'svg');
      this.renderer.setAttribute(text, 'x', String(endX));
      this.renderer.setAttribute(text, 'y', String(endY));
      this.renderer.setAttribute(text, 'fill', annotation.color || '#000');
      this.renderer.setAttribute(text, 'font-size', String(annotation.fontSize || 14));
      this.renderer.setAttribute(text, 'font-weight', String(annotation.fontWeight || 'normal'));
      this.renderer.setAttribute(text, 'text-anchor', dx > 0 ? 'start' : 'end');
      this.renderer.setAttribute(text, 'dy', '-5');
      text.textContent = annotation.text;
      this.renderer.appendChild(annotationGroup, text);

      this.renderer.appendChild(group, annotationGroup);
    });
  }

  private renderLabels(group: SVGGElement, geos: GeographyObject[], proj: any): void {
    if (!this.showLabels() || this._scale() < this.labelMinZoom()) return;

    geos.forEach(geo => {
      const properties = geo.properties || {};
      const name = properties['name'] || properties['NAME'] || properties['name_en'];
      
      if (!name) return;

      // Calculate centroid for label position
      const centroid = geoCentroid(geo);
      const projected = proj(centroid);
      
      if (!projected) return;

      const [x, y] = projected;
      const labelEl = this.renderer.createElement('text', 'svg');
      
      this.renderer.setAttribute(labelEl, 'x', String(x));
      this.renderer.setAttribute(labelEl, 'y', String(y));
      this.renderer.setAttribute(labelEl, 'text-anchor', 'middle');
      this.renderer.setAttribute(labelEl, 'alignment-baseline', 'central');
      this.renderer.setAttribute(labelEl, 'fill', this.labelColor());
      this.renderer.setAttribute(labelEl, 'font-size', String(this.labelFontSize()));
      this.renderer.setAttribute(labelEl, 'font-weight', String(this.labelFontWeight()));
      this.renderer.setAttribute(labelEl, 'font-family', 'sans-serif');
      this.renderer.setAttribute(labelEl, 'pointer-events', 'none');
      this.renderer.setStyle(labelEl, 'user-select', 'none');
      
      // Add text shadow for better readability
      this.renderer.setStyle(labelEl, 'text-shadow', '1px 1px 1px rgba(255,255,255,0.8), -1px -1px 1px rgba(255,255,255,0.8)');
      
      labelEl.textContent = String(name);
      this.renderer.appendChild(group, labelEl);
    });
  }


  private updateTransform(): void {
    if (!this.zoomGroupElement) return;

    const w = this.width();
    const h = this.height();
    const s = this._scale();
    const tx = this._translateX();
    const ty = this._translateY();

    const transform = `translate(${w / 2 + tx}, ${h / 2 + ty}) scale(${s}) translate(${-w / 2}, ${-h / 2})`;
    this.renderer.setAttribute(this.zoomGroupElement.nativeElement, 'transform', transform);
  }

  private setupZoomHandlers(): void {
    const svg = this.svgElement?.nativeElement;
    if (!svg) return;

    // Wheel zoom
    this.wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      const scaleFactor = 1 + delta;
      const currentScale = this._scale();
      const newScale = Math.max(this.minZoom(), Math.min(currentScale * scaleFactor, this.maxZoom()));

      if (newScale !== currentScale) {
        const rect = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;
        const scaleRatio = newScale / currentScale;
        const svgScaleX = rect.width / this.width();
        const svgScaleY = rect.height / this.height();

        this._translateX.update(tx => tx - (mouseX / svgScaleX - tx) * (scaleRatio - 1));
        this._translateY.update(ty => ty - (mouseY / svgScaleY - ty) * (scaleRatio - 1));
        this._scale.set(newScale);
        this.updateTransform();
      }
    };
    svg.addEventListener('wheel', this.wheelHandler, { passive: false });

    // Pan handlers
    this.mouseDownHandler = (e: MouseEvent) => {
      if (e.button !== 0) return;
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.lastTranslateX = this._translateX();
      this.lastTranslateY = this._translateY();
    };

    this.mouseMoveHandler = (e: MouseEvent) => {
      if (!this.isDragging) return;
      const rect = svg.getBoundingClientRect();
      const svgScaleX = rect.width / this.width();
      const svgScaleY = rect.height / this.height();
      const deltaX = (e.clientX - this.dragStartX) / svgScaleX;
      const deltaY = (e.clientY - this.dragStartY) / svgScaleY;
      this._translateX.set(this.lastTranslateX + deltaX);
      this._translateY.set(this.lastTranslateY + deltaY);
      this.updateTransform();
    };

    this.mouseUpHandler = () => {
      this.isDragging = false;
    };

    svg.addEventListener('mousedown', this.mouseDownHandler);
    window.addEventListener('mousemove', this.mouseMoveHandler);
    window.addEventListener('mouseup', this.mouseUpHandler);
  }

  private cleanupZoomHandlers(): void {
    const svg = this.svgElement?.nativeElement;
    if (!svg) return;

    if (this.wheelHandler) svg.removeEventListener('wheel', this.wheelHandler);
    if (this.mouseDownHandler) svg.removeEventListener('mousedown', this.mouseDownHandler);
    if (this.mouseMoveHandler) window.removeEventListener('mousemove', this.mouseMoveHandler);
    if (this.mouseUpHandler) window.removeEventListener('mouseup', this.mouseUpHandler);
  }

  /**
   * Get fill color for a geography based on choropleth data
   */
  private getChoroplethColor(geo: GeographyObject): string | null {
    const data = this.choroplethData();
    const config = this.choroplethConfig();
    if (!data) return null;

    const matchKey = config?.matchKey || 'name';
    const geoKey = geo.properties?.[matchKey];
    if (geoKey === undefined) return config?.nullColor || null;

    const value = data[String(geoKey)];
    if (value === undefined) return config?.nullColor || null;

    // Get color scale
    const colors = config?.colors || ['#E3F2FD', '#90CAF9', '#42A5F5', '#1E88E5', '#1565C0'];

    // Calculate min/max from data
    const values = Object.values(data);
    const minValue = config?.minValue ?? Math.min(...values);
    const maxValue = config?.maxValue ?? Math.max(...values);

    if (maxValue === minValue) return colors[Math.floor(colors.length / 2)];

    // Interpolate color
    const normalized = (value - minValue) / (maxValue - minValue);
    const colorIndex = Math.min(Math.floor(normalized * colors.length), colors.length - 1);

    return colors[colorIndex];
  }

}
