import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
  inject,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { geoPath } from 'd3-geo';
import { ProjectionType, ProjectionConfig } from '../../models';
import { ProjectionService } from '../../services';
import { MAP_CONTEXT, MapContext } from '../../tokens/map-context.token';

/**
 * Root map container component - creates an SVG with D3 projection context
 *
 * This is the main container for all map visualizations. It sets up the SVG canvas
 * and provides projection context to child directives.
 *
 * The map is fully responsive by default and will scale to fit its container width
 * while maintaining aspect ratio. Use maxWidth to constrain the maximum size.
 *
 * @example
 * Basic world map (responsive):
 * ```html
 * <asm-composable-map [width]="800" [height]="400">
 *   <ng-container [asmGeographies]="worldDataUrl"></ng-container>
 * </asm-composable-map>
 * ```
 *
 * @example
 * Map with max width constraint:
 * ```html
 * <asm-composable-map
 *   [width]="960"
 *   [height]="600"
 *   [maxWidth]="960"
 *   projection="geoMercator">
 *   <!-- Map content -->
 * </asm-composable-map>
 * ```
 */
@Component({
  selector: 'asm-composable-map',
  standalone: true,
  template: `
    <svg
      [attr.viewBox]="viewBox()"
      [style.max-width]="maxWidth() ? maxWidth() + 'px' : '100%'"
      class="asm-map">
      <ng-content></ng-content>
    </svg>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .asm-map {
      width: 100%;
      height: auto;
      display: block;
      margin:auto;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: MAP_CONTEXT,
      useFactory: () => {
        const component = inject(ComposableMapComponent);
        return component.mapContext;
      }
    }
  ]
})
export class ComposableMapComponent {
  private readonly projectionService = inject(ProjectionService);

  constructor() {
    // Component initialized
  }

  /**
   * Map width in pixels
   */
  width = input<number>(800);

  /**
   * Map height in pixels
   */
  height = input<number>(400);

  /**
   * Maximum width in pixels (optional, for constraining responsive size)
   */
  maxWidth = input<number | null>(null);

  /**
   * Projection type (default: geoEqualEarth)
   */
  projection = input<ProjectionType>('geoEqualEarth');

  /**
   * Projection configuration options
   */
  projectionConfig = input<ProjectionConfig>({});

  /**
   * Map context signal - recomputes when inputs change
   */
  readonly mapContext = computed<MapContext>(() => {
    const proj = this.projectionService.createProjection(
      this.projection(),
      this.projectionConfig(),
      this.width(),
      this.height()
    );

    return {
      projection: proj,
      path: geoPath().projection(proj),
      width: this.width(),
      height: this.height()
    };
  });

  /**
   * SVG viewBox attribute
   */
  protected readonly viewBox = computed(() =>
    `0 0 ${this.width()} ${this.height()}`
  );
}
