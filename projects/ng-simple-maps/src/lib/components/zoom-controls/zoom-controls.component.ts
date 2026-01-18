import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  ViewEncapsulation
} from '@angular/core';
import { NgStyle } from '@angular/common';

/**
 * Zoom control action type
 */
export type ZoomControlAction = 'zoomIn' | 'zoomOut' | 'reset';

/**
 * ZoomControlsComponent - Provides zoom buttons for map navigation
 *
 * A simple set of zoom controls that can be positioned over the map.
 * Connect to ZoomableGroupComponent methods for zoom functionality.
 *
 * @example
 * Basic usage with ZoomableGroup:
 * ```html
 * <div style="position: relative;">
 *   <asm-composable-map>
 *     <asm-zoomable-group #zoomGroup>
 *       <ng-container [asmGeographies]="worldData"></ng-container>
 *     </asm-zoomable-group>
 *   </asm-composable-map>
 *
 *   <asm-zoom-controls
 *     (zoomIn)="zoomGroup.zoomIn()"
 *     (zoomOut)="zoomGroup.zoomOut()"
 *     (reset)="zoomGroup.resetZoom()">
 *   </asm-zoom-controls>
 * </div>
 * ```
 */
@Component({
  selector: 'asm-zoom-controls',
  standalone: true,
  imports: [NgStyle],
  template: `
    <div class="asm-zoom-controls" [ngStyle]="containerStyles()">
      <button
        class="asm-zoom-btn"
        [ngStyle]="buttonStyles()"
        (click)="onZoomIn()"
        title="Zoom in"
        aria-label="Zoom in">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </button>
      <button
        class="asm-zoom-btn"
        [ngStyle]="buttonStyles()"
        (click)="onZoomOut()"
        title="Zoom out"
        aria-label="Zoom out">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3 8h10" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </button>
      @if (showReset()) {
        <button
          class="asm-zoom-btn"
          [ngStyle]="buttonStyles()"
          (click)="onReset()"
          title="Reset zoom"
          aria-label="Reset zoom">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l2 2M10 10l2 2M4 12l2-2M10 4l2 2" stroke="currentColor" stroke-width="1.5" fill="none"/>
          </svg>
        </button>
      }
    </div>
  `,
  styles: [`
    .asm-zoom-controls {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .asm-zoom-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: none;
      transition: background-color 0.2s, transform 0.1s;
    }

    .asm-zoom-btn:hover {
      filter: brightness(0.95);
    }

    .asm-zoom-btn:active {
      transform: scale(0.95);
    }

    .asm-zoom-btn:focus {
      outline: 2px solid #4A90E2;
      outline-offset: 2px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ZoomControlsComponent {
  /**
   * Position from top edge
   */
  top = input<string>('10px');

  /**
   * Position from right edge
   */
  right = input<string>('10px');

  /**
   * Position from bottom edge (overrides top if set)
   */
  bottom = input<string | null>(null);

  /**
   * Position from left edge (overrides right if set)
   */
  left = input<string | null>(null);

  /**
   * Button size in pixels
   */
  buttonSize = input<number>(32);

  /**
   * Button background color
   */
  backgroundColor = input<string>('#ffffff');

  /**
   * Button text/icon color
   */
  color = input<string>('#333333');

  /**
   * Button border radius
   */
  borderRadius = input<number>(4);

  /**
   * Box shadow
   */
  boxShadow = input<string>('0 2px 4px rgba(0,0,0,0.2)');

  /**
   * Whether to show the reset button
   */
  showReset = input<boolean>(true);

  /**
   * Emitted when zoom in is clicked
   */
  zoomIn = output<void>();

  /**
   * Emitted when zoom out is clicked
   */
  zoomOut = output<void>();

  /**
   * Emitted when reset is clicked
   */
  reset = output<void>();

  /**
   * Computed container styles
   */
  protected containerStyles = () => ({
    position: 'absolute' as const,
    top: this.bottom() ? 'auto' : this.top(),
    right: this.left() ? 'auto' : this.right(),
    bottom: this.bottom() || 'auto',
    left: this.left() || 'auto',
    zIndex: '10'
  });

  /**
   * Computed button styles
   */
  protected buttonStyles = () => ({
    width: `${this.buttonSize()}px`,
    height: `${this.buttonSize()}px`,
    backgroundColor: this.backgroundColor(),
    color: this.color(),
    borderRadius: `${this.borderRadius()}px`,
    boxShadow: this.boxShadow()
  });

  protected onZoomIn(): void {
    this.zoomIn.emit();
  }

  protected onZoomOut(): void {
    this.zoomOut.emit();
  }

  protected onReset(): void {
    this.reset.emit();
  }
}
