import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { NgStyle } from '@angular/common';

/**
 * Tooltip data structure for displaying geography information
 */
export interface TooltipData {
  name?: string;
  [key: string]: unknown;
}

/**
 * Simple tooltip component for displaying geography information on hover
 *
 * @example
 * Basic usage:
 * ```html
 * <asm-tooltip
 *   [visible]="tooltipVisible()"
 *   [x]="tooltipX()"
 *   [y]="tooltipY()"
 *   [data]="tooltipData()">
 * </asm-tooltip>
 * ```
 *
 * @example
 * Customized styling:
 * ```html
 * <asm-tooltip
 *   [visible]="tooltipVisible()"
 *   [x]="tooltipX()"
 *   [y]="tooltipY()"
 *   [data]="tooltipData()"
 *   backgroundColor="#1D3557"
 *   textColor="#FFFFFF"
 *   titleColor="#A8DADC"
 *   borderColor="#457B9D">
 * </asm-tooltip>
 * ```
 */
@Component({
  selector: 'asm-tooltip',
  standalone: true,
  imports: [NgStyle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        class="asm-tooltip"
        [ngStyle]="tooltipStyles()">
        @if (data()?.name) {
          <div class="asm-tooltip-title" [ngStyle]="titleStyles()">{{ data()?.name }}</div>
        }
        @for (item of displayItems(); track item.key) {
          <div class="asm-tooltip-row">
            <span class="asm-tooltip-label" [ngStyle]="labelStyles()">{{ item.label }}:</span>
            <span class="asm-tooltip-value">{{ item.value }}</span>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .asm-tooltip {
      position: fixed;
      pointer-events: none;
      z-index: 1000;
      max-width: 250px;
    }

    .asm-tooltip-title {
      font-weight: 600;
      margin-bottom: 4px;
      padding-bottom: 4px;
      border-bottom: 1px solid;
    }

    .asm-tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 2px 0;
    }

    .asm-tooltip-label {
      opacity: 0.8;
    }

    .asm-tooltip-value {
      font-weight: 500;
    }
  `]
})
export class TooltipComponent {
  /**
   * Whether the tooltip is visible
   */
  visible = input<boolean>(false);

  /**
   * X position (in pixels from viewport left)
   */
  x = input<number>(0);

  /**
   * Y position (in pixels from viewport top)
   */
  y = input<number>(0);

  /**
   * Tooltip data to display
   */
  data = input<TooltipData | null>(null);

  /**
   * Offset from cursor (x direction)
   */
  offsetX = input<number>(10);

  /**
   * Offset from cursor (y direction)
   */
  offsetY = input<number>(10);

  /**
   * Keys to exclude from display
   */
  excludeKeys = input<string[]>(['name']);

  /**
   * Custom key labels mapping
   */
  keyLabels = input<Record<string, string>>({});

  /**
   * Background color
   */
  backgroundColor = input<string>('#ffffff');

  /**
   * Text color
   */
  textColor = input<string>('#333333');

  /**
   * Title text color (defaults to textColor if not set)
   */
  titleColor = input<string | null>(null);

  /**
   * Label text color (defaults to textColor with opacity if not set)
   */
  labelColor = input<string | null>(null);

  /**
   * Border color
   */
  borderColor = input<string>('#cccccc');

  /**
   * Border radius in pixels
   */
  borderRadius = input<number>(4);

  /**
   * Font size in pixels
   */
  fontSize = input<number>(13);

  /**
   * Padding in pixels
   */
  padding = input<number>(12);

  /**
   * Box shadow
   */
  boxShadow = input<string>('0 2px 8px rgba(0, 0, 0, 0.15)');

  /**
   * Computed tooltip container styles
   */
  protected readonly tooltipStyles = computed(() => ({
    left: `${this.x() + this.offsetX()}px`,
    top: `${this.y() + this.offsetY()}px`,
    backgroundColor: this.backgroundColor(),
    color: this.textColor(),
    border: `1px solid ${this.borderColor()}`,
    borderRadius: `${this.borderRadius()}px`,
    fontSize: `${this.fontSize()}px`,
    padding: `${this.padding()}px`,
    boxShadow: this.boxShadow()
  }));

  /**
   * Computed title styles
   */
  protected readonly titleStyles = computed(() => ({
    color: this.titleColor() || this.textColor(),
    borderBottomColor: this.borderColor()
  }));

  /**
   * Computed label styles
   */
  protected readonly labelStyles = computed(() => ({
    color: this.labelColor() || undefined
  }));

  /**
   * Computed display items from data
   */
  protected readonly displayItems = computed(() => {
    const currentData = this.data();
    if (!currentData) return [];

    const excluded = new Set(this.excludeKeys());
    const labels = this.keyLabels();

    return Object.entries(currentData)
      .filter(([key, value]) => !excluded.has(key) && value !== null && value !== undefined)
      .map(([key, value]) => ({
        key,
        label: labels[key] || this.formatKey(key),
        value: this.formatValue(value)
      }));
  });

  private formatKey(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private formatValue(value: unknown): string {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  }
}
