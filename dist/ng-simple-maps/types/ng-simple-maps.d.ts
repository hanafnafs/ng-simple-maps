import * as _angular_core from '@angular/core';
import { Renderer2, AfterViewInit, OnDestroy, InjectionToken, Signal, TemplateRef } from '@angular/core';
import { GeoProjection, GeoPath } from 'd3-geo';
import { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { Topology, Objects } from 'topojson-specification';
import { Observable } from 'rxjs';

type ProjectionType = 'geoEqualEarth' | 'geoAlbers' | 'geoAlbersUsa' | 'geoAzimuthalEqualArea' | 'geoAzimuthalEquidistant' | 'geoConicConformal' | 'geoConicEqualArea' | 'geoConicEquidistant' | 'geoEquirectangular' | 'geoGnomonic' | 'geoMercator' | 'geoNaturalEarth1' | 'geoOrthographic' | 'geoStereographic' | 'geoTransverseMercator';
interface ProjectionConfig {
    rotate?: [number, number, number?];
    center?: [number, number];
    scale?: number;
    parallels?: [number, number];
    translate?: [number, number];
    precision?: number;
    clipAngle?: number;
}
type ProjectionFactory = () => GeoProjection;

interface GeographyObject extends Feature {
    rsmKey: string;
    geometry: Geometry;
    properties: GeoJsonProperties;
}
type TopoJSON = Topology<Objects>;
type GeoJSON = Feature | FeatureCollection;
type GeographyInput = string | TopoJSON | GeoJSON;
interface ParsedGeography {
    type: 'topojson' | 'geojson';
    features: GeographyObject[];
    borders?: Geometry;
    outline?: Geometry;
}
type ParseGeographiesFn = (geographies: GeographyObject[]) => GeographyObject[];

/**
 * SVG style properties for different interaction states
 */
interface StyleState {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    strokeLinecap?: 'butt' | 'round' | 'square';
    strokeLinejoin?: 'miter' | 'round' | 'bevel';
    strokeDasharray?: string;
    opacity?: number;
    fillOpacity?: number;
    strokeOpacity?: number;
}
/**
 * Style states for interactive elements (default, hover, pressed)
 */
interface StyleStates {
    default?: StyleState;
    hover?: StyleState;
    pressed?: StyleState;
}
/**
 * Connector properties for annotations
 */
interface ConnectorProps extends StyleState {
    /**
     * Connector line type
     */
    type?: 'straight' | 'curved';
}
/**
 * Coordinate tuple [longitude, latitude]
 */
type Coordinates = [number, number];
/**
 * Line coordinates configuration
 */
interface LineCoordinates {
    /**
     * Start coordinates [longitude, latitude]
     */
    from?: Coordinates;
    /**
     * End coordinates [longitude, latitude]
     */
    to?: Coordinates;
    /**
     * Array of coordinates for multi-segment lines
     */
    coordinates?: Coordinates[];
}
/**
 * Graticule step configuration
 */
type GraticuleStep = [number, number];

interface MoveEvent {
    coordinates: Coordinates;
    zoom: number;
    dragging?: boolean;
}
interface ZoomEvent {
    x: number;
    y: number;
    k: number;
}
interface GeographyEvent {
    event: MouseEvent | PointerEvent;
    geography: any;
}

type AnnotationCoordinates = [number, number];
interface ConnectorStyle {
    stroke?: string;
    strokeWidth?: number;
    strokeLinecap?: 'butt' | 'round' | 'square';
    strokeLinejoin?: 'miter' | 'round' | 'bevel';
    strokeDasharray?: string;
}
interface AnnotationSubject {
    radius?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}
interface AnnotationConfig {
    coordinates: AnnotationCoordinates;
    dx?: number;
    dy?: number;
    curve?: number;
    connectorStyle?: ConnectorStyle;
    subjectStyle?: AnnotationSubject;
}

type MarkerCoordinates = [number, number];
interface MarkerConfig {
    coordinates: MarkerCoordinates;
    radius?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
}

declare const projectionMap: Record<ProjectionType, ProjectionFactory>;
declare function getProjectionFactory(type: ProjectionType): ProjectionFactory;

declare function generateRsmKey(feature: Feature, index: number): string;
declare function projectCoordinates(coordinates: Coordinates, projection: GeoProjection): [number, number] | null;
declare function addKeysToGeographies(features: Feature[]): GeographyObject[];

type Continent = 'Africa' | 'Asia' | 'Europe' | 'North America' | 'South America' | 'Oceania' | 'Antarctica';
declare const COUNTRY_NAME_TO_CONTINENT: Record<string, Continent>;
declare const COUNTRY_TO_CONTINENT: Record<string, Continent>;
declare function getContinentForGeography(geography: GeographyObject): Continent | null;
declare function filterByContinents(geographies: GeographyObject[], continents: Continent | Continent[]): GeographyObject[];

type MarkerShape = 'circle' | 'diamond' | 'pin' | 'star' | 'custom';
interface MapMarker {
    coordinates: [number, number];
    label?: string;
    color?: string;
    stroke?: string;
    size?: number;
    shape?: MarkerShape;
    customSvg?: string;
    customSvgUrl?: string;
    customSvgSize?: number;
    data?: Record<string, unknown>;
}
interface MapAnnotation {
    coordinates: [number, number];
    text: string;
    dx?: number;
    dy?: number;
    curve?: number;
    color?: string;
    fontSize?: number;
    fontWeight?: string | number;
}
interface TooltipConfig {
    backgroundColor?: string;
    textColor?: string;
    titleColor?: string;
    borderColor?: string;
    borderRadius?: number;
}
interface MapGeographyEvent {
    properties: Record<string, unknown>;
    id?: string | number;
    event: MouseEvent;
}
interface MapMarkerEvent {
    marker: MapMarker;
    index: number;
    event: MouseEvent;
}
interface MapLine {
    from: [number, number];
    to: [number, number];
    color?: string;
    strokeWidth?: number;
    curve?: number;
    dashed?: boolean;
    data?: Record<string, unknown>;
}
interface MapLineEvent {
    line: MapLine;
    index: number;
    event: MouseEvent;
}
type ChoroplethData = Record<string, number>;
interface ChoroplethConfig {
    matchKey?: string;
    colors?: string[];
    minValue?: number;
    maxValue?: number;
    nullColor?: string;
}
interface GraticuleConfig {
    step?: [number, number];
    color?: string;
    strokeWidth?: number;
    opacity?: number;
}

declare class MarkerRendererUtil {
    static createMarkerShape(renderer: Renderer2, shape: MarkerShape, size: number, fill: string, stroke: string, customSvg?: string, customSvgSize?: number): SVGElement;
    private static createFromPathData;
    private static createFromSvgMarkup;
    static loadSvgMarker(renderer: Renderer2, url: string, markerGroup: SVGGElement, size: number, fill: string, stroke: string, customSvgSize?: number): void;
}

declare class PathHelperUtil {
    /**
     * Create curved path between two points for flight paths and connections
     */
    static createCurvedLinePath(projection: any, from: [number, number], to: [number, number], curve: number): string;
    /**
     * Calculate annotation path with optional curve
     */
    static createAnnotationPath(x: number, y: number, dx: number, dy: number, curve: number): string;
}

declare class MapComponent implements AfterViewInit, OnDestroy {
    private readonly projectionService;
    private readonly geographyLoader;
    private readonly renderer;
    private svgElement;
    private zoomGroupElement;
    geography: _angular_core.InputSignal<GeographyInput>;
    width: _angular_core.InputSignal<number>;
    height: _angular_core.InputSignal<number>;
    maxWidth: _angular_core.InputSignal<number | null>;
    projection: _angular_core.InputSignal<ProjectionType>;
    projectionConfig: _angular_core.InputSignal<ProjectionConfig>;
    continents: _angular_core.InputSignal<Continent | Continent[] | null>;
    fill: _angular_core.InputSignal<string>;
    stroke: _angular_core.InputSignal<string>;
    strokeWidth: _angular_core.InputSignal<number>;
    hoverFill: _angular_core.InputSignal<string | null>;
    markers: _angular_core.InputSignal<MapMarker[]>;
    annotations: _angular_core.InputSignal<MapAnnotation[]>;
    markerColor: _angular_core.InputSignal<string>;
    markerSize: _angular_core.InputSignal<number>;
    lines: _angular_core.InputSignal<MapLine[]>;
    lineColor: _angular_core.InputSignal<string>;
    lineStrokeWidth: _angular_core.InputSignal<number>;
    choroplethData: _angular_core.InputSignal<ChoroplethData | null>;
    choroplethConfig: _angular_core.InputSignal<ChoroplethConfig | null>;
    showGraticule: _angular_core.InputSignal<boolean>;
    graticuleConfig: _angular_core.InputSignal<GraticuleConfig | null>;
    zoomable: _angular_core.InputSignal<boolean>;
    showZoomControls: _angular_core.InputSignal<boolean>;
    minZoom: _angular_core.InputSignal<number>;
    maxZoom: _angular_core.InputSignal<number>;
    zoomOnClick: _angular_core.InputSignal<boolean>;
    zoomOnClickLevel: _angular_core.InputSignal<number>;
    zoomAnimationDuration: _angular_core.InputSignal<number>;
    showTooltip: _angular_core.InputSignal<boolean>;
    tooltipConfig: _angular_core.InputSignal<TooltipConfig | null>;
    showLabels: _angular_core.InputSignal<boolean>;
    labelMinZoom: _angular_core.InputSignal<number>;
    labelFontSize: _angular_core.InputSignal<number>;
    labelColor: _angular_core.InputSignal<string>;
    labelFontWeight: _angular_core.InputSignal<string | number>;
    countryClick: _angular_core.OutputEmitterRef<MapGeographyEvent>;
    countryHover: _angular_core.OutputEmitterRef<MapGeographyEvent>;
    countryLeave: _angular_core.OutputEmitterRef<void>;
    markerClick: _angular_core.OutputEmitterRef<MapMarkerEvent>;
    lineClick: _angular_core.OutputEmitterRef<MapLineEvent>;
    private readonly _scale;
    private readonly _translateX;
    private readonly _translateY;
    protected readonly tooltipVisible: _angular_core.WritableSignal<boolean>;
    protected readonly tooltipX: _angular_core.WritableSignal<number>;
    protected readonly tooltipY: _angular_core.WritableSignal<number>;
    protected readonly tooltipContent: _angular_core.WritableSignal<string>;
    private isDragging;
    private dragStartX;
    private dragStartY;
    private lastTranslateX;
    private lastTranslateY;
    private wheelHandler?;
    private mouseDownHandler?;
    private mouseMoveHandler?;
    private mouseUpHandler?;
    protected readonly viewBox: _angular_core.Signal<string>;
    private readonly proj;
    private readonly pathGenerator;
    private readonly geographies;
    constructor();
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    zoomIn(): void;
    zoomOut(): void;
    resetZoom(): void;
    zoomToFeature(geo: GeographyObject): void;
    private animateToZoom;
    protected onMouseMove(event: MouseEvent): void;
    private render;
    private clearSvgContent;
    private renderGraticule;
    private renderGeographies;
    private addGeographyEventHandlers;
    private renderLines;
    private renderLineEndpoints;
    private renderMarkers;
    private renderAnnotations;
    private renderLabels;
    private updateTransform;
    private setupZoomHandlers;
    private cleanupZoomHandlers;
    /**
     * Get fill color for a geography based on choropleth data
     */
    private getChoroplethColor;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<MapComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<MapComponent, "asm-map", never, { "geography": { "alias": "geography"; "required": true; "isSignal": true; }; "width": { "alias": "width"; "required": false; "isSignal": true; }; "height": { "alias": "height"; "required": false; "isSignal": true; }; "maxWidth": { "alias": "maxWidth"; "required": false; "isSignal": true; }; "projection": { "alias": "projection"; "required": false; "isSignal": true; }; "projectionConfig": { "alias": "projectionConfig"; "required": false; "isSignal": true; }; "continents": { "alias": "continents"; "required": false; "isSignal": true; }; "fill": { "alias": "fill"; "required": false; "isSignal": true; }; "stroke": { "alias": "stroke"; "required": false; "isSignal": true; }; "strokeWidth": { "alias": "strokeWidth"; "required": false; "isSignal": true; }; "hoverFill": { "alias": "hoverFill"; "required": false; "isSignal": true; }; "markers": { "alias": "markers"; "required": false; "isSignal": true; }; "annotations": { "alias": "annotations"; "required": false; "isSignal": true; }; "markerColor": { "alias": "markerColor"; "required": false; "isSignal": true; }; "markerSize": { "alias": "markerSize"; "required": false; "isSignal": true; }; "lines": { "alias": "lines"; "required": false; "isSignal": true; }; "lineColor": { "alias": "lineColor"; "required": false; "isSignal": true; }; "lineStrokeWidth": { "alias": "lineStrokeWidth"; "required": false; "isSignal": true; }; "choroplethData": { "alias": "choroplethData"; "required": false; "isSignal": true; }; "choroplethConfig": { "alias": "choroplethConfig"; "required": false; "isSignal": true; }; "showGraticule": { "alias": "showGraticule"; "required": false; "isSignal": true; }; "graticuleConfig": { "alias": "graticuleConfig"; "required": false; "isSignal": true; }; "zoomable": { "alias": "zoomable"; "required": false; "isSignal": true; }; "showZoomControls": { "alias": "showZoomControls"; "required": false; "isSignal": true; }; "minZoom": { "alias": "minZoom"; "required": false; "isSignal": true; }; "maxZoom": { "alias": "maxZoom"; "required": false; "isSignal": true; }; "zoomOnClick": { "alias": "zoomOnClick"; "required": false; "isSignal": true; }; "zoomOnClickLevel": { "alias": "zoomOnClickLevel"; "required": false; "isSignal": true; }; "zoomAnimationDuration": { "alias": "zoomAnimationDuration"; "required": false; "isSignal": true; }; "showTooltip": { "alias": "showTooltip"; "required": false; "isSignal": true; }; "tooltipConfig": { "alias": "tooltipConfig"; "required": false; "isSignal": true; }; "showLabels": { "alias": "showLabels"; "required": false; "isSignal": true; }; "labelMinZoom": { "alias": "labelMinZoom"; "required": false; "isSignal": true; }; "labelFontSize": { "alias": "labelFontSize"; "required": false; "isSignal": true; }; "labelColor": { "alias": "labelColor"; "required": false; "isSignal": true; }; "labelFontWeight": { "alias": "labelFontWeight"; "required": false; "isSignal": true; }; }, { "countryClick": "countryClick"; "countryHover": "countryHover"; "countryLeave": "countryLeave"; "markerClick": "markerClick"; "lineClick": "lineClick"; }, never, never, true, never>;
}

interface MapContext {
    projection: GeoProjection;
    path: GeoPath;
    width: number;
    height: number;
}
declare const MAP_CONTEXT: InjectionToken<Signal<MapContext>>;

/**
 * Root map container component - creates an SVG with D3 projection context
 *
 * This is the main container for all map visualizations. It sets up the SVG canvas
 * and provides projection context to child directives.
 *
 * The map is fully responsive by default and will scale to fit its container width
 * while maintaining aspect ratio. Use maxWidth to constrain the maximum size.
 *
 * @example
 * Basic world map (responsive):
 * ```html
 * <asm-composable-map [width]="800" [height]="400">
 *   <ng-container [asmGeographies]="worldDataUrl"></ng-container>
 * </asm-composable-map>
 * ```
 *
 * @example
 * Map with max width constraint:
 * ```html
 * <asm-composable-map
 *   [width]="960"
 *   [height]="600"
 *   [maxWidth]="960"
 *   projection="geoMercator">
 *   <!-- Map content -->
 * </asm-composable-map>
 * ```
 */
declare class ComposableMapComponent {
    private readonly projectionService;
    constructor();
    /**
     * Map width in pixels
     */
    width: _angular_core.InputSignal<number>;
    /**
     * Map height in pixels
     */
    height: _angular_core.InputSignal<number>;
    /**
     * Maximum width in pixels (optional, for constraining responsive size)
     */
    maxWidth: _angular_core.InputSignal<number | null>;
    /**
     * Projection type (default: geoEqualEarth)
     */
    projection: _angular_core.InputSignal<ProjectionType>;
    /**
     * Projection configuration options
     */
    projectionConfig: _angular_core.InputSignal<ProjectionConfig>;
    /**
     * Map context signal - recomputes when inputs change
     */
    readonly mapContext: _angular_core.Signal<MapContext>;
    /**
     * SVG viewBox attribute
     */
    protected readonly viewBox: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ComposableMapComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<ComposableMapComponent, "asm-composable-map", never, { "width": { "alias": "width"; "required": false; "isSignal": true; }; "height": { "alias": "height"; "required": false; "isSignal": true; }; "maxWidth": { "alias": "maxWidth"; "required": false; "isSignal": true; }; "projection": { "alias": "projection"; "required": false; "isSignal": true; }; "projectionConfig": { "alias": "projectionConfig"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

/**
 * Tooltip data structure for displaying geography information
 */
interface TooltipData {
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
declare class TooltipComponent {
    /**
     * Whether the tooltip is visible
     */
    visible: _angular_core.InputSignal<boolean>;
    /**
     * X position (in pixels from viewport left)
     */
    x: _angular_core.InputSignal<number>;
    /**
     * Y position (in pixels from viewport top)
     */
    y: _angular_core.InputSignal<number>;
    /**
     * Tooltip data to display
     */
    data: _angular_core.InputSignal<TooltipData | null>;
    /**
     * Offset from cursor (x direction)
     */
    offsetX: _angular_core.InputSignal<number>;
    /**
     * Offset from cursor (y direction)
     */
    offsetY: _angular_core.InputSignal<number>;
    /**
     * Keys to exclude from display
     */
    excludeKeys: _angular_core.InputSignal<string[]>;
    /**
     * Custom key labels mapping
     */
    keyLabels: _angular_core.InputSignal<Record<string, string>>;
    /**
     * Background color
     */
    backgroundColor: _angular_core.InputSignal<string>;
    /**
     * Text color
     */
    textColor: _angular_core.InputSignal<string>;
    /**
     * Title text color (defaults to textColor if not set)
     */
    titleColor: _angular_core.InputSignal<string | null>;
    /**
     * Label text color (defaults to textColor with opacity if not set)
     */
    labelColor: _angular_core.InputSignal<string | null>;
    /**
     * Border color
     */
    borderColor: _angular_core.InputSignal<string>;
    /**
     * Border radius in pixels
     */
    borderRadius: _angular_core.InputSignal<number>;
    /**
     * Font size in pixels
     */
    fontSize: _angular_core.InputSignal<number>;
    /**
     * Padding in pixels
     */
    padding: _angular_core.InputSignal<number>;
    /**
     * Box shadow
     */
    boxShadow: _angular_core.InputSignal<string>;
    /**
     * Computed tooltip container styles
     */
    protected readonly tooltipStyles: _angular_core.Signal<{
        left: string;
        top: string;
        backgroundColor: string;
        color: string;
        border: string;
        borderRadius: string;
        fontSize: string;
        padding: string;
        boxShadow: string;
    }>;
    /**
     * Computed title styles
     */
    protected readonly titleStyles: _angular_core.Signal<{
        color: string;
        borderBottomColor: string;
    }>;
    /**
     * Computed label styles
     */
    protected readonly labelStyles: _angular_core.Signal<{
        color: string | undefined;
    }>;
    /**
     * Computed display items from data
     */
    protected readonly displayItems: _angular_core.Signal<{
        key: string;
        label: string;
        value: string;
    }[]>;
    private formatKey;
    private formatValue;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TooltipComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TooltipComponent, "asm-tooltip", never, { "visible": { "alias": "visible"; "required": false; "isSignal": true; }; "x": { "alias": "x"; "required": false; "isSignal": true; }; "y": { "alias": "y"; "required": false; "isSignal": true; }; "data": { "alias": "data"; "required": false; "isSignal": true; }; "offsetX": { "alias": "offsetX"; "required": false; "isSignal": true; }; "offsetY": { "alias": "offsetY"; "required": false; "isSignal": true; }; "excludeKeys": { "alias": "excludeKeys"; "required": false; "isSignal": true; }; "keyLabels": { "alias": "keyLabels"; "required": false; "isSignal": true; }; "backgroundColor": { "alias": "backgroundColor"; "required": false; "isSignal": true; }; "textColor": { "alias": "textColor"; "required": false; "isSignal": true; }; "titleColor": { "alias": "titleColor"; "required": false; "isSignal": true; }; "labelColor": { "alias": "labelColor"; "required": false; "isSignal": true; }; "borderColor": { "alias": "borderColor"; "required": false; "isSignal": true; }; "borderRadius": { "alias": "borderRadius"; "required": false; "isSignal": true; }; "fontSize": { "alias": "fontSize"; "required": false; "isSignal": true; }; "padding": { "alias": "padding"; "required": false; "isSignal": true; }; "boxShadow": { "alias": "boxShadow"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * Zoom state interface
 */
interface ZoomState {
    /** Current zoom scale */
    scale: number;
    /** X translation */
    translateX: number;
    /** Y translation */
    translateY: number;
}
/**
 * Zoom event emitted on zoom/pan changes
 */
interface ZoomableEvent extends ZoomState {
    /** Original DOM event that triggered the zoom */
    sourceEvent?: Event;
}
/**
 * ZoomableGroupDirective - Adds zoom and pan capabilities to map content
 *
 * Apply to an svg:g element to enable zoom and pan functionality.
 * Supports mouse wheel zoom, drag panning, and touch gestures.
 *
 * @example
 * Basic usage:
 * ```html
 * <asm-composable-map [width]="800" [height]="400">
 *   <svg:g asmZoomableGroup #zoomGroup="asmZoomableGroup" [minZoom]="1" [maxZoom]="8">
 *     <ng-container [asmGeographies]="worldData"></ng-container>
 *   </svg:g>
 * </asm-composable-map>
 * ```
 *
 * @example
 * With zoom controls:
 * ```html
 * <svg:g asmZoomableGroup #zoomGroup="asmZoomableGroup" [minZoom]="1" [maxZoom]="8">
 *   <ng-container [asmGeographies]="worldData"></ng-container>
 * </svg:g>
 *
 * <asm-zoom-controls
 *   (zoomIn)="zoomGroup.zoomIn()"
 *   (zoomOut)="zoomGroup.zoomOut()"
 *   (reset)="zoomGroup.resetZoom()">
 * </asm-zoom-controls>
 * ```
 */
declare class ZoomableGroupDirective implements AfterViewInit, OnDestroy {
    private readonly elementRef;
    private readonly renderer;
    private readonly mapContext;
    private isDragging;
    private dragStartX;
    private dragStartY;
    private lastTranslateX;
    private lastTranslateY;
    private boundHandleWheel;
    private boundHandleMouseDown;
    private boundHandleMouseMove;
    private boundHandleMouseUp;
    private boundHandleTouchStart;
    private boundHandleTouchMove;
    private boundHandleTouchEnd;
    /**
     * Minimum zoom level
     */
    minZoom: _angular_core.InputSignal<number>;
    /**
     * Maximum zoom level
     */
    maxZoom: _angular_core.InputSignal<number>;
    /**
     * Initial zoom level
     */
    initialZoom: _angular_core.InputSignal<number>;
    /**
     * Initial center coordinates [x, y] in pixels (relative to map center)
     */
    center: _angular_core.InputSignal<[number, number]>;
    /**
     * Zoom sensitivity for mouse wheel (higher = faster zoom)
     */
    zoomSensitivity: _angular_core.InputSignal<number>;
    /**
     * Whether zoom on scroll is enabled
     */
    enableWheelZoom: _angular_core.InputSignal<boolean>;
    /**
     * Whether pan on drag is enabled
     */
    enablePan: _angular_core.InputSignal<boolean>;
    /**
     * Whether to enable touch gestures
     */
    enableTouch: _angular_core.InputSignal<boolean>;
    /**
     * Emits when zoom or pan changes
     */
    zoomChange: _angular_core.OutputEmitterRef<ZoomableEvent>;
    /**
     * Emits when zoom starts (mouse down or touch start)
     */
    zoomStart: _angular_core.OutputEmitterRef<ZoomableEvent>;
    /**
     * Emits when zoom ends (mouse up or touch end)
     */
    zoomEnd: _angular_core.OutputEmitterRef<ZoomableEvent>;
    private readonly _scale;
    private readonly _translateX;
    private readonly _translateY;
    /**
     * Current zoom scale (read-only)
     */
    readonly scale: _angular_core.Signal<number>;
    /**
     * Current X translation (read-only)
     */
    readonly translateX: _angular_core.Signal<number>;
    /**
     * Current Y translation (read-only)
     */
    readonly translateY: _angular_core.Signal<number>;
    /**
     * Computed SVG transform string
     */
    readonly transform: _angular_core.Signal<string>;
    constructor();
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    /**
     * Programmatically zoom in by a step
     */
    zoomIn(step?: number): void;
    /**
     * Programmatically zoom out by a step
     */
    zoomOut(step?: number): void;
    /**
     * Reset zoom to initial state
     */
    resetZoom(): void;
    /**
     * Set zoom to a specific level
     */
    setZoom(scale: number, translateX?: number, translateY?: number): void;
    private updateTransform;
    private getSvgElement;
    private handleWheel;
    private handleMouseDown;
    private handleMouseMove;
    private handleMouseUp;
    private lastTouchDistance;
    private lastTouchCenter;
    private handleTouchStart;
    private handleTouchMove;
    private handleTouchEnd;
    private getTouchDistance;
    private getTouchCenter;
    private emitZoomChange;
    private emitZoomStart;
    private emitZoomEnd;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ZoomableGroupDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<ZoomableGroupDirective, "[asmZoomableGroup]", ["asmZoomableGroup"], { "minZoom": { "alias": "minZoom"; "required": false; "isSignal": true; }; "maxZoom": { "alias": "maxZoom"; "required": false; "isSignal": true; }; "initialZoom": { "alias": "initialZoom"; "required": false; "isSignal": true; }; "center": { "alias": "center"; "required": false; "isSignal": true; }; "zoomSensitivity": { "alias": "zoomSensitivity"; "required": false; "isSignal": true; }; "enableWheelZoom": { "alias": "enableWheelZoom"; "required": false; "isSignal": true; }; "enablePan": { "alias": "enablePan"; "required": false; "isSignal": true; }; "enableTouch": { "alias": "enableTouch"; "required": false; "isSignal": true; }; }, { "zoomChange": "zoomChange"; "zoomStart": "zoomStart"; "zoomEnd": "zoomEnd"; }, never, never, true, never>;
}

/**
 * Zoom control action type
 */
type ZoomControlAction = 'zoomIn' | 'zoomOut' | 'reset';
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
declare class ZoomControlsComponent {
    /**
     * Position from top edge
     */
    top: _angular_core.InputSignal<string>;
    /**
     * Position from right edge
     */
    right: _angular_core.InputSignal<string>;
    /**
     * Position from bottom edge (overrides top if set)
     */
    bottom: _angular_core.InputSignal<string | null>;
    /**
     * Position from left edge (overrides right if set)
     */
    left: _angular_core.InputSignal<string | null>;
    /**
     * Button size in pixels
     */
    buttonSize: _angular_core.InputSignal<number>;
    /**
     * Button background color
     */
    backgroundColor: _angular_core.InputSignal<string>;
    /**
     * Button text/icon color
     */
    color: _angular_core.InputSignal<string>;
    /**
     * Button border radius
     */
    borderRadius: _angular_core.InputSignal<number>;
    /**
     * Box shadow
     */
    boxShadow: _angular_core.InputSignal<string>;
    /**
     * Whether to show the reset button
     */
    showReset: _angular_core.InputSignal<boolean>;
    /**
     * Emitted when zoom in is clicked
     */
    zoomIn: _angular_core.OutputEmitterRef<void>;
    /**
     * Emitted when zoom out is clicked
     */
    zoomOut: _angular_core.OutputEmitterRef<void>;
    /**
     * Emitted when reset is clicked
     */
    reset: _angular_core.OutputEmitterRef<void>;
    /**
     * Computed container styles
     */
    protected containerStyles: () => {
        position: "absolute";
        top: string;
        right: string;
        bottom: string;
        left: string;
        zIndex: string;
    };
    /**
     * Computed button styles
     */
    protected buttonStyles: () => {
        width: string;
        height: string;
        backgroundColor: string;
        color: string;
        borderRadius: string;
        boxShadow: string;
    };
    protected onZoomIn(): void;
    protected onZoomOut(): void;
    protected onReset(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ZoomControlsComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<ZoomControlsComponent, "asm-zoom-controls", never, { "top": { "alias": "top"; "required": false; "isSignal": true; }; "right": { "alias": "right"; "required": false; "isSignal": true; }; "bottom": { "alias": "bottom"; "required": false; "isSignal": true; }; "left": { "alias": "left"; "required": false; "isSignal": true; }; "buttonSize": { "alias": "buttonSize"; "required": false; "isSignal": true; }; "backgroundColor": { "alias": "backgroundColor"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; "borderRadius": { "alias": "borderRadius"; "required": false; "isSignal": true; }; "boxShadow": { "alias": "boxShadow"; "required": false; "isSignal": true; }; "showReset": { "alias": "showReset"; "required": false; "isSignal": true; }; }, { "zoomIn": "zoomIn"; "zoomOut": "zoomOut"; "reset": "reset"; }, never, never, true, never>;
}

/**
 * Directive for loading and rendering geographic features (countries, regions, etc.)
 *
 * Loads TopoJSON or GeoJSON data and renders it as SVG paths.
 * Must be used on ng-container inside an SVG element.
 *
 * @example
 * Basic usage with TopoJSON URL:
 * ```html
 * <asm-composable-map>
 *   <ng-container
 *     [asmGeographies]="'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'"
 *     fill="#ECECEC"
 *     stroke="#D6D6D6">
 *   </ng-container>
 * </asm-composable-map>
 * ```
 *
 * @example
 * Filter by continent:
 * ```html
 * <ng-container
 *   [asmGeographies]="worldDataUrl"
 *   [continents]="'Europe'">
 * </ng-container>
 * ```
 *
 * @example
 * Multiple continents:
 * ```html
 * <ng-container
 *   [asmGeographies]="worldDataUrl"
 *   [continents]="['Asia', 'Europe']">
 * </ng-container>
 * ```
 */
declare class GeographiesDirective {
    private readonly geographyLoader;
    private readonly mapContext;
    private readonly elementRef;
    private readonly renderer;
    /**
     * Geography data (URL string, TopoJSON, or GeoJSON)
     */
    geography: _angular_core.InputSignal<GeographyInput>;
    /**
     * Optional custom parsing function
     */
    parseGeographies: _angular_core.InputSignal<ParseGeographiesFn | undefined>;
    /**
     * Filter by continent(s) - can be a single continent or array of continents
     * Supported: 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Antarctica'
     */
    continents: _angular_core.InputSignal<Continent | Continent[] | null>;
    /**
     * Default fill color for all geographies
     */
    fill: _angular_core.InputSignal<string>;
    /**
     * Default stroke color for all geographies
     */
    stroke: _angular_core.InputSignal<string>;
    /**
     * Default stroke width for all geographies
     */
    strokeWidth: _angular_core.InputSignal<number>;
    /**
     * Hover fill color (optional)
     */
    hoverFill: _angular_core.InputSignal<string | null>;
    /**
     * Pressed/active fill color (optional)
     */
    pressedFill: _angular_core.InputSignal<string | null>;
    /**
     * Emitted when mouse enters a geography
     */
    geographyHover: _angular_core.OutputEmitterRef<GeographyEvent>;
    /**
     * Emitted when mouse leaves a geography
     */
    geographyLeave: _angular_core.OutputEmitterRef<GeographyEvent>;
    /**
     * Emitted when a geography is clicked
     */
    geographyClick: _angular_core.OutputEmitterRef<GeographyEvent>;
    /**
     * Raw loaded geographies (before filtering)
     */
    private readonly rawGeographies;
    /**
     * Loaded and processed geographies signal (reactive to continents changes)
     */
    protected readonly geographies: _angular_core.Signal<GeographyObject[]>;
    constructor();
    private renderGeographies;
    private processGeographies;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<GeographiesDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<GeographiesDirective, "[asmGeographies]", never, { "geography": { "alias": "asmGeographies"; "required": true; "isSignal": true; }; "parseGeographies": { "alias": "parseGeographies"; "required": false; "isSignal": true; }; "continents": { "alias": "continents"; "required": false; "isSignal": true; }; "fill": { "alias": "fill"; "required": false; "isSignal": true; }; "stroke": { "alias": "stroke"; "required": false; "isSignal": true; }; "strokeWidth": { "alias": "strokeWidth"; "required": false; "isSignal": true; }; "hoverFill": { "alias": "hoverFill"; "required": false; "isSignal": true; }; "pressedFill": { "alias": "pressedFill"; "required": false; "isSignal": true; }; }, { "geographyHover": "geographyHover"; "geographyLeave": "geographyLeave"; "geographyClick": "geographyClick"; }, never, never, true, never>;
}

/**
 * Directive for adding annotations (labels with connector lines) to map locations
 *
 * Renders a point marker, connector line, and text label at geographic coordinates.
 * Must be used on ng-container inside an SVG element.
 *
 * @example
 * Basic annotation:
 * ```html
 * <asm-composable-map>
 *   <ng-container
 *     [asmAnnotation]="[-74.006, 40.7128]"
 *     text="New York">
 *   </ng-container>
 * </asm-composable-map>
 * ```
 *
 * @example
 * Customized annotation with curved connector:
 * ```html
 * <ng-container
 *   [asmAnnotation]="[139.6917, 35.6895]"
 *   text="Tokyo"
 *   [dx]="50"
 *   [dy]="-40"
 *   [curve]="0.5"
 *   [fontSize]="16"
 *   connectorStroke="#FF5533"
 *   subjectFill="#FF5533">
 * </ng-container>
 * ```
 */
declare class AnnotationDirective {
    private readonly mapContext;
    private readonly elementRef;
    private readonly renderer;
    private annotationGroup;
    /**
     * Geographic coordinates [longitude, latitude]
     */
    coordinates: _angular_core.InputSignal<AnnotationCoordinates>;
    /**
     * Annotation text
     */
    text: _angular_core.InputSignal<string>;
    /**
     * Horizontal offset from coordinate (pixels)
     */
    dx: _angular_core.InputSignal<number>;
    /**
     * Vertical offset from coordinate (pixels)
     */
    dy: _angular_core.InputSignal<number>;
    /**
     * Connector curve amount (0 = straight, 1 = curved)
     */
    curve: _angular_core.InputSignal<number>;
    /**
     * Subject (point) radius
     */
    subjectRadius: _angular_core.InputSignal<number>;
    /**
     * Subject fill color
     */
    subjectFill: _angular_core.InputSignal<string>;
    /**
     * Subject stroke color
     */
    subjectStroke: _angular_core.InputSignal<string>;
    /**
     * Subject stroke width
     */
    subjectStrokeWidth: _angular_core.InputSignal<number>;
    /**
     * Connector stroke color
     */
    connectorStroke: _angular_core.InputSignal<string>;
    /**
     * Connector stroke width
     */
    connectorStrokeWidth: _angular_core.InputSignal<number>;
    /**
     * Text fill color
     */
    textFill: _angular_core.InputSignal<string>;
    /**
     * Text font size
     */
    fontSize: _angular_core.InputSignal<number>;
    /**
     * Text font weight
     */
    fontWeight: _angular_core.InputSignal<string | number>;
    /**
     * Text anchor (alignment)
     */
    textAnchor: _angular_core.InputSignal<"start" | "end" | "middle">;
    constructor();
    private renderAnnotation;
    private createCurvedPath;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<AnnotationDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<AnnotationDirective, "[asmAnnotation]", never, { "coordinates": { "alias": "asmAnnotation"; "required": true; "isSignal": true; }; "text": { "alias": "text"; "required": false; "isSignal": true; }; "dx": { "alias": "dx"; "required": false; "isSignal": true; }; "dy": { "alias": "dy"; "required": false; "isSignal": true; }; "curve": { "alias": "curve"; "required": false; "isSignal": true; }; "subjectRadius": { "alias": "subjectRadius"; "required": false; "isSignal": true; }; "subjectFill": { "alias": "subjectFill"; "required": false; "isSignal": true; }; "subjectStroke": { "alias": "subjectStroke"; "required": false; "isSignal": true; }; "subjectStrokeWidth": { "alias": "subjectStrokeWidth"; "required": false; "isSignal": true; }; "connectorStroke": { "alias": "connectorStroke"; "required": false; "isSignal": true; }; "connectorStrokeWidth": { "alias": "connectorStrokeWidth"; "required": false; "isSignal": true; }; "textFill": { "alias": "textFill"; "required": false; "isSignal": true; }; "fontSize": { "alias": "fontSize"; "required": false; "isSignal": true; }; "fontWeight": { "alias": "fontWeight"; "required": false; "isSignal": true; }; "textAnchor": { "alias": "textAnchor"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class MarkerDirective {
    private readonly mapContext;
    private readonly elementRef;
    private readonly renderer;
    private readonly viewContainerRef;
    private markerGroup;
    private embeddedView;
    coordinates: _angular_core.InputSignal<MarkerCoordinates>;
    radius: _angular_core.InputSignal<number>;
    fill: _angular_core.InputSignal<string>;
    stroke: _angular_core.InputSignal<string>;
    strokeWidth: _angular_core.InputSignal<number>;
    opacity: _angular_core.InputSignal<number>;
    customTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    constructor();
    private renderMarker;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<MarkerDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<MarkerDirective, "[asmMarker]", never, { "coordinates": { "alias": "asmMarker"; "required": true; "isSignal": true; }; "radius": { "alias": "radius"; "required": false; "isSignal": true; }; "fill": { "alias": "fill"; "required": false; "isSignal": true; }; "stroke": { "alias": "stroke"; "required": false; "isSignal": true; }; "strokeWidth": { "alias": "strokeWidth"; "required": false; "isSignal": true; }; "opacity": { "alias": "opacity"; "required": false; "isSignal": true; }; }, {}, ["customTemplate"], never, true, never>;
}

declare class ProjectionService {
    createProjection(type?: ProjectionType, config?: ProjectionConfig, width?: number, height?: number): GeoProjection;
    private applyProjectionConfig;
    private autoFitProjection;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ProjectionService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<ProjectionService>;
}

declare class GeographyLoaderService {
    private readonly httpClient;
    private readonly cache;
    load(geography: GeographyInput): Observable<ParsedGeography>;
    private parseGeography;
    private parseTopoJSON;
    private parseGeoJSON;
    clearCache(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<GeographyLoaderService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<GeographyLoaderService>;
}

export { AnnotationDirective, COUNTRY_NAME_TO_CONTINENT, COUNTRY_TO_CONTINENT, ComposableMapComponent, GeographiesDirective, GeographyLoaderService, MAP_CONTEXT, MapComponent, MarkerDirective, MarkerRendererUtil, PathHelperUtil, ProjectionService, TooltipComponent, ZoomControlsComponent, ZoomableGroupDirective as ZoomableGroupComponent, ZoomableGroupDirective, addKeysToGeographies, filterByContinents, generateRsmKey, getContinentForGeography, getProjectionFactory, projectCoordinates, projectionMap };
export type { AnnotationConfig, AnnotationCoordinates, AnnotationSubject, ChoroplethConfig, ChoroplethData, ConnectorProps, ConnectorStyle, Continent, Coordinates, GeoJSON, GeographyEvent, GeographyInput, GeographyObject, GraticuleConfig, GraticuleStep, LineCoordinates, MapAnnotation, MapContext, MapGeographyEvent, MapLine, MapLineEvent, MapMarker, MapMarkerEvent, MarkerConfig, MarkerCoordinates, MarkerShape, MoveEvent, ParseGeographiesFn, ParsedGeography, ProjectionConfig, ProjectionFactory, ProjectionType, StyleState, StyleStates, TooltipConfig, TooltipData, TopoJSON, ZoomControlAction, ZoomEvent, ZoomState, ZoomableEvent };
