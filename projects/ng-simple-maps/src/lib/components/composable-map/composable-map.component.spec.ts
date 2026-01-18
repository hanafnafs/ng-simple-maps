import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComposableMapComponent } from './composable-map.component';

describe('ComposableMapComponent', () => {
  let component: ComposableMapComponent;
  let fixture: ComponentFixture<ComposableMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComposableMapComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ComposableMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default width of 800', () => {
    expect(component.width()).toBe(800);
  });

  it('should have default height of 400', () => {
    expect(component.height()).toBe(400);
  });

  it('should have default projection of geoEqualEarth', () => {
    expect(component.projection()).toBe('geoEqualEarth');
  });

  it('should create SVG element', () => {
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should set viewBox correctly', () => {
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('viewBox')).toBe('0 0 800 400');
  });

  it('should provide map context', () => {
    const context = component.mapContext();
    expect(context).toBeDefined();
    expect(context.projection).toBeDefined();
    expect(context.path).toBeDefined();
    expect(context.width).toBe(800);
    expect(context.height).toBe(400);
  });

  it('should update context when inputs change', () => {
    fixture.componentRef.setInput('width', 1000);
    fixture.componentRef.setInput('height', 500);
    fixture.detectChanges();

    const context = component.mapContext();
    expect(context.width).toBe(1000);
    expect(context.height).toBe(500);
  });
});
