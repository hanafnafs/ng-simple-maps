import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CodeExampleComponent } from '../code-example/code-example.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import {
  MapComponent,
  MapMarker,
  MapAnnotation,
  MapLine,
  ChoroplethData,
  MapMarkerEvent
} from '../../../../projects/ng-simple-maps/src/public-api';

@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [CommonModule, RouterModule, CodeExampleComponent, MapComponent, SidebarComponent],
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.css']
})
export class DocumentationComponent {
  // World map data
  worldData = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

  installCode = 'npm install ng-simple-maps';

  basicImportCode = `import { Component } from '@angular/core';
import { MapComponent } from 'ng-simple-maps';

@Component({
  selector: 'app-root',
  imports: [MapComponent],
  template: './app.component.html'
})
export class AppComponent {
  worldData = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';
}`;

  basicTemplateCode = `<asm-map
  [geography]="worldData"
  [width]="800"
  [height]="400">
</asm-map>`;

  dataSourceCode = `// Fast loading for mobile (13KB)
worldData = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Recommended for web apps (23KB)
worldData = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

// High detail for desktop (94KB)
worldData = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-10m.json';`;

  markersBasicCode = `import { MapMarker } from 'ng-simple-maps';

markers: MapMarker[] = [
  { coordinates: [-74.006, 40.7128], label: 'New York' },
  { coordinates: [2.3522, 48.8566], label: 'Paris', color: '#ff6b6b' },
  { coordinates: [139.6917, 35.6895], label: 'Tokyo', size: 8 }
];

// In template
<asm-map
  [geography]="worldData"
  [markers]="markers"
  [showTooltip]="true"
  (markerClick)="onMarkerClick($event)">
</asm-map>`;

  markersCustomCode = `// SVG path icons (Material Design icons at 24x24 viewBox)
readonly AIRPLANE_ICON = 'M21,16V14L13,9V3.5A1.5,1.5,0,0,0,11.5,2A1.5,1.5,0,0,0,10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5L21,16Z';

customMarkers: MapMarker[] = [
  { coordinates: [-74.006, 40.7128], label: 'NYC', shape: 'circle' },
  { coordinates: [2.3522, 48.8566], label: 'Paris', shape: 'diamond', color: '#e91e63' },
  { coordinates: [139.6917, 35.6895], label: 'Tokyo', shape: 'pin', color: '#ff9800' },
  { coordinates: [-0.1276, 51.5074], label: 'London', shape: 'star', color: '#9c27b0' },
  { coordinates: [-118.2437, 34.0522], label: 'LA', shape: 'custom', customSvg: this.AIRPLANE_ICON, size: 10 }
];`;

  advancedMarkersCode = `// Advanced marker configurations with custom SVGs, strokes, and data
readonly HEART_ICON = 'M12,21.35L10.55,20.03C5.4,15.36,2,12.27,2,8.5C2,5.41,4.42,3,7.5,3C9.24,3,10.91,3.81,12,5.08C13.09,3.81,14.76,3,16.5,3C19.58,3,22,5.41,22,8.5C22,12.27,18.6,15.36,13.45,20.03L12,21.35Z';
readonly BUILDING_ICON = 'M16 2H8C6.9 2 6 2.9 6 4V20C6 21.1 6.9 22 8 22H16C17.1 22 18 21.1 18 20V4C18 2.9 17.1 2 16 2M10 4H14V6H10V4M10 8H14V10H10V8M10 12H14V14H10V12M10 16H14V18H10V16Z';

advancedMarkers: MapMarker[] = [
  { 
    coordinates: [-74.006, 40.7128], 
    label: 'NYC Financial District', 
    shape: 'custom', 
    customSvg: this.BUILDING_ICON,
    size: 14,
    color: '#1e40af',
    stroke: '#ffffff',        // White outline
    data: { type: 'financial', importance: 'high' }
  },
  { 
    coordinates: [2.3522, 48.8566], 
    label: 'Paris Love Lock Bridge', 
    shape: 'custom', 
    customSvg: this.HEART_ICON,
    size: 12,
    color: '#dc2626',
    stroke: '#fecaca',        // Light pink outline
    data: { type: 'romantic', visitors: 15000000 }
  },
  {
    coordinates: [-118.2437, 34.0522],
    label: 'LA Airport Hub',
    shape: 'custom',
    customSvg: this.AIRPLANE_ICON,
    customSvgSize: 24,        // Explicit SVG viewBox size
    size: 16,                 // Rendered size
    color: '#ea580c',
    stroke: '#fed7aa',
    data: { type: 'transport', dailyFlights: 1500 }
  }
];

// External SVG file example
markersWithExternalSvg: MapMarker[] = [
  {
    coordinates: [-122.4194, 37.7749],
    label: 'Custom Icon from File',
    shape: 'custom',
    customSvgUrl: '/assets/icons/custom-marker.svg',  // Load from file
    size: 20,
    color: '#10b981'
  }
];`;

