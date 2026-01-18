# ng-simple-maps

[![npm version](https://badge.fury.io/js/ng-simple-maps.svg)](https://badge.fury.io/js/ng-simple-maps)
[![Build Status](https://github.com/hanafnafs/ng-simple-maps/actions/workflows/deploy.yml/badge.svg)](https://github.com/hanafnafs/ng-simple-maps/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Angular](https://img.shields.io/badge/Angular-15%2B-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

**Beautiful, lightweight SVG world maps for Angular applications.** Create stunning interactive choropleth maps, data visualizations, geographic dashboards, and analytics with D3 geo projections. Perfect for business intelligence, travel apps, educational tools, and corporate websites.

(https://raw.githubusercontent.com/hanafnafs/ng-simple-maps/main/assets/preview.png)

## 🚀 Live Demo & Documentation

**[View Interactive Demo →](https://hanafnafs.github.io/ng-simple-maps/)**

## Angular Version Support

This library supports **Angular 15+**.

> **Peer Dependencies:** `@angular/core@>=15.0.0` and `@angular/common@>=15.0.0`

🗺️ **World Map Library** | 📊 **Data Visualization** | 🌍 **Geographic Mapping** | 📱 **Responsive Design** | ⚡ **Interactive Maps**

## Features

- **One Simple Component** - Everything you need in `<asm-map>`
- **Data-Driven** - Pass arrays of markers, annotations, and lines
- **Lines/Connections** - Draw curved flight paths between points
- **Choropleth Maps** - Color countries by data values
- **Country Labels** - Show country names with zoom-based visibility
- **Zoom to Feature** - Click countries to zoom and center on them
- **Graticule Grid** - Latitude/longitude grid lines
- **Zoom & Pan** - Enable with a single property
- **Tooltips** - Automatic on hover, fully customizable
- **15+ Projections** - Mercator, Equal Earth, Orthographic, and more
- **Continent Filtering** - Show only the regions you need
- **Multiple Marker Shapes** - Circle, diamond, pin, star
- **Fully Responsive** - Scales to any screen size
- **TypeScript** - Full type safety

## Installation

```bash
npm install ng-simple-maps
```

## Quick Start

```typescript
import { Component } from '@angular/core';
import { MapComponent } from 'ng-simple-maps';

@Component({
  imports: [MapComponent],
  template: `
    <asm-map
      [geography]="worldData"
      [zoomable]="true"
      [showTooltip]="true">
    </asm-map>
  `
})
export class MyComponent {
  worldData = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
}
```

That's it! You have a fully interactive world map with zoom, pan, and tooltips.

## Examples

### With Markers

```typescript
import { MapComponent, MapMarker } from 'ng-simple-maps';

@Component({
  imports: [MapComponent],
  template: `
    <asm-map
      [geography]="worldData"
      [markers]="markers"
      [zoomable]="true"
      [showTooltip]="true"
      (markerClick)="onMarkerClick($event)">
    </asm-map>
  `
})
export class MyComponent {
  worldData = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

  markers: MapMarker[] = [
    { coordinates: [-74.006, 40.7128], label: 'New York', color: '#FF5533' },
    { coordinates: [2.3522, 48.8566], label: 'Paris', color: '#FFD700', size: 8 },
    { coordinates: [37.6173, 55.7558], label: 'Moscow', shape: 'diamond' }
  ];

  onMarkerClick(event) {
    console.log('Clicked:', event.marker.label);
  }
}
```

### With Annotations

```typescript
markers: MapMarker[] = [
  { coordinates: [-74.006, 40.7128], label: 'New York' }
];

annotations: MapAnnotation[] = [
  { coordinates: [-74.006, 40.7128], text: 'New York', dx: 50, dy: -30, curve: 0.5 }
];
```

```html
<asm-map
  [geography]="worldData"
  [markers]="markers"
  [annotations]="annotations">
</asm-map>
```

### Continent Filtering

```html
<!-- Single continent -->
<asm-map [geography]="worldData" continents="Europe"></asm-map>

<!-- Multiple continents -->
<asm-map [geography]="worldData" [continents]="['Asia', 'Europe']"></asm-map>
```

### Custom Styling

```html
<asm-map
  [geography]="worldData"
  fill="#457B9D"
  stroke="#1D3557"
  hoverFill="#2A4D6E"
  [tooltipConfig]="{ backgroundColor: '#1D3557', textColor: '#fff' }">
</asm-map>
```

### Different Projections

```html
<!-- Globe view -->
<asm-map [geography]="worldData" projection="geoOrthographic"></asm-map>

<!-- Mercator -->
<asm-map [geography]="worldData" projection="geoMercator"></asm-map>

<!-- Rotated orthographic (custom view) -->
<asm-map 
  [geography]="worldData" 
  projection="geoOrthographic"
  [projectionConfig]="{ rotate: [-10, -20] }">
</asm-map>

<!-- Centered on Asia -->
<asm-map 
  [geography]="worldData" 
  projection="geoEqualEarth"
  [projectionConfig]="{ center: [100, 30] }">
</asm-map>
```

### Lines/Connections (Flight Paths)

```typescript
import { MapComponent, MapLine } from 'ng-simple-maps';

lines: MapLine[] = [
  { from: [-74.006, 40.7128], to: [-0.1276, 51.5074], color: '#E91E63', curve: 0.4 },
  { from: [-74.006, 40.7128], to: [139.6917, 35.6895], color: '#3F51B5', curve: 0.5, dashed: true }
];
```

```html
<asm-map
  [geography]="worldData"
  [lines]="lines"
  (lineClick)="onLineClick($event)">
</asm-map>
```

### Choropleth Maps (Data Coloring)

```typescript
import { MapComponent, ChoroplethData } from 'ng-simple-maps';

populationData: ChoroplethData = {
  'United States of America': 330,
  'China': 1400,
  'India': 1380,
  'Brazil': 212
};
```

```html
<asm-map
  [geography]="worldData"
  [choroplethData]="populationData"
  [choroplethConfig]="{
    matchKey: 'name',
    colors: ['#FFF3E0', '#FFCC80', '#FFA726', '#F57C00', '#E65100'],
    nullColor: '#ECECEC'
  }">
</asm-map>
```

### Graticule (Grid Lines)

```html
<asm-map
  [geography]="worldData"
  projection="geoOrthographic"
  [showGraticule]="true"
  [graticuleConfig]="{ step: [15, 15], color: '#B3E5FC', opacity: 0.8 }">
</asm-map>
```

### Country Labels

```html
<asm-map
  [geography]="worldData"
  [showLabels]="true"
  [labelMinZoom]="2"
  [labelColor]="'#333'"
  [labelFontSize]="14"
  [zoomable]="true">
</asm-map>
```

### Zoom to Feature

```html
<asm-map
  [geography]="worldData"
  [zoomable]="true"
  [zoomOnClick]="true"
  [zoomOnClickLevel]="4"
  [zoomAnimationDuration]="1000">
</asm-map>
```

## API Reference

### MapComponent Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `geography` | `string \| object` | **required** | Geography data URL or TopoJSON/GeoJSON object |
| `width` | `number` | `800` | Map width (for aspect ratio) |
| `height` | `number` | `400` | Map height (for aspect ratio) |
| `maxWidth` | `number` | `null` | Maximum width constraint |
| `projection` | `string` | `'geoEqualEarth'` | D3 projection type |
| `projectionConfig` | `ProjectionConfig` | `{}` | Projection configuration options |
| `continents` | `string \| string[]` | `null` | Filter by continent(s) |
| `fill` | `string` | `'#ECECEC'` | Geography fill color |
| `stroke` | `string` | `'#D6D6D6'` | Geography stroke color |
| `strokeWidth` | `number` | `0.5` | Geography stroke width |
| `hoverFill` | `string` | `null` | Fill color on hover |
| `markers` | `MapMarker[]` | `[]` | Array of markers |
| `annotations` | `MapAnnotation[]` | `[]` | Array of annotations |
| `markerColor` | `string` | `'#FF5533'` | Default marker color |
| `markerSize` | `number` | `6` | Default marker size |
| `lines` | `MapLine[]` | `[]` | Array of lines/connections |
| `lineColor` | `string` | `'#FF5533'` | Default line color |
| `lineStrokeWidth` | `number` | `2` | Default line stroke width |
| `choroplethData` | `ChoroplethData` | `null` | Data for coloring geographies |
| `choroplethConfig` | `ChoroplethConfig` | `null` | Choropleth styling config |
| `showGraticule` | `boolean` | `false` | Show grid lines |
| `graticuleConfig` | `GraticuleConfig` | `null` | Graticule styling config |
| `zoomable` | `boolean` | `false` | Enable zoom and pan |
| `showZoomControls` | `boolean` | `true` | Show zoom buttons |
| `minZoom` | `number` | `1` | Minimum zoom level |
| `maxZoom` | `number` | `8` | Maximum zoom level |
| `zoomOnClick` | `boolean` | `false` | Zoom to country on click |
| `zoomOnClickLevel` | `number` | `4` | Zoom level when clicking country |
| `zoomAnimationDuration` | `number` | `800` | Animation duration in milliseconds |
| `showTooltip` | `boolean` | `false` | Show tooltip on hover |
| `tooltipConfig` | `TooltipConfig` | `null` | Tooltip styling |
| `showLabels` | `boolean` | `false` | Show country labels |
| `labelMinZoom` | `number` | `1` | Minimum zoom level to show labels |
| `labelFontSize` | `number` | `12` | Label font size |
| `labelColor` | `string` | `'#333'` | Label text color |
| `labelFontWeight` | `string \| number` | `'normal'` | Label font weight |

### MapComponent Outputs

| Output | Type | Description |
|--------|------|-------------|
| `countryClick` | `MapGeographyEvent` | Emitted when a country is clicked |
| `countryHover` | `MapGeographyEvent` | Emitted when hovering over a country |
| `countryLeave` | `void` | Emitted when mouse leaves a country |
| `markerClick` | `MapMarkerEvent` | Emitted when a marker is clicked |
| `lineClick` | `MapLineEvent` | Emitted when a line is clicked |

### MapMarker Interface

```typescript
interface MapMarker {
  coordinates: [number, number];  // [longitude, latitude]
  label?: string;                 // Optional label
  color?: string;                 // Fill color
  stroke?: string;                // Stroke color
  size?: number;                  // Size/radius (6-12 for icons, 16-24 for detailed SVGs)
  shape?: 'circle' | 'diamond' | 'pin' | 'star' | 'custom';
  customSvg?: string;             // SVG path data for shape='custom'
  customSvgSize?: number;         // ViewBox size for custom SVG (default: 24)
  data?: Record<string, unknown>; // Custom data
}
```

### Custom SVG Markers

Three ways to use custom SVG icons as markers:

#### Option 1: Path Data Only (Recommended)
Just the `d` attribute value - most lightweight:

```typescript
const AIRPLANE = 'M21,16V14L13,9V3.5A1.5,1.5,0,0,0,11.5,2...Z';

markers: MapMarker[] = [
  { coordinates: [-118.24, 34.05], shape: 'custom', customSvg: AIRPLANE, size: 10 }
];
```

#### Option 2: Full SVG Markup
For complex icons with multiple elements:

```typescript
const PIN = `<svg viewBox="0 0 24 24">
  <path d="M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z"/>
  <circle cx="12" cy="9" r="2.5" fill="white"/>
</svg>`;

markers: MapMarker[] = [
  { coordinates: [121.47, 31.23], shape: 'custom', customSvg: PIN, size: 12 }
];
```

#### Option 3: Load from URL
Load SVG files from your assets folder:

```typescript
markers: MapMarker[] = [
  { coordinates: [0, 0], shape: 'custom', customSvgUrl: '/assets/icons/marker.svg', size: 12 }
];
```

**SVG Size Guidelines:**
| Use Case | `size` | Description |
|----------|--------|-------------|
| Small icons | 6-8 | Simple shapes |
| Standard | 10-12 | **Recommended** |
| Large/detailed | 14-18 | Fine details |

| Icon Set | `customSvgSize` |
|----------|-----------------|
| Material Design | 24 (default) |
| Font Awesome | 24 |
| Custom 16px | 16 |

### MapAnnotation Interface

```typescript
interface MapAnnotation {
  coordinates: [number, number];  // [longitude, latitude]
  text: string;                   // Label text
  dx?: number;                    // Horizontal offset (default: 30)
  dy?: number;                    // Vertical offset (default: -30)
  curve?: number;                 // Connector curve (0-1, default: 0)
  color?: string;                 // Text and connector color
  fontSize?: number;              // Font size
  fontWeight?: string | number;   // Font weight
}
```

### TooltipConfig Interface

```typescript
interface TooltipConfig {
  backgroundColor?: string;  // Default: '#fff'
  textColor?: string;        // Default: '#333'
  titleColor?: string;       // Default: same as textColor
  borderColor?: string;      // Default: '#ccc'
  borderRadius?: number;     // Default: 4
}
```

### MapLine Interface

```typescript
interface MapLine {
  from: [number, number];    // Starting [longitude, latitude]
  to: [number, number];      // Ending [longitude, latitude]
  color?: string;            // Line color
  strokeWidth?: number;      // Line thickness
  curve?: number;            // Arc height (0 = straight, higher = more curved)
  dashed?: boolean;          // Dashed line style
  data?: Record<string, unknown>; // Custom data
}
```

### ChoroplethConfig Interface

```typescript
interface ChoroplethConfig {
  matchKey?: string;      // Property to match (default: 'name')
  colors?: string[];      // Color scale from low to high
  minValue?: number;      // Override minimum value
  maxValue?: number;      // Override maximum value
  nullColor?: string;     // Color for missing data (default: '#ECECEC')
}
```

### GraticuleConfig Interface

```typescript
interface GraticuleConfig {
  step?: [number, number];  // Grid spacing in degrees (default: [10, 10])
  color?: string;           // Line color (default: '#ccc')
  strokeWidth?: number;     // Line thickness (default: 0.5)
  opacity?: number;         // Line opacity (default: 0.5)
}
```

### ProjectionConfig Interface

```typescript
interface ProjectionConfig {
  rotate?: [number, number, number?];  // Rotation angles [lambda, phi, gamma] in degrees
  center?: [number, number];           // Center coordinates [longitude, latitude]
  scale?: number;                      // Scale factor for the projection
  parallels?: [number, number];        // Standard parallels for conic projections
  translate?: [number, number];        // Translation offset [x, y]
  precision?: number;                  // Precision threshold for adaptive resampling
  clipAngle?: number;                  // Clipping angle for azimuthal projections
}
```

### Available Projections

- `geoEqualEarth` (default)
- `geoMercator`
- `geoOrthographic`
- `geoNaturalEarth1`
- `geoAlbers`
- `geoAlbersUsa`
- `geoAzimuthalEqualArea`
- `geoAzimuthalEquidistant`
- `geoConicConformal`
- `geoConicEqualArea`
- `geoConicEquidistant`
- `geoEquirectangular`
- `geoGnomonic`
- `geoStereographic`
- `geoTransverseMercator`

### Continent Options

- `'Africa'`
- `'Asia'`
- `'Europe'`
- `'North America'`
- `'South America'`
- `'Oceania'`
- `'Antarctica'`

## TopoJSON Data Sources

### World Atlas (Recommended)

Free, high-quality world country data maintained by Mike Bostock. Choose the right resolution for your use case:

#### CDN Links (Ready to Use)
```typescript
// Fast loading (13KB) - for mobile apps and overview maps
worldData = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Balanced quality (23KB) - recommended for web apps
worldData = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

// High detail (94KB) - for detailed maps and print quality
worldData = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-10m.json';
```

#### Resolution Guide

| Resolution | File Size | Use Case | Best For |
|------------|-----------|----------|----------|
| **110m** | 13KB | Fast loading | Mobile apps, overview maps, low bandwidth |
| **50m** | 23KB | **Recommended** | Web applications, general purpose |
| **10m** | 94KB | High detail | Desktop apps, print quality, detailed viewing |

#### Available Files
- `countries-110m.json` - Low resolution, fast loading
- `countries-50m.json` - Medium resolution, balanced (used in all demos)
- `countries-10m.json` - High resolution, detailed

### Other Data Sources
- [World Atlas GitHub](https://github.com/topojson/world-atlas) - Source repository
- [Natural Earth](https://www.naturalearthdata.com/) - Free map data in various formats
- [TopoJSON Collection](https://github.com/holtzy/D3-graph-gallery/tree/master/DATA) - Various geographic datasets

### Local Files
You can also download and serve TopoJSON files from your own assets folder:

```typescript
// From local assets
worldData = '/assets/data/countries-50m.json';
```

## License

MIT

## Credits

Inspired by [react-simple-maps](https://github.com/zcreativelabs/react-simple-maps). Built with [D3 Geo](https://github.com/d3/d3-geo).
