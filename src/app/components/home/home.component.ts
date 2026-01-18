import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CodeExampleComponent } from '../code-example/code-example.component';
import {
  MapComponent,
  MapMarker,
  MapLine,
  ChoroplethData,
  MapMarkerEvent,
} from '../../../../projects/ng-simple-maps/src/public-api';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CodeExampleComponent, MapComponent],
  templateUrl: './home.component.html',
  styleUrls: ['../../app.css'],
})
export class HomeComponent {
  // World map data
  worldData = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

  // Installation command
  installCommand = 'npm install ng-simple-maps';

  // Example data for demos
  exampleMarkers: MapMarker[] = [
    { coordinates: [-74.006, 40.7128], label: 'New York' },
    { coordinates: [2.3522, 48.8566], label: 'Paris' },
    { coordinates: [139.6917, 35.6895], label: 'Tokyo' },
    { coordinates: [-0.1276, 51.5074], label: 'London' },
  ];

  connectionMarkers: MapMarker[] = [
    { coordinates: [-74.006, 40.7128], label: 'New York' },
    { coordinates: [2.3522, 48.8566], label: 'Paris' },
  ];

  connectionLines: MapLine[] = [
    { from: [-74.006, 40.7128], to: [2.3522, 48.8566], color: '#007bff', curve: 0.3 },
  ];

  // Choropleth data
  populationData: ChoroplethData = {
    China: 1439,
    India: 1380,
    'United States of America': 331,
    Indonesia: 273,
    Brazil: 212,
    Russia: 144,
    Japan: 126,
    Germany: 83,
  };

  // Configuration
  graticuleConfig = {
    step: [15, 15] as [number, number],
    color: '#90caf9',
    strokeWidth: 0.5,
    opacity: 0.6,
  };

  choroplethConfig = {
    matchKey: 'name',
    colors: ['#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3'],
    nullColor: '#f5f5f5',
  };

  // Code examples
  importCode = `import { MapComponent } from 'ng-simple-maps';

@Component({
  imports: [MapComponent],
  template: '...'
})
export class MyComponent {}`;

  basicUsageCode = `<asm-map
  [geography]="worldData"
  [width]="800"
  [height]="400">
</asm-map>`;

  // Showcase map data for hero section
  showcaseMarkers: MapMarker[] = [
    { coordinates: [-122.4194, 37.7749], label: 'San Francisco', color: '#06b6d4', size: 10, stroke: '#0891b2' },
    { coordinates: [-74.006, 40.7128], label: 'New York', color: '#10b981', size: 10, stroke: '#059669' },
    { coordinates: [2.3522, 48.8566], label: 'Paris', color: '#8b5cf6', size: 10, stroke: '#7c3aed' },
    { coordinates: [139.6917, 35.6895], label: 'Tokyo', color: '#f59e0b', size: 10, stroke: '#d97706' },
    { coordinates: [-0.1276, 51.5074], label: 'London', color: '#ef4444', size: 10, stroke: '#dc2626' },
    { coordinates: [12.4964, 41.9028], label: 'Rome', color: '#ec4899', size: 10, stroke: '#db2777' },
  ];

  showcaseLines: MapLine[] = [
    { from: [-122.4194, 37.7749], to: [-74.006, 40.7128], color: '#06b6d4', curve: 0.4, strokeWidth: 2 },
    { from: [-74.006, 40.7128], to: [2.3522, 48.8566], color: '#10b981', curve: 0.5, strokeWidth: 2 },
    { from: [2.3522, 48.8566], to: [139.6917, 35.6895], color: '#8b5cf6', curve: 0.6, strokeWidth: 2 },
    { from: [139.6917, 35.6895], to: [-0.1276, 51.5074], color: '#f59e0b', curve: 0.4, strokeWidth: 2 },
  ];

  onMarkerClick(event: MapMarkerEvent): void {
    console.log('Clicked marker:', event.marker.label);
  }
}