  advancedLinesCode = `// Network topology with different line types
networkLines: MapLine[] = [
  // High-speed fiber connections (thick, solid)
  { 
    from: [-74.006, 40.7128], 
    to: [-122.4194, 37.7749], 
    color: '#059669', 
    strokeWidth: 4, 
    curve: 0.2,
    data: { speed: '100Gbps', latency: '12ms' }
  },
  
  // Medium-speed connections (dashed)
  { 
    from: [-74.006, 40.7128], 
    to: [2.3522, 48.8566], 
    color: '#fbbf24', 
    strokeWidth: 3, 
    curve: 0.3, 
    dashed: true,
    data: { speed: '10Gbps', latency: '89ms' }
  },
  
  // Backup connections (thin, light color)
  { 
    from: [-122.4194, 37.7749], 
    to: [103.8198, 1.3521], 
    color: '#94a3b8', 
    strokeWidth: 1, 
    curve: 0.5,
    data: { speed: '1Gbps', type: 'backup' }
  }
];

// Usage in template with event handling
<asm-map
  [geography]="worldData"
  [markers]="networkMarkers"
  [lines]="networkLines"
  [showTooltip]="true"
  (lineClick)="onLineClick($event)">
</asm-map>

// Event handler to show line details
onLineClick(event: MapLineEvent) {
  console.log('Line data:', event.line.data);
  console.log('Connection speed:', event.line.data?.speed);
}`;

  annotationsCode = `import { MapAnnotation } from 'ng-simple-maps';

annotations: MapAnnotation[] = [
  { coordinates: [-74.006, 40.7128], text: 'New York', dx: 60, dy: -25, curve: 0.5 },
  { coordinates: [2.3522, 48.8566], text: 'Paris', dx: -60, dy: -25, curve: 0.3 },
  { coordinates: [139.6917, 35.6895], text: 'Tokyo', dx: 50, dy: 35, curve: 0.4 }
];

<asm-map
  [geography]="worldData"
  [markers]="markers"
  [annotations]="annotations">
</asm-map>`;

  linesCode = `import { MapLine } from 'ng-simple-maps';

flightPaths: MapLine[] = [
  { from: [-74.006, 40.7128], to: [2.3522, 48.8566], color: '#e91e63', curve: 0.4 },
  { from: [2.3522, 48.8566], to: [139.6917, 35.6895], color: '#3f51b5', curve: 0.3 },
  { from: [-74.006, 40.7128], to: [139.6917, 35.6895], color: '#00bcd4', curve: 0.5, dashed: true }
];

<asm-map
  [geography]="worldData"
  [markers]="airports"
  [lines]="flightPaths">
</asm-map>`;

