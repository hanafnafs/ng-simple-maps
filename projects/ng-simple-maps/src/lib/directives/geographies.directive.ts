import {
  Directive,
  input,
  output,
  inject,
  effect,
  computed,
  Renderer2,
  ElementRef
} from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, map, catchError, of } from 'rxjs';
import {
  GeographyInput,
  GeographyObject,
  ParseGeographiesFn,
  GeographyEvent
} from '../models';
import { GeographyLoaderService } from '../services';
import { MAP_CONTEXT } from '../tokens/map-context.token';
import { Continent, filterByContinents } from '../utils';

/**
 * Directive for loading and rendering geographic features (countries, regions, etc.)
 *
 * Loads TopoJSON or GeoJSON data and renders it as SVG paths.
 * Must be used on ng-container inside an SVG element.
 *
 * @example
 * Basic usage with TopoJSON URL:
 * ```html
 * <asm-composable-map>
 *   <ng-container
 *     [asmGeographies]="'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'"
 *     fill="#ECECEC"
 *     stroke="#D6D6D6">
 *   </ng-container>
 * </asm-composable-map>
 * ```
 *
 * @example
 * Filter by continent:
 * ```html
 * <ng-container
 *   [asmGeographies]="worldDataUrl"
 *   [continents]="'Europe'">
 * </ng-container>
 * ```
 *
 * @example
 * Multiple continents:
 * ```html
 * <ng-container
 *   [asmGeographies]="worldDataUrl"
 *   [continents]="['Asia', 'Europe']">
 * </ng-container>
 * ```
 */
@Directive({
  selector: '[asmGeographies]',
  standalone: true
})
export class GeographiesDirective {
  private readonly geographyLoader = inject(GeographyLoaderService);
  private readonly mapContext = inject(MAP_CONTEXT);
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  /**
   * Geography data (URL string, TopoJSON, or GeoJSON)
   */
  geography = input.required<GeographyInput>({ alias: 'asmGeographies' });

  /**
   * Optional custom parsing function
   */
  parseGeographies = input<ParseGeographiesFn>();

  /**
   * Filter by continent(s) - can be a single continent or array of continents
   * Supported: 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Antarctica'
   */
  continents = input<Continent | Continent[] | null>(null);

  /**
   * Default fill color for all geographies
   */
  fill = input<string>('#ECECEC');

  /**
   * Default stroke color for all geographies
   */
  stroke = input<string>('#D6D6D6');

  /**
   * Default stroke width for all geographies
   */
  strokeWidth = input<number>(0.5);

  /**
   * Hover fill color (optional)
   */
  hoverFill = input<string | null>(null);

  /**
   * Pressed/active fill color (optional)
   */
  pressedFill = input<string | null>(null);

  /**
   * Emitted when mouse enters a geography
   */
  geographyHover = output<GeographyEvent>();

  /**
   * Emitted when mouse leaves a geography
   */
  geographyLeave = output<GeographyEvent>();

  /**
   * Emitted when a geography is clicked
   */
  geographyClick = output<GeographyEvent>();

  /**
   * Raw loaded geographies (before filtering)
   */
  private readonly rawGeographies = toSignal(
    toObservable(this.geography).pipe(
      switchMap(geo =>
        this.geographyLoader.load(geo).pipe(
          map(data => data.features),
          catchError(err => {
            console.error('Error loading geographies:', err);
            return of([] as GeographyObject[]);
          })
        )
      )
    ),
    { initialValue: [] as GeographyObject[] }
  );

  /**
   * Loaded and processed geographies signal (reactive to continents changes)
   */
  protected readonly geographies = computed(() => {
    const features = this.rawGeographies();
    return this.processGeographies(features);
  });

  constructor() {
    // Effect to render paths when geographies load
    effect(() => {
      const geos = this.geographies();
      if (geos.length > 0) {
        this.renderGeographies(geos);
      }
    });
  }

  private renderGeographies(geos: GeographyObject[]): void {
    const hostElement = this.elementRef.nativeElement;
    const parentElement = this.renderer.parentNode(hostElement);
    const context = this.mapContext();

    // Clear any existing paths we created
    const existingPaths = parentElement.querySelectorAll('path[data-asm-geo]');
    existingPaths.forEach((path: Element) => this.renderer.removeChild(parentElement, path));

    const baseFill = this.fill();
    const hoverFillColor = this.hoverFill();
    const pressedFillColor = this.pressedFill();

    // Create and append path elements directly to parent (SVG)
    geos.forEach(geo => {
      const path = this.renderer.createElement('path', 'svg');
      const pathData = context.path(geo) || '';

      this.renderer.setAttribute(path, 'd', pathData);
      this.renderer.setAttribute(path, 'fill', baseFill);
      this.renderer.setAttribute(path, 'stroke', this.stroke());
      this.renderer.setAttribute(path, 'stroke-width', String(this.strokeWidth()));
      this.renderer.setAttribute(path, 'data-asm-geo', 'true');
      this.renderer.setStyle(path, 'cursor', 'pointer');

      // Add event listeners
      this.renderer.listen(path, 'mouseenter', (event: MouseEvent) => {
        if (hoverFillColor) {
          this.renderer.setAttribute(path, 'fill', hoverFillColor);
        }
        this.geographyHover.emit({ event, geography: geo });
      });

      this.renderer.listen(path, 'mouseleave', (event: MouseEvent) => {
        this.renderer.setAttribute(path, 'fill', baseFill);
        this.geographyLeave.emit({ event, geography: geo });
      });

      this.renderer.listen(path, 'mousedown', () => {
        if (pressedFillColor) {
          this.renderer.setAttribute(path, 'fill', pressedFillColor);
        }
      });

      this.renderer.listen(path, 'mouseup', () => {
        if (hoverFillColor) {
          this.renderer.setAttribute(path, 'fill', hoverFillColor);
        } else {
          this.renderer.setAttribute(path, 'fill', baseFill);
        }
      });

      this.renderer.listen(path, 'click', (event: MouseEvent) => {
        this.geographyClick.emit({ event, geography: geo });
      });

      // Insert after the host element
      const nextSibling = this.renderer.nextSibling(hostElement);
      if (nextSibling) {
        this.renderer.insertBefore(parentElement, path, nextSibling);
      } else {
        this.renderer.appendChild(parentElement, path);
      }
    });
  }

  private processGeographies(features: GeographyObject[]): GeographyObject[] {
    let processed = features;

    // Apply continent filtering if specified
    const continentFilter = this.continents();
    if (continentFilter) {
      processed = filterByContinents(processed, continentFilter);
    }

    // Apply custom parsing function if provided
    const parser = this.parseGeographies();
    if (parser) {
      processed = parser(processed);
    }

    return processed;
  }
}
