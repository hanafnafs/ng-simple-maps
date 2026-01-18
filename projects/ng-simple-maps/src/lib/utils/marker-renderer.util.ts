import { Renderer2 } from '@angular/core';
import { MarkerShape } from '../components/map/map.types';

// Utility functions for creating marker shapes
// Handles all the different marker types and custom SVG creation

export class MarkerRendererUtil {
  static createMarkerShape(
    renderer: Renderer2,
    shape: MarkerShape,
    size: number,
    fill: string,
    stroke: string,
    customSvg?: string,
    customSvgSize?: number
  ): SVGElement {
    let el: SVGElement;

    switch (shape) {
      case 'custom':
        if (customSvg) {
          const isSvgMarkup = customSvg.trim().toLowerCase().startsWith('<svg');
          
          if (isSvgMarkup) {
            return this.createFromSvgMarkup(renderer, customSvg, size, fill, stroke, customSvgSize);
          } else {
            return this.createFromPathData(renderer, customSvg, size, fill, stroke, customSvgSize);
          }
        }
        // Fallback to circle if no customSvg provided
        el = renderer.createElement('circle', 'svg');
        renderer.setAttribute(el, 'r', String(size));
        break;

      case 'diamond':
        el = renderer.createElement('path', 'svg');
        renderer.setAttribute(el, 'd', `M0,${-size} L${size * 0.7},0 L0,${size} L${-size * 0.7},0 Z`);
        break;

      case 'pin':
        el = renderer.createElement('path', 'svg');
        const pinH = size * 2.5;
        renderer.setAttribute(el, 'd',
          `M0,${-pinH} C${-size},${-pinH} ${-size * 1.2},${-pinH * 0.6} ${-size * 1.2},${-pinH * 0.4} ` +
          `C${-size * 1.2},${-pinH * 0.2} 0,0 0,0 C0,0 ${size * 1.2},${-pinH * 0.2} ${size * 1.2},${-pinH * 0.4} ` +
          `C${size * 1.2},${-pinH * 0.6} ${size},${-pinH} 0,${-pinH} Z`
        );
        break;

      case 'star':
        el = renderer.createElement('path', 'svg');
        const points = 5;
        const outerR = size;
        const innerR = size * 0.4;
        let d = '';
        for (let i = 0; i < points * 2; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (Math.PI / points) * i - Math.PI / 2;
          const px = r * Math.cos(angle);
          const py = r * Math.sin(angle);
          d += (i === 0 ? 'M' : 'L') + `${px},${py}`;
        }
        d += 'Z';
        renderer.setAttribute(el, 'd', d);
        break;

      case 'circle':
      default:
        el = renderer.createElement('circle', 'svg');
        renderer.setAttribute(el, 'r', String(size));
        break;
    }

    renderer.setAttribute(el, 'fill', fill);
    renderer.setAttribute(el, 'stroke', stroke);
    renderer.setAttribute(el, 'stroke-width', '2');

    return el;
  }

  private static createFromPathData(
    renderer: Renderer2,
    pathData: string,
    size: number,
    fill: string,
    stroke: string,
    customSvgSize?: number
  ): SVGElement {
    const el = renderer.createElement('g', 'svg');
    const pathEl = renderer.createElement('path', 'svg');

    const viewBoxSize = customSvgSize || 24;
    const scale = (size * 2) / viewBoxSize;
    const offset = -viewBoxSize / 2;
    
    renderer.setAttribute(el, 'transform', `scale(${scale}) translate(${offset}, ${offset})`);
    renderer.setAttribute(pathEl, 'd', pathData);
    renderer.setAttribute(pathEl, 'fill', fill);
    renderer.setAttribute(pathEl, 'stroke', stroke);
    renderer.setAttribute(pathEl, 'stroke-width', String(1 / scale));
    renderer.appendChild(el, pathEl);
    
    return el;
  }

  private static createFromSvgMarkup(
    renderer: Renderer2,
    svgMarkup: string,
    size: number,
    fill: string,
    stroke: string,
    customSvgSize?: number
  ): SVGElement {
    const el = renderer.createElement('g', 'svg');

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgMarkup, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');

    if (!svgEl) {
      // Fallback to circle if parsing fails
      const circle = renderer.createElement('circle', 'svg');
      renderer.setAttribute(circle, 'r', String(size));
      renderer.setAttribute(circle, 'fill', fill);
      return circle;
    }

    let viewBoxSize = customSvgSize || 24;
    const viewBox = svgEl.getAttribute('viewBox');
    if (viewBox && !customSvgSize) {
      const parts = viewBox.split(/[\s,]+/);
      if (parts.length >= 4) {
        viewBoxSize = Math.max(parseFloat(parts[2]), parseFloat(parts[3]));
      }
    }

    const scale = (size * 2) / viewBoxSize;
    const offset = -viewBoxSize / 2;
    renderer.setAttribute(el, 'transform', `scale(${scale}) translate(${offset}, ${offset})`);

    Array.from(svgEl.children).forEach(child => {
      const clone = child.cloneNode(true) as SVGElement;
      if (!clone.getAttribute('fill') || clone.getAttribute('fill') === 'currentColor') {
        clone.setAttribute('fill', fill);
      }
      if (!clone.getAttribute('stroke')) {
        clone.setAttribute('stroke', stroke);
        clone.setAttribute('stroke-width', String(1 / scale));
      }
      el.appendChild(clone);
    });

    return el;
  }

  static loadSvgMarker(
    renderer: Renderer2,
    url: string,
    markerGroup: SVGGElement,
    size: number,
    fill: string,
    stroke: string,
    customSvgSize?: number
  ): void {
    // Add a placeholder circle while loading
    const placeholder = renderer.createElement('circle', 'svg');
    renderer.setAttribute(placeholder, 'r', String(size / 2));
    renderer.setAttribute(placeholder, 'fill', fill);
    renderer.setAttribute(placeholder, 'opacity', '0.3');
    renderer.appendChild(markerGroup, placeholder);

    // Fetch the SVG file
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`Failed to load SVG: ${url}`);
        return response.text();
      })
      .then(svgMarkup => {
        // Remove placeholder
        if (placeholder.parentNode) {
          placeholder.parentNode.removeChild(placeholder);
        }

        // Create marker from loaded SVG
        const shapeEl = this.createFromSvgMarkup(renderer, svgMarkup, size, fill, stroke, customSvgSize);
        renderer.appendChild(markerGroup, shapeEl);
      })
      .catch(err => {
        console.error('Error loading SVG marker:', err);
        // Replace placeholder with solid circle on error
        renderer.setAttribute(placeholder, 'opacity', '1');
      });
  }
}