  choroplethCode = `import { ChoroplethData } from 'ng-simple-maps';

populationData: ChoroplethData = {
  'China': 1439,
  'India': 1380,
  'United States of America': 331,
  'Indonesia': 273,
  'Brazil': 212
};

choroplethConfig = {
  matchKey: 'name',
  colors: ['#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3'],
  nullColor: '#f5f5f5'
};

<asm-map
  [geography]="worldData"
  [choroplethData]="populationData"
  [choroplethConfig]="choroplethConfig">
</asm-map>`;

  projectionsCode = `<!-- Globe view -->
<asm-map projection="geoOrthographic" [geography]="worldData"></asm-map>

<!-- Mercator projection -->
<asm-map projection="geoMercator" [geography]="worldData"></asm-map>

<!-- Natural Earth -->
<asm-map projection="geoNaturalEarth1" [geography]="worldData"></asm-map>

<!-- Rotated orthographic -->
<asm-map 
  projection="geoOrthographic"
  [projectionConfig]="{ rotate: [-10, -20] }"
  [geography]="worldData">
</asm-map>`;

  zoomPanCode = `<asm-map
  [geography]="worldData"
  [zoomable]="true"
  [showZoomControls]="true"
  [minZoom]="1"
  [maxZoom]="8">
</asm-map>`;

  clickZoomCode = `<asm-map
  [geography]="worldData"
  [zoomable]="true"
  [zoomOnClick]="true"
  [zoomOnClickLevel]="4"
  [zoomAnimationDuration]="1000"
  hoverFill="#daa520">
</asm-map>`;

  labelsCode = `<asm-map
  [geography]="worldData"
  [zoomable]="true"
  [showLabels]="true"
  [labelMinZoom]="2"
  [labelFontSize]="11"
  [labelColor]="'#1e40af'"
  [labelFontWeight]="'600'">
</asm-map>`;

  graticuleCode = `graticuleConfig = {
  step: [15, 15],
  color: '#b0e0e6',
  strokeWidth: 1,
  opacity: 0.7
};

<asm-map
  [geography]="worldData"
  projection="geoOrthographic"
  [showGraticule]="true"
  [graticuleConfig]="graticuleConfig">
</asm-map>`;

  stylingCode = `<!-- Dark theme -->
<asm-map
  [geography]="worldData"
  fill="#1f2937"
  stroke="#374151">
</asm-map>

<!-- With hover effects -->
<asm-map
  [geography]="worldData"
  fill="#f3f4f6"
  stroke="#9ca3af"
  hoverFill="#6366f1">
</asm-map>

<!-- Custom colors -->
<asm-map
  [geography]="worldData"
  fill="#457B9D"
  stroke="#1D3557"
  hoverFill="#2A4D6E">
</asm-map>`;

  tooltipsCode = `tooltipConfig = {
  backgroundColor: '#1D3557',
  textColor: '#fff',
  borderColor: '#457B9D',
  borderRadius: 6
};

<asm-map
  [geography]="worldData"
  [markers]="markers"
  [showTooltip]="true"
  [tooltipConfig]="tooltipConfig">
</asm-map>`;

  continentsCode = `<!-- Single continent -->
<asm-map [geography]="worldData" continents="Europe"></asm-map>

<!-- Multiple continents -->
<asm-map [geography]="worldData" [continents]="['Asia', 'Europe']"></asm-map>`;

  // Demo data
  demoMarkers: MapMarker[] = [
    { coordinates: [-74.006, 40.7128], label: 'New York', color: '#dc2626' },
    { coordinates: [2.3522, 48.8566], label: 'Paris', color: '#dc2626' },
    { coordinates: [139.6917, 35.6895], label: 'Tokyo', color: '#dc2626' },
    { coordinates: [-0.1276, 51.5074], label: 'London', color: '#dc2626' }
  ];

  // SVG icons for custom markers
  readonly AIRPLANE_ICON = 'M21,16V14L13,9V3.5A1.5,1.5,0,0,0,11.5,2A1.5,1.5,0,0,0,10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5L21,16Z';

