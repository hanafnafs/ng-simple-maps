import { TestBed } from '@angular/core/testing';
import { ProjectionService } from './projection.service';

describe('ProjectionService', () => {
  let service: ProjectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create geoEqualEarth projection by default', () => {
    const projection = service.createProjection();
    expect(projection).toBeDefined();
  });

  it('should create projection with specified type', () => {
    const projection = service.createProjection('geoMercator');
    expect(projection).toBeDefined();
  });

  it('should apply projection config correctly', () => {
    const projection = service.createProjection('geoEqualEarth', {
      center: [0, 0],
      scale: 200
    });
    expect(projection.center()).toEqual([0, 0]);
    expect(projection.scale()).toBe(200);
  });

  it('should apply rotate configuration', () => {
    const projection = service.createProjection('geoEqualEarth', {
      rotate: [10, 20, 30]
    });
    expect(projection.rotate()).toEqual([10, 20, 30]);
  });

  it('should set default translate to viewport center', () => {
    const width = 800;
    const height = 400;
    const projection = service.createProjection('geoEqualEarth', {}, width, height);
    expect(projection.translate()).toEqual([width / 2, height / 2]);
  });
});
