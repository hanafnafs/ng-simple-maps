import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { feature, mesh } from 'topojson-client';
import { Feature, FeatureCollection } from 'geojson';
import {
  GeographyInput,
  ParsedGeography,
  TopoJSON,
  GeoJSON,
} from '../models';
import { addKeysToGeographies } from '../utils';

// Loads map data from URLs or objects and converts it to a format we can use
@Injectable({
  providedIn: 'root'
})
export class GeographyLoaderService {
  private readonly httpClient = inject(HttpClient);
  private readonly cache = new Map<string, Observable<ParsedGeography>>();

  // Load map data - either from a URL or data you already have
  load(geography: GeographyInput): Observable<ParsedGeography> {
    // If you passed in data directly, just process it
    if (typeof geography === 'object') {
      return of(this.parseGeography(geography));
    }

    // If it's a URL, see if we already downloaded it
    if (this.cache.has(geography)) {
      return this.cache.get(geography)!;
    }

    // Download from URL and remember it for next time
    const request$ = this.httpClient.get(geography).pipe(
      map((data) => this.parseGeography(data)),
      shareReplay(1)
    );

    this.cache.set(geography, request$);
    return request$;
  }

  // Figure out what kind of map data this is and convert it
  private parseGeography(data: any): ParsedGeography {
    // Check if it's TopoJSON format
    if (data.type === 'Topology' && data.objects) {
      return this.parseTopoJSON(data as TopoJSON);
    }

    // Check if it's GeoJSON format
    if (data.type === 'FeatureCollection' || data.type === 'Feature') {
      return this.parseGeoJSON(data as GeoJSON);
    }

    // If we can't tell, assume it's GeoJSON
    console.warn('Unknown geography format. Attempting to parse as GeoJSON.');
    return this.parseGeoJSON(data as GeoJSON);
  }

  // Convert TopoJSON data (compressed format) to something we can draw
  private parseTopoJSON(topology: TopoJSON): ParsedGeography {
    // TopoJSON can have multiple objects, just grab the first one
    const objectKeys = Object.keys(topology.objects);
    if (objectKeys.length === 0) {
      throw new Error('TopoJSON topology has no objects');
    }

    const firstObjectKey = objectKeys[0];
    const firstObject = topology.objects[firstObjectKey];

    // Turn the compressed data into individual country shapes
    const featureCollection = feature(topology, firstObject) as FeatureCollection;
    const features = addKeysToGeographies(featureCollection.features);

    // Create lines for borders between countries
    const borders = mesh(
      topology,
      firstObject,
      (a, b) => a !== b // Only draw borders between different countries
    );

    return {
      type: 'topojson',
      features,
      borders,
      outline: { type: 'Sphere' } as any,
    };
  }

  // Handle GeoJSON data (already in the right format, mostly)
  private parseGeoJSON(geojson: GeoJSON): ParsedGeography {
    let features: Feature[];

    if (geojson.type === 'FeatureCollection') {
      features = geojson.features;
    } else if (geojson.type === 'Feature') {
      features = [geojson];
    } else {
      // Treat whatever this is as a single map feature
      features = [geojson as Feature];
    }

    return {
      type: 'geojson',
      features: addKeysToGeographies(features),
    };
  }

  // Clear downloaded data from memory
  clearCache(): void {
    this.cache.clear();
  }
}