  customMarkers: MapMarker[] = [
    { coordinates: [-74.006, 40.7128], label: 'NYC', shape: 'circle', color: '#3b82f6' },
    { coordinates: [2.3522, 48.8566], label: 'Paris', shape: 'diamond', color: '#e91e63' },
    { coordinates: [139.6917, 35.6895], label: 'Tokyo', shape: 'pin', color: '#ff9800' },
    { coordinates: [-0.1276, 51.5074], label: 'London', shape: 'star', color: '#9c27b0' },
    { coordinates: [-118.2437, 34.0522], label: 'LA', shape: 'custom', customSvg: this.AIRPLANE_ICON, size: 10, color: '#f59e0b' }
  ];

  annotationMarkers: MapMarker[] = [
    { coordinates: [-74.006, 40.7128], label: 'New York', color: '#dc2626', size: 8 },
    { coordinates: [2.3522, 48.8566], label: 'Paris', color: '#dc2626', size: 8 },
    { coordinates: [139.6917, 35.6895], label: 'Tokyo', color: '#dc2626', size: 8 }
  ];

  annotations: MapAnnotation[] = [
    { coordinates: [-74.006, 40.7128], text: 'New York', dx: 60, dy: -25, curve: 0.5 },
    { coordinates: [2.3522, 48.8566], text: 'Paris', dx: -60, dy: -25, curve: 0.3 },
    { coordinates: [139.6917, 35.6895], text: 'Tokyo', dx: 50, dy: 35, curve: 0.4 }
  ];

  flightMarkers: MapMarker[] = [
    { coordinates: [-74.006, 40.7128], label: 'New York JFK', color: '#ef4444' },
    { coordinates: [2.3522, 48.8566], label: 'Paris CDG', color: '#ef4444' },
    { coordinates: [139.6917, 35.6895], label: 'Tokyo Narita', color: '#ef4444' },
    { coordinates: [-0.1276, 51.5074], label: 'London Heathrow', color: '#ef4444' }
  ];

  flightPaths: MapLine[] = [
    { from: [-74.006, 40.7128], to: [2.3522, 48.8566], color: '#e91e63', curve: 0.4 },
    { from: [2.3522, 48.8566], to: [139.6917, 35.6895], color: '#9c27b0', curve: 0.3 },
    { from: [-74.006, 40.7128], to: [139.6917, 35.6895], color: '#3f51b5', curve: 0.5, dashed: true },
    { from: [-0.1276, 51.5074], to: [2.3522, 48.8566], color: '#673ab7', curve: 0.2 }
  ];

  populationData: ChoroplethData = {
    'China': 1439,
    'India': 1380,
    'United States of America': 331,
    'Indonesia': 273,
    'Brazil': 212,
    'Russia': 144,
    'Japan': 126,
    'Germany': 83,
    'United Kingdom': 67,
    'France': 67
  };

  choroplethConfig = {
    matchKey: 'name',
    colors: ['#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3'],
    nullColor: '#f5f5f5'
  };

  graticuleConfig = { 
    step: [15, 15] as [number, number], 
    color: '#b0e0e6', 
    strokeWidth: 1, 
    opacity: 0.7 
  };

  tooltipMarkers: MapMarker[] = [
    { coordinates: [-74.006, 40.7128], label: 'New York', color: '#8b5cf6' },
    { coordinates: [2.3522, 48.8566], label: 'Paris', color: '#8b5cf6' },
    { coordinates: [139.6917, 35.6895], label: 'Tokyo', color: '#8b5cf6' }
  ];

  tooltipConfig = {
    backgroundColor: '#1D3557',
    textColor: '#fff',
    borderColor: '#457B9D',
    borderRadius: 6
  };

