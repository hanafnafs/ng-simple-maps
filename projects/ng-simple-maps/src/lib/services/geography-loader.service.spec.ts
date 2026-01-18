import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GeographyLoaderService } from './geography-loader.service';

describe('GeographyLoaderService', () => {
  let service: GeographyLoaderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(GeographyLoaderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.clearCache();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should parse GeoJSON FeatureCollection', (done) => {
    const geoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: { name: 'Test' }
        }
      ]
    };

    service.load(geoJson).subscribe((result) => {
      expect(result.type).toBe('geojson');
      expect(result.features.length).toBe(1);
      expect(result.features[0].rsmKey).toBe('Test');
      done();
    });
  });

  it('should parse GeoJSON Feature', (done) => {
    const geoJson = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: { name: 'Test' }
    };

    service.load(geoJson).subscribe((result) => {
      expect(result.type).toBe('geojson');
      expect(result.features.length).toBe(1);
      done();
    });
  });

  it('should load geography from URL', (done) => {
    const mockUrl = 'https://example.com/world.json';
    const mockData = {
      type: 'FeatureCollection',
      features: []
    };

    service.load(mockUrl).subscribe((result) => {
      expect(result.type).toBe('geojson');
      done();
    });

    const req = httpMock.expectOne(mockUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should cache loaded geographies', () => {
    const mockUrl = 'https://example.com/world.json';
    const mockData = {
      type: 'FeatureCollection',
      features: []
    };

    // First request
    service.load(mockUrl).subscribe();
    const req1 = httpMock.expectOne(mockUrl);
    req1.flush(mockData);

    // Second request should use cache (no HTTP request)
    service.load(mockUrl).subscribe();
    httpMock.expectNone(mockUrl);
  });
});