  // Advanced configuration examples
  readonly HEART_ICON = 'M12,21.35L10.55,20.03C5.4,15.36,2,12.27,2,8.5C2,5.41,4.42,3,7.5,3C9.24,3,10.91,3.81,12,5.08C13.09,3.81,14.76,3,16.5,3C19.58,3,22,5.41,22,8.5C22,12.27,18.6,15.36,13.45,20.03L12,21.35Z';
  readonly DIAMOND_ICON = 'M12,2L8.5,8.5L2,12L8.5,15.5L12,22L15.5,15.5L22,12L15.5,8.5L12,2Z';
  readonly BUILDING_ICON = 'M16 2H8C6.9 2 6 2.9 6 4V20C6 21.1 6.9 22 8 22H16C17.1 22 18 21.1 18 20V4C18 2.9 17.1 2 16 2M10 4H14V6H10V4M10 8H14V10H10V8M10 12H14V14H10V12M10 16H14V18H10V16Z';

  advancedMarkers: MapMarker[] = [
    { 
      coordinates: [-74.006, 40.7128], 
      label: 'NYC Financial District', 
      shape: 'custom', 
      customSvg: this.BUILDING_ICON,
      size: 14,
      color: '#1e40af',
      stroke: '#ffffff',
      data: { type: 'financial', importance: 'high' }
    },
    { 
      coordinates: [2.3522, 48.8566], 
      label: 'Paris Love Lock Bridge', 
      shape: 'custom', 
      customSvg: this.HEART_ICON,
      size: 12,
      color: '#dc2626',
      stroke: '#fecaca',
      data: { type: 'romantic', visitors: 15000000 }
    },
    { 
      coordinates: [139.6917, 35.6895], 
      label: 'Tokyo Tech Hub', 
      shape: 'custom', 
      customSvg: this.DIAMOND_ICON,
      size: 10,
      color: '#7c3aed',
      stroke: '#e9d5ff',
      data: { type: 'technology', startups: 2500 }
    },
    {
      coordinates: [-118.2437, 34.0522],
      label: 'LA Airport Hub',
      shape: 'custom',
      customSvg: this.AIRPLANE_ICON,
      customSvgSize: 24,
      size: 16,
      color: '#ea580c',
      stroke: '#fed7aa',
      data: { type: 'transport', dailyFlights: 1500 }
    }
  ];

  networkMarkers: MapMarker[] = [
    { coordinates: [-74.006, 40.7128], label: 'Server NYC', color: '#10b981', size: 8 },
    { coordinates: [2.3522, 48.8566], label: 'Server Paris', color: '#10b981', size: 8 },
    { coordinates: [139.6917, 35.6895], label: 'Server Tokyo', color: '#10b981', size: 8 },
    { coordinates: [-122.4194, 37.7749], label: 'Server SF', color: '#10b981', size: 8 },
    { coordinates: [103.8198, 1.3521], label: 'Server Singapore', color: '#10b981', size: 8 }
  ];

  networkLines: MapLine[] = [
    // High speed connections (thick, solid)
    { from: [-74.006, 40.7128], to: [-122.4194, 37.7749], color: '#059669', strokeWidth: 4, curve: 0.2 },
    { from: [2.3522, 48.8566], to: [139.6917, 35.6895], color: '#059669', strokeWidth: 4, curve: 0.3 },
    
    // Medium speed connections (medium, dashed)
    { from: [-74.006, 40.7128], to: [2.3522, 48.8566], color: '#fbbf24', strokeWidth: 3, curve: 0.3, dashed: true },
    { from: [139.6917, 35.6895], to: [103.8198, 1.3521], color: '#fbbf24', strokeWidth: 3, curve: 0.2, dashed: true },
    
    // Backup connections (thin, light)
    { from: [-122.4194, 37.7749], to: [103.8198, 1.3521], color: '#94a3b8', strokeWidth: 1, curve: 0.5 },
    { from: [-74.006, 40.7128], to: [103.8198, 1.3521], color: '#94a3b8', strokeWidth: 1, curve: 0.6, dashed: true }
  ];

  // Advanced choropleth examples
  gdpData: ChoroplethData = {
    'United States of America': 21.43,
    'China': 14.34,
    'Japan': 5.08,
    'Germany': 3.85,
    'India': 2.87,
    'United Kingdom': 2.83,
    'France': 2.71,
    'Brazil': 1.87,
    'Canada': 1.74,
    'Russia': 1.48,
    'Spain': 1.39,
    'Australia': 1.33,
    'Mexico': 1.29,
    'Indonesia': 1.12,
    'Netherlands': 0.91
  };

  customChoroplethConfig = {
    matchKey: 'name',
    colors: ['#fef3e2', '#fbbf24', '#f59e0b', '#d97706', '#b45309'],
    minValue: 0.5,
    maxValue: 22,
    nullColor: '#f8fafc'
  };

  temperatureData: ChoroplethData = {
    'Canada': -5.35,
    'Russia': -5.1,
    'Mongolia': -0.7,
    'Finland': 1.7,
    'Norway': 1.5,
    'Sweden': 2.1,
    'Iceland': 1.75,
    'United States of America': 8.5,
    'China': 8.1,
    'Australia': 21.9,
    'Brazil': 25.4,
    'India': 25.0,
    'Saudi Arabia': 25.4,
    'Niger': 28.2,
    'Chad': 27.4,
    'Sudan': 27.9
  };

  temperatureChoroplethConfig = {
    matchKey: 'name',
    colors: ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#fbbf24', '#f59e0b', '#dc2626'],
    minValue: -10,
    maxValue: 30,
    nullColor: '#e5e7eb'
  };

  advancedChoroplethCode = `// Advanced choropleth with custom color scales and value ranges
gdpData: ChoroplethData = {
  'United States of America': 21.43,  // Trillion USD
  'China': 14.34,
  'Japan': 5.08,
  'Germany': 3.85,
  'India': 2.87,
  'United Kingdom': 2.83,
  'France': 2.71,
  'Brazil': 1.87,
  'Canada': 1.74,
  'Russia': 1.48
};

// Custom configuration with explicit value ranges
customChoroplethConfig: ChoroplethConfig = {
  matchKey: 'name',                    // Property to match (default: 'name')
  colors: [                            // Color scale from low to high
    '#fef3e2',                        // Lightest (lowest values)
    '#fbbf24', 
    '#f59e0b', 
    '#d97706', 
    '#b45309'                         // Darkest (highest values)
  ],
  minValue: 0.5,                      // Force minimum value
  maxValue: 22,                       // Force maximum value
  nullColor: '#f8fafc'                // Color for missing data
};

// Temperature data with negative values
temperatureData: ChoroplethData = {
  'Canada': -5.35,      // Cold
  'Russia': -5.1,
  'Finland': 1.7,
  'United States of America': 8.5,
  'China': 8.1,
  'Australia': 21.9,
  'Brazil': 25.4,      // Hot
  'India': 25.0,
  'Saudi Arabia': 25.4,
  'Niger': 28.2
};

// Blue-to-red temperature scale  
temperatureConfig: ChoroplethConfig = {
  matchKey: 'name',
  colors: [
    '#1e40af',   // Cold (blue)
    '#3b82f6', 
    '#60a5fa', 
    '#93c5fd',
    '#fbbf24',   // Neutral (yellow)
    '#f59e0b', 
    '#dc2626'    // Hot (red)
  ],
  minValue: -10,
  maxValue: 30,
  nullColor: '#e5e7eb'
};

// Usage with ISO country codes instead of names
gdpByIso: ChoroplethData = {
  'USA': 21.43,
  'CHN': 14.34,
  'JPN': 5.08,
  'DEU': 3.85
};

isoConfig: ChoroplethConfig = {
  matchKey: 'iso_a3',    // Match against ISO 3-letter codes
  colors: ['#f0f9ff', '#0369a1'],
  nullColor: '#f9fafb'
}`;

  advancedTooltipCode = `// Custom tooltip configuration with advanced styling
customTooltipConfig: TooltipConfig = {
  backgroundColor: '#1D3557',          // Dark blue background
  textColor: '#fff',                   // White text
  titleColor: '#F1C40F',              // Yellow title
  borderColor: '#457B9D',             // Blue border
  borderRadius: 8                      // Rounded corners
};

// Multiple tooltip styles for different data types
financialTooltipConfig: TooltipConfig = {
  backgroundColor: '#2d3748',
  textColor: '#e2e8f0',
  titleColor: '#48bb78',
  borderColor: '#4a5568',
  borderRadius: 6
};

temperatureTooltipConfig: TooltipConfig = {
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  textColor: '#fff',
  titleColor: '#fbbf24',
  borderColor: 'transparent',
  borderRadius: 12
};

// Usage in template
<asm-map
  [geography]="worldData"
  [markers]="markers"
  [showTooltip]="true"
  [tooltipConfig]="customTooltipConfig">
</asm-map>`;

  // API Reference data
  mapInputs = [
    { name: 'geography', type: 'string | object', description: 'TopoJSON/GeoJSON data URL or object', default: 'required' },
    { name: 'width', type: 'number', description: 'Map width in pixels', default: '800' },
    { name: 'height', type: 'number', description: 'Map height in pixels', default: '400' },
    { name: 'maxWidth', type: 'number', description: 'Maximum width constraint', default: 'null' },
    { name: 'projection', type: 'string', description: 'D3 projection type', default: 'geoEqualEarth' },
    { name: 'projectionConfig', type: 'ProjectionConfig', description: 'Projection configuration options', default: '{}' },
    { name: 'continents', type: 'string | string[]', description: 'Filter by continent(s)', default: 'null' },
    { name: 'fill', type: 'string', description: 'Geography fill color', default: '#ECECEC' },
    { name: 'stroke', type: 'string', description: 'Geography stroke color', default: '#D6D6D6' },
    { name: 'strokeWidth', type: 'number', description: 'Geography stroke width', default: '0.5' },
    { name: 'hoverFill', type: 'string', description: 'Fill color on hover', default: 'null' },
    { name: 'markers', type: 'MapMarker[]', description: 'Array of markers', default: '[]' },
    { name: 'annotations', type: 'MapAnnotation[]', description: 'Array of annotations', default: '[]' },
    { name: 'markerColor', type: 'string', description: 'Default marker color', default: '#FF5533' },
    { name: 'markerSize', type: 'number', description: 'Default marker size', default: '6' },
    { name: 'lines', type: 'MapLine[]', description: 'Array of lines/connections', default: '[]' },
    { name: 'lineColor', type: 'string', description: 'Default line color', default: '#FF5533' },
    { name: 'lineStrokeWidth', type: 'number', description: 'Default line stroke width', default: '2' },
    { name: 'choroplethData', type: 'ChoroplethData', description: 'Data for coloring geographies', default: 'null' },
    { name: 'choroplethConfig', type: 'ChoroplethConfig', description: 'Choropleth styling config', default: 'null' },
    { name: 'showGraticule', type: 'boolean', description: 'Show grid lines', default: 'false' },
    { name: 'graticuleConfig', type: 'GraticuleConfig', description: 'Graticule styling config', default: 'null' },
    { name: 'zoomable', type: 'boolean', description: 'Enable zoom and pan', default: 'false' },
    { name: 'showZoomControls', type: 'boolean', description: 'Show zoom buttons', default: 'true' },
    { name: 'minZoom', type: 'number', description: 'Minimum zoom level', default: '1' },
    { name: 'maxZoom', type: 'number', description: 'Maximum zoom level', default: '8' },
    { name: 'zoomOnClick', type: 'boolean', description: 'Zoom to country on click', default: 'false' },
    { name: 'zoomOnClickLevel', type: 'number', description: 'Zoom level when clicking country', default: '4' },
    { name: 'zoomAnimationDuration', type: 'number', description: 'Animation duration in milliseconds', default: '800' },
    { name: 'showTooltip', type: 'boolean', description: 'Show tooltip on hover', default: 'false' },
    { name: 'tooltipConfig', type: 'TooltipConfig', description: 'Tooltip styling', default: 'null' },
    { name: 'showLabels', type: 'boolean', description: 'Show country labels', default: 'false' },
    { name: 'labelMinZoom', type: 'number', description: 'Minimum zoom level to show labels', default: '1' },
    { name: 'labelFontSize', type: 'number', description: 'Label font size', default: '12' },
    { name: 'labelColor', type: 'string', description: 'Label text color', default: '#333' },
    { name: 'labelFontWeight', type: 'string | number', description: 'Label font weight', default: 'normal' }
  ];

  mapOutputs = [
    { name: 'countryClick', type: 'MapGeographyEvent', description: 'Emitted when a country is clicked' },
    { name: 'countryHover', type: 'MapGeographyEvent', description: 'Emitted when hovering over a country' },
    { name: 'countryLeave', type: 'void', description: 'Emitted when mouse leaves a country' },
    { name: 'markerClick', type: 'MapMarkerEvent', description: 'Emitted when a marker is clicked' },
    { name: 'lineClick', type: 'MapLineEvent', description: 'Emitted when a line is clicked' }
  ];

  markerInterface = [
    { name: 'coordinates', type: '[number, number]', description: 'Longitude and latitude coordinates', default: 'required' },
    { name: 'label', type: 'string', description: 'Optional marker label for tooltips' },
    { name: 'color', type: 'string', description: 'Marker fill color' },
    { name: 'stroke', type: 'string', description: 'Marker stroke color' },
    { name: 'size', type: 'number', description: 'Marker size/radius' },
    { name: 'shape', type: 'string', description: 'Marker shape: circle, diamond, pin, star, custom', default: 'circle' },
    { name: 'customSvg', type: 'string', description: 'SVG path data for custom shapes' },
    { name: 'customSvgSize', type: 'number', description: 'ViewBox size for custom SVG', default: '24' },
    { name: 'data', type: 'Record<string, unknown>', description: 'Custom data attached to marker' }
  ];

  annotationInterface = [
    { name: 'coordinates', type: '[number, number]', description: 'Longitude and latitude coordinates', default: 'required' },
    { name: 'text', type: 'string', description: 'Label text to display', default: 'required' },
    { name: 'dx', type: 'number', description: 'Horizontal offset from coordinates', default: '30' },
    { name: 'dy', type: 'number', description: 'Vertical offset from coordinates', default: '-30' },
    { name: 'curve', type: 'number', description: 'Connector curve (0-1)', default: '0' },
    { name: 'color', type: 'string', description: 'Text and connector color' },
    { name: 'fontSize', type: 'number', description: 'Font size for text' },
    { name: 'fontWeight', type: 'string | number', description: 'Font weight for text' }
  ];

  lineInterface = [
    { name: 'from', type: '[number, number]', description: 'Starting coordinates [longitude, latitude]', default: 'required' },
    { name: 'to', type: '[number, number]', description: 'Ending coordinates [longitude, latitude]', default: 'required' },
    { name: 'color', type: 'string', description: 'Line color' },
    { name: 'strokeWidth', type: 'number', description: 'Line thickness' },
    { name: 'curve', type: 'number', description: 'Arc height (0 = straight, higher = more curved)' },
    { name: 'dashed', type: 'boolean', description: 'Dashed line style', default: 'false' },
    { name: 'data', type: 'Record<string, unknown>', description: 'Custom data attached to line' }
  ];

  onMarkerClick(event: MapMarkerEvent): void {
    console.log('Clicked marker:', event.marker.label);
  }
}