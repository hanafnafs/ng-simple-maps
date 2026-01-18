import * as i0 from '@angular/core';
import { Injectable, inject, Renderer2, input, output, signal, computed, effect, ViewChild, ChangeDetectionStrategy, Component, InjectionToken, ViewEncapsulation, ElementRef, Directive, ViewContainerRef, contentChild, TemplateRef } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { of, switchMap, map as map$1, catchError } from 'rxjs';
import { geoTransverseMercator, geoStereographic, geoOrthographic, geoNaturalEarth1, geoMercator, geoGnomonic, geoEquirectangular, geoConicEquidistant, geoConicEqualArea, geoConicConformal, geoAzimuthalEquidistant, geoAzimuthalEqualArea, geoAlbersUsa, geoAlbers, geoEqualEarth, geoPath, geoCentroid, geoGraticule } from 'd3-geo';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';
import { feature, mesh } from 'topojson-client';
import { NgStyle } from '@angular/common';

// All the different map projections we support
// Each one transforms the globe into a flat map differently
const projectionMap = {
    geoEqualEarth,
    geoAlbers,
    geoAlbersUsa,
    geoAzimuthalEqualArea,
    geoAzimuthalEquidistant,
    geoConicConformal,
    geoConicEqualArea,
    geoConicEquidistant,
    geoEquirectangular,
    geoGnomonic,
    geoMercator,
    geoNaturalEarth1,
    geoOrthographic,
    geoStereographic,
    geoTransverseMercator,
};
// Get the right projection function based on the name you want
function getProjectionFactory(type) {
    const factory = projectionMap[type];
    if (!factory) {
        console.warn(`Unknown projection type: ${type}. Falling back to geoEqualEarth.`);
        return geoEqualEarth;
    }
    return factory;
}

// Create a unique ID for each country/region so Angular can track them
// Tries to use the country's ID or name, falls back to a generic ID
function generateRsmKey(feature, index) {
    if (feature.id !== undefined && feature.id !== null) {
        return String(feature.id);
    }
    if (feature.properties) {
        if (feature.properties['name']) {
            return String(feature.properties['name']);
        }
        if (feature.properties['NAME']) {
            return String(feature.properties['NAME']);
        }
    }
    return `geography-${index}`;
}
// Convert latitude/longitude to pixel coordinates on the screen
function projectCoordinates(coordinates, projection) {
    return projection(coordinates);
}
// Add unique IDs to all the map features so we can track them properly
function addKeysToGeographies(features) {
    return features.map((feature, index) => ({
        ...feature,
        rsmKey: generateRsmKey(feature, index),
    }));
}

// Map country names to continents
// Includes different spellings and abbreviations you might find in map data
const COUNTRY_NAME_TO_CONTINENT = {
    // Africa
    'Algeria': 'Africa', 'Angola': 'Africa', 'Benin': 'Africa', 'Botswana': 'Africa',
    'Burkina Faso': 'Africa', 'Burundi': 'Africa', 'Cameroon': 'Africa', 'Cape Verde': 'Africa',
    'Central African Rep.': 'Africa', 'Central African Republic': 'Africa', 'Chad': 'Africa',
    'Comoros': 'Africa', 'Congo': 'Africa', 'Republic of the Congo': 'Africa', 'Rep. of the Congo': 'Africa',
    'Democratic Republic of the Congo': 'Africa', 'Dem. Rep. Congo': 'Africa', 'Dem. Rep. of the Congo': 'Africa',
    "Côte d'Ivoire": 'Africa', 'Ivory Coast': 'Africa', 'Djibouti': 'Africa',
    'Egypt': 'Africa', 'Equatorial Guinea': 'Africa', 'Eq. Guinea': 'Africa', 'Eritrea': 'Africa',
    'Ethiopia': 'Africa', 'eSwatini': 'Africa', 'Swaziland': 'Africa',
    'Gabon': 'Africa', 'Gambia': 'Africa', 'The Gambia': 'Africa', 'Ghana': 'Africa',
    'Guinea': 'Africa', 'Guinea-Bissau': 'Africa', 'Guinea Bissau': 'Africa', 'Kenya': 'Africa',
    'Lesotho': 'Africa', 'Liberia': 'Africa', 'Libya': 'Africa', 'Madagascar': 'Africa',
    'Malawi': 'Africa', 'Mali': 'Africa', 'Mauritania': 'Africa', 'Mauritius': 'Africa',
    'Morocco': 'Africa', 'Mozambique': 'Africa', 'Namibia': 'Africa', 'Niger': 'Africa',
    'Nigeria': 'Africa', 'Rwanda': 'Africa', 'São Tomé and Príncipe': 'Africa', 'Sao Tome and Principe': 'Africa',
    'Senegal': 'Africa', 'Seychelles': 'Africa', 'Sierra Leone': 'Africa', 'Somalia': 'Africa',
    'Somaliland': 'Africa', 'South Africa': 'Africa', 'S. Africa': 'Africa', 'South Sudan': 'Africa',
    'S. Sudan': 'Africa', 'Sudan': 'Africa', 'Tanzania': 'Africa', 'United Republic of Tanzania': 'Africa',
    'Togo': 'Africa', 'Tunisia': 'Africa', 'Uganda': 'Africa', 'W. Sahara': 'Africa',
    'Western Sahara': 'Africa', 'Zambia': 'Africa', 'Zimbabwe': 'Africa',
    // Asia
    'Afghanistan': 'Asia', 'Armenia': 'Asia', 'Azerbaijan': 'Asia', 'Bahrain': 'Asia',
    'Bangladesh': 'Asia', 'Bhutan': 'Asia', 'Brunei': 'Asia', 'Brunei Darussalam': 'Asia',
    'Cambodia': 'Asia', 'China': 'Asia', 'Georgia': 'Asia',
    'India': 'Asia', 'Indonesia': 'Asia', 'Iran': 'Asia', 'Iraq': 'Asia', 'Israel': 'Asia',
    'Japan': 'Asia', 'Jordan': 'Asia', 'Kazakhstan': 'Asia', 'Kuwait': 'Asia',
    'Kyrgyzstan': 'Asia', 'Laos': 'Asia', 'Lao PDR': 'Asia', 'Lebanon': 'Asia', 'Malaysia': 'Asia',
    'Maldives': 'Asia', 'Mongolia': 'Asia', 'Myanmar': 'Asia', 'Nepal': 'Asia',
    'North Korea': 'Asia', 'Korea, Dem. Rep.': 'Asia', 'Dem. Rep. Korea': 'Asia', 'N. Korea': 'Asia',
    'Oman': 'Asia', 'Pakistan': 'Asia', 'Palestine': 'Asia', 'Palestinian Territories': 'Asia',
    'Philippines': 'Asia', 'Qatar': 'Asia', 'Saudi Arabia': 'Asia', 'Singapore': 'Asia',
    'South Korea': 'Asia', 'Korea': 'Asia', 'Republic of Korea': 'Asia', 'S. Korea': 'Asia',
    'Sri Lanka': 'Asia', 'Syria': 'Asia', 'Syrian Arab Republic': 'Asia',
    'Taiwan': 'Asia', 'Tajikistan': 'Asia', 'Thailand': 'Asia', 'Timor-Leste': 'Asia', 'East Timor': 'Asia',
    'Turkey': 'Asia', 'Turkmenistan': 'Asia', 'United Arab Emirates': 'Asia',
    'Uzbekistan': 'Asia', 'Vietnam': 'Asia', 'Viet Nam': 'Asia', 'Yemen': 'Asia',
    // Europe
    'Albania': 'Europe', 'Andorra': 'Europe', 'Austria': 'Europe', 'Belarus': 'Europe',
    'Belgium': 'Europe', 'Bosnia and Herz.': 'Europe', 'Bosnia and Herzegovina': 'Europe', 'Bosnia': 'Europe',
    'Bulgaria': 'Europe', 'Croatia': 'Europe', 'Cyprus': 'Europe', 'Czechia': 'Europe',
    'Czech Republic': 'Europe', 'Czech Rep.': 'Europe', 'Denmark': 'Europe', 'Estonia': 'Europe',
    'Finland': 'Europe', 'France': 'Europe', 'Germany': 'Europe', 'Greece': 'Europe',
    'Hungary': 'Europe', 'Iceland': 'Europe', 'Ireland': 'Europe', 'Italy': 'Europe',
    'Kosovo': 'Europe', 'Latvia': 'Europe', 'Liechtenstein': 'Europe', 'Lithuania': 'Europe',
    'Luxembourg': 'Europe', 'Malta': 'Europe', 'Moldova': 'Europe', 'Republic of Moldova': 'Europe',
    'Monaco': 'Europe', 'Montenegro': 'Europe', 'Netherlands': 'Europe', 'North Macedonia': 'Europe',
    'Macedonia': 'Europe', 'Norway': 'Europe', 'Poland': 'Europe', 'Portugal': 'Europe',
    'Romania': 'Europe', 'Russia': 'Europe', 'Russian Federation': 'Europe', 'San Marino': 'Europe',
    'Serbia': 'Europe', 'Slovakia': 'Europe', 'Slovenia': 'Europe', 'Spain': 'Europe',
    'Sweden': 'Europe', 'Switzerland': 'Europe', 'Ukraine': 'Europe', 'United Kingdom': 'Europe',
    'UK': 'Europe', 'England': 'Europe', 'Vatican City': 'Europe', 'Vatican': 'Europe', 'Holy See': 'Europe',
    // North America
    'Antigua and Barbuda': 'North America', 'Antigua and Barb.': 'North America',
    'Bahamas': 'North America', 'The Bahamas': 'North America', 'Barbados': 'North America',
    'Belize': 'North America', 'Canada': 'North America', 'Costa Rica': 'North America',
    'Cuba': 'North America', 'Dominica': 'North America', 'Dominican Rep.': 'North America',
    'Dominican Republic': 'North America', 'El Salvador': 'North America', 'Grenada': 'North America',
    'Guatemala': 'North America', 'Haiti': 'North America', 'Honduras': 'North America',
    'Jamaica': 'North America', 'Mexico': 'North America', 'Nicaragua': 'North America',
    'Panama': 'North America', 'Puerto Rico': 'North America',
    'Saint Kitts and Nevis': 'North America', 'St. Kitts and Nevis': 'North America',
    'Saint Lucia': 'North America', 'St. Lucia': 'North America',
    'Saint Vincent and the Grenadines': 'North America', 'St. Vin. and Gren.': 'North America',
    'Trinidad and Tobago': 'North America', 'Trinidad': 'North America',
    'United States': 'North America', 'United States of America': 'North America', 'USA': 'North America',
    // South America
    'Argentina': 'South America', 'Bolivia': 'South America', 'Brazil': 'South America',
    'Chile': 'South America', 'Colombia': 'South America', 'Ecuador': 'South America',
    'Falkland Is.': 'South America', 'Falkland Islands': 'South America',
    'French Guiana': 'South America', 'Fr. Guiana': 'South America',
    'Guyana': 'South America', 'Paraguay': 'South America', 'Peru': 'South America',
    'Suriname': 'South America', 'Uruguay': 'South America', 'Venezuela': 'South America',
    // Oceania
    'Australia': 'Oceania', 'Fiji': 'Oceania', 'Kiribati': 'Oceania', 'Marshall Islands': 'Oceania',
    'Marshall Is.': 'Oceania', 'Micronesia': 'Oceania', 'Federated States of Micronesia': 'Oceania',
    'Nauru': 'Oceania', 'New Zealand': 'Oceania', 'Palau': 'Oceania', 'Papua New Guinea': 'Oceania',
    'Samoa': 'Oceania', 'Solomon Islands': 'Oceania', 'Solomon Is.': 'Oceania',
    'Tonga': 'Oceania', 'Tuvalu': 'Oceania', 'Vanuatu': 'Oceania',
    'New Caledonia': 'Oceania',
    // Antarctica
    'Antarctica': 'Antarctica'
};
// Map 3-letter country codes to continents
// Based on official UN region standards
const COUNTRY_TO_CONTINENT = {
    // Africa
    'DZA': 'Africa', 'AGO': 'Africa', 'BEN': 'Africa', 'BWA': 'Africa', 'BFA': 'Africa',
    'BDI': 'Africa', 'CMR': 'Africa', 'CPV': 'Africa', 'CAF': 'Africa', 'TCD': 'Africa',
    'COM': 'Africa', 'COG': 'Africa', 'COD': 'Africa', 'CIV': 'Africa', 'DJI': 'Africa',
    'EGY': 'Africa', 'GNQ': 'Africa', 'ERI': 'Africa', 'ETH': 'Africa', 'GAB': 'Africa',
    'GMB': 'Africa', 'GHA': 'Africa', 'GIN': 'Africa', 'GNB': 'Africa', 'KEN': 'Africa',
    'LSO': 'Africa', 'LBR': 'Africa', 'LBY': 'Africa', 'MDG': 'Africa', 'MWI': 'Africa',
    'MLI': 'Africa', 'MRT': 'Africa', 'MUS': 'Africa', 'MAR': 'Africa', 'MOZ': 'Africa',
    'NAM': 'Africa', 'NER': 'Africa', 'NGA': 'Africa', 'RWA': 'Africa', 'STP': 'Africa',
    'SEN': 'Africa', 'SYC': 'Africa', 'SLE': 'Africa', 'SOM': 'Africa', 'ZAF': 'Africa',
    'SSD': 'Africa', 'SDN': 'Africa', 'SWZ': 'Africa', 'TZA': 'Africa', 'TGO': 'Africa',
    'TUN': 'Africa', 'UGA': 'Africa', 'ZMB': 'Africa', 'ZWE': 'Africa',
    // Asia
    'AFG': 'Asia', 'ARM': 'Asia', 'AZE': 'Asia', 'BHR': 'Asia', 'BGD': 'Asia',
    'BTN': 'Asia', 'BRN': 'Asia', 'KHM': 'Asia', 'CHN': 'Asia', 'GEO': 'Asia',
    'IND': 'Asia', 'IDN': 'Asia', 'IRN': 'Asia', 'IRQ': 'Asia', 'ISR': 'Asia',
    'JPN': 'Asia', 'JOR': 'Asia', 'KAZ': 'Asia', 'KWT': 'Asia', 'KGZ': 'Asia',
    'LAO': 'Asia', 'LBN': 'Asia', 'MYS': 'Asia', 'MDV': 'Asia', 'MNG': 'Asia',
    'MMR': 'Asia', 'NPL': 'Asia', 'PRK': 'Asia', 'OMN': 'Asia', 'PAK': 'Asia',
    'PSE': 'Asia', 'PHL': 'Asia', 'QAT': 'Asia', 'SAU': 'Asia', 'SGP': 'Asia',
    'KOR': 'Asia', 'LKA': 'Asia', 'SYR': 'Asia', 'TWN': 'Asia', 'TJK': 'Asia',
    'THA': 'Asia', 'TLS': 'Asia', 'TUR': 'Asia', 'TKM': 'Asia', 'ARE': 'Asia',
    'UZB': 'Asia', 'VNM': 'Asia', 'YEM': 'Asia',
    // Europe
    'ALB': 'Europe', 'AND': 'Europe', 'AUT': 'Europe', 'BLR': 'Europe', 'BEL': 'Europe',
    'BIH': 'Europe', 'BGR': 'Europe', 'HRV': 'Europe', 'CYP': 'Europe', 'CZE': 'Europe',
    'DNK': 'Europe', 'EST': 'Europe', 'FIN': 'Europe', 'FRA': 'Europe', 'DEU': 'Europe',
    'GRC': 'Europe', 'HUN': 'Europe', 'ISL': 'Europe', 'IRL': 'Europe', 'ITA': 'Europe',
    'XKX': 'Europe', 'LVA': 'Europe', 'LIE': 'Europe', 'LTU': 'Europe', 'LUX': 'Europe',
    'MKD': 'Europe', 'MLT': 'Europe', 'MDA': 'Europe', 'MCO': 'Europe', 'MNE': 'Europe',
    'NLD': 'Europe', 'NOR': 'Europe', 'POL': 'Europe', 'PRT': 'Europe', 'ROU': 'Europe',
    'RUS': 'Europe', 'SMR': 'Europe', 'SRB': 'Europe', 'SVK': 'Europe', 'SVN': 'Europe',
    'ESP': 'Europe', 'SWE': 'Europe', 'CHE': 'Europe', 'UKR': 'Europe', 'GBR': 'Europe',
    'VAT': 'Europe',
    // North America
    'ATG': 'North America', 'BHS': 'North America', 'BRB': 'North America', 'BLZ': 'North America',
    'CAN': 'North America', 'CRI': 'North America', 'CUB': 'North America', 'DMA': 'North America',
    'DOM': 'North America', 'SLV': 'North America', 'GRD': 'North America', 'GTM': 'North America',
    'HTI': 'North America', 'HND': 'North America', 'JAM': 'North America', 'MEX': 'North America',
    'NIC': 'North America', 'PAN': 'North America', 'KNA': 'North America', 'LCA': 'North America',
    'VCT': 'North America', 'TTO': 'North America', 'USA': 'North America',
    // South America
    'ARG': 'South America', 'BOL': 'South America', 'BRA': 'South America', 'CHL': 'South America',
    'COL': 'South America', 'ECU': 'South America', 'GUY': 'South America', 'PRY': 'South America',
    'PER': 'South America', 'SUR': 'South America', 'URY': 'South America', 'VEN': 'South America',
    // Oceania
    'AUS': 'Oceania', 'FJI': 'Oceania', 'KIR': 'Oceania', 'MHL': 'Oceania', 'FSM': 'Oceania',
    'NRU': 'Oceania', 'NZL': 'Oceania', 'PLW': 'Oceania', 'PNG': 'Oceania', 'WSM': 'Oceania',
    'SLB': 'Oceania', 'TON': 'Oceania', 'TUV': 'Oceania', 'VUT': 'Oceania',
    // Antarctica
    'ATA': 'Antarctica'
};
// Figure out which continent a country belongs to
// Tries different ways that map data might store country info
function getContinentForGeography(geography) {
    if (!geography.properties) {
        return null;
    }
    const props = geography.properties;
    // Some map data already has continent info
    const continent = props['CONTINENT'] || props['continent'];
    if (continent && typeof continent === 'string') {
        return continent;
    }
    // Look for 3-letter country codes in various places
    const countryCode = props['ISO_A3'] || props['iso_a3'] ||
        props['ADM0_A3'] || props['adm0_a3'] ||
        props['SOV_A3'] || props['sov_a3'] ||
        props['ISO3'] || props['iso3'];
    if (countryCode && typeof countryCode === 'string') {
        const result = COUNTRY_TO_CONTINENT[countryCode.toUpperCase()];
        if (result)
            return result;
    }
    // Look for country name in various fields
    const countryName = props['name'] || props['NAME'] ||
        props['ADMIN'] || props['admin'] ||
        props['NAME_LONG'] || props['name_long'] ||
        props['SOVEREIGNT'] || props['sovereignt'];
    if (countryName && typeof countryName === 'string') {
        const result = COUNTRY_NAME_TO_CONTINENT[countryName];
        if (result)
            return result;
    }
    return null;
}
// Keep only countries from specific continents
function filterByContinents(geographies, continents) {
    const continentSet = new Set(Array.isArray(continents) ? continents : [continents]);
    return geographies.filter(geo => {
        const continent = getContinentForGeography(geo);
        return continent && continentSet.has(continent);
    });
}

// Utility functions for creating marker shapes
// Handles all the different marker types and custom SVG creation
class MarkerRendererUtil {
    static createMarkerShape(renderer, shape, size, fill, stroke, customSvg, customSvgSize) {
        let el;
        switch (shape) {
            case 'custom':
                if (customSvg) {
                    const isSvgMarkup = customSvg.trim().toLowerCase().startsWith('<svg');
                    if (isSvgMarkup) {
                        return this.createFromSvgMarkup(renderer, customSvg, size, fill, stroke, customSvgSize);
                    }
                    else {
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
                renderer.setAttribute(el, 'd', `M0,${-pinH} C${-size},${-pinH} ${-size * 1.2},${-pinH * 0.6} ${-size * 1.2},${-pinH * 0.4} ` +
                    `C${-size * 1.2},${-pinH * 0.2} 0,0 0,0 C0,0 ${size * 1.2},${-pinH * 0.2} ${size * 1.2},${-pinH * 0.4} ` +
                    `C${size * 1.2},${-pinH * 0.6} ${size},${-pinH} 0,${-pinH} Z`);
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
    static createFromPathData(renderer, pathData, size, fill, stroke, customSvgSize) {
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
    static createFromSvgMarkup(renderer, svgMarkup, size, fill, stroke, customSvgSize) {
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
            const clone = child.cloneNode(true);
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
    static loadSvgMarker(renderer, url, markerGroup, size, fill, stroke, customSvgSize) {
        // Add a placeholder circle while loading
        const placeholder = renderer.createElement('circle', 'svg');
        renderer.setAttribute(placeholder, 'r', String(size / 2));
        renderer.setAttribute(placeholder, 'fill', fill);
        renderer.setAttribute(placeholder, 'opacity', '0.3');
        renderer.appendChild(markerGroup, placeholder);
        // Fetch the SVG file
        fetch(url)
            .then(response => {
            if (!response.ok)
                throw new Error(`Failed to load SVG: ${url}`);
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

// Utility functions for creating curved paths and geometric calculations
// Helps with drawing flight paths and other curved lines between points
class PathHelperUtil {
    /**
     * Create curved path between two points for flight paths and connections
     */
    static createCurvedLinePath(projection, from, to, curve) {
        const fromProj = projection(from);
        const toProj = projection(to);
        if (!fromProj || !toProj)
            return '';
        const [x1, y1] = fromProj;
        const [x2, y2] = toProj;
        if (curve === 0) {
            return `M${x1},${y1} L${x2},${y2}`;
        }
        // Calculate midpoint and offset for curve
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        // Perpendicular offset for the curve
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Perpendicular direction
        const perpX = -dy / dist;
        const perpY = dx / dist;
        // Control point offset (curve amount)
        const offset = dist * curve * 0.3;
        const ctrlX = midX + perpX * offset;
        const ctrlY = midY + perpY * offset;
        return `M${x1},${y1} Q${ctrlX},${ctrlY} ${x2},${y2}`;
    }
    /**
     * Calculate annotation path with optional curve
     */
    static createAnnotationPath(x, y, dx, dy, curve) {
        const endX = x + dx;
        const endY = y + dy;
        if (curve <= 0) {
            return `M${x},${y} L${endX},${endY}`;
        }
        const midX = x + dx * curve;
        const midY = y + dy * (1 - curve);
        return `M${x},${y} Q${midX},${midY} ${endX},${endY}`;
    }
}

// Handles creating different map projections (like globe view, flat maps, etc.)
class ProjectionService {
    // Create a map projection with the settings you want
    // This is what turns spherical Earth into a flat map
    createProjection(type = 'geoEqualEarth', config = {}, width = 800, height = 400) {
        // Get the right projection type (globe, flat, etc.)
        const projectionFactory = getProjectionFactory(type);
        const projection = projectionFactory();
        // Set it up with your custom settings
        this.applyProjectionConfig(projection, config, width, height);
        return projection;
    }
    // Apply all the custom settings to the projection
    applyProjectionConfig(projection, config, width, height) {
        // Rotate the globe to show different sides
        if (config.rotate) {
            projection.rotate(config.rotate);
        }
        // Center the map on a specific point
        if (config.center) {
            projection.center(config.center);
        }
        // Move the map around
        if (config.translate) {
            projection.translate(config.translate);
        }
        else {
            // By default, center the map in the middle
            projection.translate([width / 2, height / 2]);
        }
        // Set standard parallels for cone-shaped projections
        if (config.parallels && 'parallels' in projection) {
            projection.parallels(config.parallels);
        }
        // Set how precise the curves should be
        if (config.precision !== undefined) {
            projection.precision(config.precision);
        }
        // Set the viewing angle for globe-like projections
        if (config.clipAngle !== undefined && 'clipAngle' in projection) {
            projection.clipAngle(config.clipAngle);
        }
        // Turn off auto-clipping for Mercator to avoid weird edges
        if ('clipExtent' in projection) {
            projection.clipExtent(null);
        }
        // Set the size or auto-fit to the container
        if (config.scale !== undefined) {
            projection.scale(config.scale);
        }
        else {
            // Make it fit perfectly in the container
            this.autoFitProjection(projection, width, height);
        }
    }
    // Automatically scale the map to fit perfectly in the available space
    autoFitProjection(projection, width, height) {
        try {
            // Try to fit the whole world in the container
            projection.fitSize([width, height], { type: 'Sphere' });
        }
        catch (error) {
            // Some projections can't auto-fit, so use a reasonable default size
            console.warn('Projection does not support auto-fitting. Using default scale.');
            projection.scale(150);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: ProjectionService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: ProjectionService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: ProjectionService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }] });

// Loads map data from URLs or objects and converts it to a format we can use
class GeographyLoaderService {
    httpClient = inject(HttpClient);
    cache = new Map();
    // Load map data - either from a URL or data you already have
    load(geography) {
        // If you passed in data directly, just process it
        if (typeof geography === 'object') {
            return of(this.parseGeography(geography));
        }
        // If it's a URL, see if we already downloaded it
        if (this.cache.has(geography)) {
            return this.cache.get(geography);
        }
        // Download from URL and remember it for next time
        const request$ = this.httpClient.get(geography).pipe(map((data) => this.parseGeography(data)), shareReplay(1));
        this.cache.set(geography, request$);
        return request$;
    }
    // Figure out what kind of map data this is and convert it
    parseGeography(data) {
        // Check if it's TopoJSON format
        if (data.type === 'Topology' && data.objects) {
            return this.parseTopoJSON(data);
        }
        // Check if it's GeoJSON format
        if (data.type === 'FeatureCollection' || data.type === 'Feature') {
            return this.parseGeoJSON(data);
        }
        // If we can't tell, assume it's GeoJSON
        console.warn('Unknown geography format. Attempting to parse as GeoJSON.');
        return this.parseGeoJSON(data);
    }
    // Convert TopoJSON data (compressed format) to something we can draw
    parseTopoJSON(topology) {
        // TopoJSON can have multiple objects, just grab the first one
        const objectKeys = Object.keys(topology.objects);
        if (objectKeys.length === 0) {
            throw new Error('TopoJSON topology has no objects');
        }
        const firstObjectKey = objectKeys[0];
        const firstObject = topology.objects[firstObjectKey];
        // Turn the compressed data into individual country shapes
        const featureCollection = feature(topology, firstObject);
        const features = addKeysToGeographies(featureCollection.features);
        // Create lines for borders between countries
        const borders = mesh(topology, firstObject, (a, b) => a !== b // Only draw borders between different countries
        );
        return {
            type: 'topojson',
            features,
            borders,
            outline: { type: 'Sphere' },
        };
    }
    // Handle GeoJSON data (already in the right format, mostly)
    parseGeoJSON(geojson) {
        let features;
        if (geojson.type === 'FeatureCollection') {
            features = geojson.features;
        }
        else if (geojson.type === 'Feature') {
            features = [geojson];
        }
        else {
            // Treat whatever this is as a single map feature
            features = [geojson];
        }
        return {
            type: 'geojson',
            features: addKeysToGeographies(features),
        };
    }
    // Clear downloaded data from memory
    clearCache() {
        this.cache.clear();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: GeographyLoaderService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: GeographyLoaderService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: GeographyLoaderService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }] });

// The main map component that brings everything together
// Just pass in your data and customize however you like!
//
// Basic usage: <asm-map [geography]="worldData"></asm-map>
// With all the bells and whistles:
// <asm-map [geography]="worldData" [markers]="markers" [zoomable]="true" [showTooltip]="true"></asm-map>
class MapComponent {
    projectionService = inject(ProjectionService);
    geographyLoader = inject(GeographyLoaderService);
    renderer = inject(Renderer2);
    svgElement;
    zoomGroupElement;
    // Main map settings
    // The map data - can be a URL or the data itself
    geography = input.required(...(ngDevMode ? [{ debugName: "geography" }] : []));
    // How wide the map should be
    width = input(800, ...(ngDevMode ? [{ debugName: "width" }] : []));
    // How tall the map should be
    height = input(400, ...(ngDevMode ? [{ debugName: "height" }] : []));
    // Max width in pixels (optional)
    maxWidth = input(null, ...(ngDevMode ? [{ debugName: "maxWidth" }] : []));
    // What kind of map projection to use
    projection = input('geoEqualEarth', ...(ngDevMode ? [{ debugName: "projection" }] : []));
    // Extra settings for the projection
    projectionConfig = input({}, ...(ngDevMode ? [{ debugName: "projectionConfig" }] : []));
    // Show only specific continents if you want
    continents = input(null, ...(ngDevMode ? [{ debugName: "continents" }] : []));
    // How the map looks
    // Color to fill countries with
    fill = input('#ECECEC', ...(ngDevMode ? [{ debugName: "fill" }] : []));
    // Color for country borders
    stroke = input('#D6D6D6', ...(ngDevMode ? [{ debugName: "stroke" }] : []));
    // How thick the borders should be
    strokeWidth = input(0.5, ...(ngDevMode ? [{ debugName: "strokeWidth" }] : []));
    // Color when you hover over countries (optional)
    hoverFill = input(null, ...(ngDevMode ? [{ debugName: "hoverFill" }] : []));
    // Points and labels on the map
    // List of points to show on the map
    markers = input([], ...(ngDevMode ? [{ debugName: "markers" }] : []));
    // Text labels with lines pointing to places
    annotations = input([], ...(ngDevMode ? [{ debugName: "annotations" }] : []));
    // What color markers should be by default
    markerColor = input('#FF5533', ...(ngDevMode ? [{ debugName: "markerColor" }] : []));
    // How big markers should be by default
    markerSize = input(6, ...(ngDevMode ? [{ debugName: "markerSize" }] : []));
    // Lines connecting places (like flight paths)
    // List of lines to draw between places
    lines = input([], ...(ngDevMode ? [{ debugName: "lines" }] : []));
    // What color lines should be by default
    lineColor = input('#FF5533', ...(ngDevMode ? [{ debugName: "lineColor" }] : []));
    // How thick lines should be by default
    lineStrokeWidth = input(2, ...(ngDevMode ? [{ debugName: "lineStrokeWidth" }] : []));
    // Color countries based on data (like population density)
    // Data that maps country names to values
    choroplethData = input(null, ...(ngDevMode ? [{ debugName: "choroplethData" }] : []));
    // Settings for how the data coloring works
    choroplethConfig = input(null, ...(ngDevMode ? [{ debugName: "choroplethConfig" }] : []));
    // Grid lines (latitude/longitude)
    // Whether to show the grid lines or not
    showGraticule = input(false, ...(ngDevMode ? [{ debugName: "showGraticule" }] : []));
    // How the grid lines should look
    graticuleConfig = input(null, ...(ngDevMode ? [{ debugName: "graticuleConfig" }] : []));
    // Zoom and pan controls
    // Let users zoom in/out and drag the map around
    zoomable = input(false, ...(ngDevMode ? [{ debugName: "zoomable" }] : []));
    // Show the +/- buttons for zooming
    showZoomControls = input(true, ...(ngDevMode ? [{ debugName: "showZoomControls" }] : []));
    // How far out users can zoom
    minZoom = input(1, ...(ngDevMode ? [{ debugName: "minZoom" }] : []));
    // How far in users can zoom
    maxZoom = input(8, ...(ngDevMode ? [{ debugName: "maxZoom" }] : []));
    // Should clicking a country zoom into it?
    zoomOnClick = input(false, ...(ngDevMode ? [{ debugName: "zoomOnClick" }] : []));
    // How much to zoom when clicking a country
    zoomOnClickLevel = input(4, ...(ngDevMode ? [{ debugName: "zoomOnClickLevel" }] : []));
    // How long zoom animations should take (in milliseconds)
    zoomAnimationDuration = input(800, ...(ngDevMode ? [{ debugName: "zoomAnimationDuration" }] : []));
    // Hover tooltips
    // Show little popup when hovering over countries
    showTooltip = input(false, ...(ngDevMode ? [{ debugName: "showTooltip" }] : []));
    // How the tooltip should look (colors, etc.)
    tooltipConfig = input(null, ...(ngDevMode ? [{ debugName: "tooltipConfig" }] : []));
    // Country name labels
    // Display country names on the map
    showLabels = input(false, ...(ngDevMode ? [{ debugName: "showLabels" }] : []));
    // Only show labels when zoomed in enough
    labelMinZoom = input(1, ...(ngDevMode ? [{ debugName: "labelMinZoom" }] : []));
    // How big the country name text should be
    labelFontSize = input(12, ...(ngDevMode ? [{ debugName: "labelFontSize" }] : []));
    // What color the country names should be
    labelColor = input('#333', ...(ngDevMode ? [{ debugName: "labelColor" }] : []));
    // How bold the country names should be
    labelFontWeight = input('normal', ...(ngDevMode ? [{ debugName: "labelFontWeight" }] : []));
    // Events that get fired when stuff happens
    // Fires when someone clicks on a country
    countryClick = output();
    // Fires when someone hovers over a country
    countryHover = output();
    // Fires when mouse stops hovering over a country
    countryLeave = output();
    // Fires when someone clicks on a marker
    markerClick = output();
    // Fires when someone clicks on a line
    lineClick = output();
    // Internal stuff for keeping track of zoom and pan
    _scale = signal(1, ...(ngDevMode ? [{ debugName: "_scale" }] : []));
    _translateX = signal(0, ...(ngDevMode ? [{ debugName: "_translateX" }] : []));
    _translateY = signal(0, ...(ngDevMode ? [{ debugName: "_translateY" }] : []));
    tooltipVisible = signal(false, ...(ngDevMode ? [{ debugName: "tooltipVisible" }] : []));
    tooltipX = signal(0, ...(ngDevMode ? [{ debugName: "tooltipX" }] : []));
    tooltipY = signal(0, ...(ngDevMode ? [{ debugName: "tooltipY" }] : []));
    tooltipContent = signal('', ...(ngDevMode ? [{ debugName: "tooltipContent" }] : []));
    isDragging = false;
    dragStartX = 0;
    dragStartY = 0;
    lastTranslateX = 0;
    lastTranslateY = 0;
    // Keep track of event listeners so we can clean them up later
    wheelHandler;
    mouseDownHandler;
    mouseMoveHandler;
    mouseUpHandler;
    // SVG viewbox dimensions
    viewBox = computed(() => `0 0 ${this.width()} ${this.height()}`, ...(ngDevMode ? [{ debugName: "viewBox" }] : []));
    // The map projection we're using
    proj = computed(() => this.projectionService.createProjection(this.projection(), this.projectionConfig(), this.width(), this.height()), ...(ngDevMode ? [{ debugName: "proj" }] : []));
    // Converts geographic coordinates to SVG paths
    pathGenerator = computed(() => geoPath().projection(this.proj()), ...(ngDevMode ? [{ debugName: "pathGenerator" }] : []));
    // The actual country/geography data after loading
    geographies = toSignal(toObservable(this.geography).pipe(switchMap(geo => this.geographyLoader.load(geo).pipe(map$1(data => {
        let features = data.features;
        const continentFilter = this.continents();
        if (continentFilter) {
            features = filterByContinents(features, continentFilter);
        }
        return features;
    }), catchError(err => {
        console.error('Error loading geographies:', err);
        return of([]);
    })))), { initialValue: [] });
    constructor() {
        // Redraw the map when data or styles change
        effect(() => {
            const geos = this.geographies();
            if (geos.length > 0 && this.zoomGroupElement) {
                this.render();
            }
        });
        // Redraw labels when zoom or label settings change
        effect(() => {
            const showLabels = this.showLabels();
            const labelMinZoom = this.labelMinZoom();
            const scale = this._scale();
            if (this.zoomGroupElement && this.geographies().length > 0) {
                this.render();
            }
        });
    }
    ngAfterViewInit() {
        // Draw the map for the first time
        setTimeout(() => this.render(), 0);
        // Set up mouse/wheel events for zooming if enabled
        if (this.zoomable()) {
            this.setupZoomHandlers();
        }
    }
    ngOnDestroy() {
        this.cleanupZoomHandlers();
    }
    // Public methods for controlling zoom
    zoomIn() {
        const newScale = Math.min(this._scale() * 1.5, this.maxZoom());
        this._scale.set(newScale);
        this.updateTransform();
    }
    zoomOut() {
        const newScale = Math.max(this._scale() / 1.5, this.minZoom());
        this._scale.set(newScale);
        this.updateTransform();
    }
    resetZoom() {
        this._scale.set(1);
        this._translateX.set(0);
        this._translateY.set(0);
        this.updateTransform();
    }
    // Focus the map on a specific country or region
    zoomToFeature(geo) {
        const projection = this.proj();
        // Find the center point of the country
        const centroid = geoCentroid(geo);
        const projectedCentroid = projection(centroid);
        if (!projectedCentroid)
            return;
        const width = this.width();
        const height = this.height();
        // Use the zoom level from settings
        let targetScale = this.zoomOnClickLevel();
        // Make sure zoom level is within allowed range
        targetScale = Math.max(this.minZoom(), Math.min(targetScale, this.maxZoom()));
        // The transform is: translate(w/2 + tx, h/2 + ty) scale(s) translate(-w/2, -h/2)
        // We want the projected centroid to end up at the center of the viewport (w/2, h/2)
        // 
        // After the full transform, a point at [x, y] becomes:
        // [(x - w/2) * s + w/2 + tx, (y - h/2) * s + h/2 + ty]
        //
        // We want projectedCentroid to map to [w/2, h/2], so:
        // (projectedCentroid[0] - w/2) * s + w/2 + tx = w/2
        // (projectedCentroid[1] - h/2) * s + h/2 + ty = h/2
        //
        // Solving for tx and ty:
        // tx = -(projectedCentroid[0] - w/2) * s
        // ty = -(projectedCentroid[1] - h/2) * s
        const translateX = -(projectedCentroid[0] - width / 2) * targetScale;
        const translateY = -(projectedCentroid[1] - height / 2) * targetScale;
        // Smoothly move to the new view
        this.animateToZoom(targetScale, translateX, translateY);
    }
    // Smoothly animate to a new zoom level and position
    animateToZoom(targetScale, targetX, targetY) {
        const startScale = this._scale();
        const startX = this._translateX();
        const startY = this._translateY();
        const duration = this.zoomAnimationDuration();
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Use a nice smooth easing function
            const eased = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            // Interpolate values
            const currentScale = startScale + (targetScale - startScale) * eased;
            const currentX = startX + (targetX - startX) * eased;
            const currentY = startY + (targetY - startY) * eased;
            // Apply the interpolated values
            this._scale.set(currentScale);
            this._translateX.set(currentX);
            this._translateY.set(currentY);
            this.updateTransform();
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }
    // ===== Internal Methods =====
    onMouseMove(event) {
        if (this.showTooltip() && this.tooltipVisible()) {
            this.tooltipX.set(event.clientX + 10);
            this.tooltipY.set(event.clientY + 10);
        }
    }
    render() {
        if (!this.zoomGroupElement)
            return;
        const group = this.zoomGroupElement.nativeElement;
        const geos = this.geographies();
        const path = this.pathGenerator();
        const proj = this.proj();
        // Clear existing content
        this.clearSvgContent(group);
        // Render all layers in order
        this.renderGraticule(group, path);
        this.renderGeographies(group, geos, path);
        this.renderLines(group, proj);
        this.renderMarkers(group, proj);
        this.renderAnnotations(group, proj);
        this.renderLabels(group, geos, proj);
        // Apply current transform
        this.updateTransform();
    }
    clearSvgContent(group) {
        while (group.firstChild) {
            group.removeChild(group.firstChild);
        }
    }
    renderGraticule(group, path) {
        if (!this.showGraticule())
            return;
        const config = this.graticuleConfig();
        const graticule = geoGraticule();
        if (config?.step) {
            graticule.step(config.step);
        }
        // Render graticule lines (grid lines)
        const graticuleLines = graticule.lines();
        graticuleLines.forEach(line => {
            const lineEl = this.renderer.createElement('path', 'svg');
            const pathData = path(line) || '';
            this.renderer.setAttribute(lineEl, 'd', pathData);
            this.renderer.setAttribute(lineEl, 'fill', 'none');
            this.renderer.setAttribute(lineEl, 'stroke', config?.color || '#ccc');
            this.renderer.setAttribute(lineEl, 'stroke-width', String(config?.strokeWidth || 0.5));
            this.renderer.setAttribute(lineEl, 'opacity', String(config?.opacity || 0.5));
            this.renderer.appendChild(group, lineEl);
        });
        // Optionally render graticule outline (sphere)
        const outline = graticule.outline();
        if (outline) {
            const outlineEl = this.renderer.createElement('path', 'svg');
            const outlineData = path(outline) || '';
            this.renderer.setAttribute(outlineEl, 'd', outlineData);
            this.renderer.setAttribute(outlineEl, 'fill', 'none');
            this.renderer.setAttribute(outlineEl, 'stroke', config?.color || '#ccc');
            this.renderer.setAttribute(outlineEl, 'stroke-width', String((config?.strokeWidth || 0.5) * 2));
            this.renderer.setAttribute(outlineEl, 'opacity', String((config?.opacity || 0.5) * 0.3));
            this.renderer.appendChild(group, outlineEl);
        }
    }
    renderGeographies(group, geos, path) {
        geos.forEach(geo => {
            const pathEl = this.renderer.createElement('path', 'svg');
            const pathData = path(geo) || '';
            // Determine fill color (choropleth takes priority)
            const choroplethColor = this.getChoroplethColor(geo);
            const baseFill = choroplethColor || this.fill();
            this.renderer.setAttribute(pathEl, 'd', pathData);
            this.renderer.setAttribute(pathEl, 'fill', baseFill);
            this.renderer.setAttribute(pathEl, 'stroke', this.stroke());
            this.renderer.setAttribute(pathEl, 'stroke-width', String(this.strokeWidth()));
            this.renderer.setStyle(pathEl, 'cursor', 'pointer');
            // Store original fill for hover restoration
            pathEl.dataset['originalFill'] = baseFill;
            this.addGeographyEventHandlers(pathEl, geo);
            this.renderer.appendChild(group, pathEl);
        });
    }
    addGeographyEventHandlers(pathEl, geo) {
        this.renderer.listen(pathEl, 'mouseenter', (e) => {
            if (this.hoverFill()) {
                this.renderer.setAttribute(pathEl, 'fill', this.hoverFill());
            }
            const props = geo.properties || {};
            this.countryHover.emit({ properties: props, id: geo.id, event: e });
            if (this.showTooltip()) {
                this.tooltipContent.set(String(props['name'] || 'Unknown'));
                this.tooltipX.set(e.clientX + 10);
                this.tooltipY.set(e.clientY + 10);
                this.tooltipVisible.set(true);
            }
        });
        this.renderer.listen(pathEl, 'mouseleave', () => {
            // Restore original fill (could be choropleth color)
            const originalFill = pathEl.dataset['originalFill'] || this.fill();
            this.renderer.setAttribute(pathEl, 'fill', originalFill);
            this.countryLeave.emit();
            this.tooltipVisible.set(false);
        });
        this.renderer.listen(pathEl, 'click', (e) => {
            const props = geo.properties || {};
            // Zoom to country if enabled
            if (this.zoomOnClick()) {
                this.zoomToFeature(geo);
            }
            this.countryClick.emit({ properties: props, id: geo.id, event: e });
        });
    }
    renderLines(group, proj) {
        this.lines().forEach((line, index) => {
            const curve = line.curve ?? 0;
            const linePathData = PathHelperUtil.createCurvedLinePath(proj, line.from, line.to, curve);
            if (!linePathData)
                return;
            const linePath = this.renderer.createElement('path', 'svg');
            this.renderer.setAttribute(linePath, 'd', linePathData);
            this.renderer.setAttribute(linePath, 'fill', 'none');
            this.renderer.setAttribute(linePath, 'stroke', line.color || this.lineColor());
            this.renderer.setAttribute(linePath, 'stroke-width', String(line.strokeWidth || this.lineStrokeWidth()));
            this.renderer.setStyle(linePath, 'cursor', 'pointer');
            if (line.dashed) {
                this.renderer.setAttribute(linePath, 'stroke-dasharray', '5,3');
            }
            // Line click handler
            this.renderer.listen(linePath, 'click', (e) => {
                e.stopPropagation();
                this.lineClick.emit({ line, index, event: e });
            });
            this.renderer.appendChild(group, linePath);
            this.renderLineEndpoints(group, line, proj);
        });
    }
    renderLineEndpoints(group, line, proj) {
        const fromProj = proj(line.from);
        const toProj = proj(line.to);
        if (fromProj) {
            const startDot = this.renderer.createElement('circle', 'svg');
            this.renderer.setAttribute(startDot, 'cx', String(fromProj[0]));
            this.renderer.setAttribute(startDot, 'cy', String(fromProj[1]));
            this.renderer.setAttribute(startDot, 'r', '3');
            this.renderer.setAttribute(startDot, 'fill', line.color || this.lineColor());
            this.renderer.appendChild(group, startDot);
        }
        if (toProj) {
            const endDot = this.renderer.createElement('circle', 'svg');
            this.renderer.setAttribute(endDot, 'cx', String(toProj[0]));
            this.renderer.setAttribute(endDot, 'cy', String(toProj[1]));
            this.renderer.setAttribute(endDot, 'r', '3');
            this.renderer.setAttribute(endDot, 'fill', line.color || this.lineColor());
            this.renderer.appendChild(group, endDot);
        }
    }
    renderMarkers(group, proj) {
        this.markers().forEach((marker, index) => {
            const projected = proj(marker.coordinates);
            if (!projected)
                return;
            const [x, y] = projected;
            const markerGroup = this.renderer.createElement('g', 'svg');
            this.renderer.setAttribute(markerGroup, 'transform', `translate(${x}, ${y})`);
            this.renderer.setStyle(markerGroup, 'cursor', 'pointer');
            const shape = marker.shape || 'circle';
            const size = marker.size || this.markerSize();
            const color = marker.color || this.markerColor();
            const strokeColor = marker.stroke || '#FFFFFF';
            // Handle custom SVG URL (async loading)
            if (shape === 'custom' && marker.customSvgUrl) {
                MarkerRendererUtil.loadSvgMarker(this.renderer, marker.customSvgUrl, markerGroup, size, color, strokeColor, marker.customSvgSize);
            }
            else {
                const shapeEl = MarkerRendererUtil.createMarkerShape(this.renderer, shape, size, color, strokeColor, marker.customSvg, marker.customSvgSize);
                this.renderer.appendChild(markerGroup, shapeEl);
            }
            // Marker click handler
            this.renderer.listen(markerGroup, 'click', (e) => {
                e.stopPropagation();
                this.markerClick.emit({ marker, index, event: e });
            });
            this.renderer.appendChild(group, markerGroup);
        });
    }
    renderAnnotations(group, proj) {
        this.annotations().forEach(annotation => {
            const projected = proj(annotation.coordinates);
            if (!projected)
                return;
            const [x, y] = projected;
            const dx = annotation.dx || 30;
            const dy = annotation.dy || -30;
            const curve = annotation.curve || 0;
            const annotationGroup = this.renderer.createElement('g', 'svg');
            // Connector line
            const endX = x + dx;
            const endY = y + dy;
            const pathEl = this.renderer.createElement('path', 'svg');
            const pathD = PathHelperUtil.createAnnotationPath(x, y, dx, dy, curve);
            this.renderer.setAttribute(pathEl, 'd', pathD);
            this.renderer.setAttribute(pathEl, 'fill', 'none');
            this.renderer.setAttribute(pathEl, 'stroke', annotation.color || '#FF5533');
            this.renderer.setAttribute(pathEl, 'stroke-width', '1');
            this.renderer.appendChild(annotationGroup, pathEl);
            // Subject dot
            const dot = this.renderer.createElement('circle', 'svg');
            this.renderer.setAttribute(dot, 'cx', String(x));
            this.renderer.setAttribute(dot, 'cy', String(y));
            this.renderer.setAttribute(dot, 'r', '4');
            this.renderer.setAttribute(dot, 'fill', annotation.color || '#FF5533');
            this.renderer.appendChild(annotationGroup, dot);
            // Text
            const text = this.renderer.createElement('text', 'svg');
            this.renderer.setAttribute(text, 'x', String(endX));
            this.renderer.setAttribute(text, 'y', String(endY));
            this.renderer.setAttribute(text, 'fill', annotation.color || '#000');
            this.renderer.setAttribute(text, 'font-size', String(annotation.fontSize || 14));
            this.renderer.setAttribute(text, 'font-weight', String(annotation.fontWeight || 'normal'));
            this.renderer.setAttribute(text, 'text-anchor', dx > 0 ? 'start' : 'end');
            this.renderer.setAttribute(text, 'dy', '-5');
            text.textContent = annotation.text;
            this.renderer.appendChild(annotationGroup, text);
            this.renderer.appendChild(group, annotationGroup);
        });
    }
    renderLabels(group, geos, proj) {
        if (!this.showLabels() || this._scale() < this.labelMinZoom())
            return;
        geos.forEach(geo => {
            const properties = geo.properties || {};
            const name = properties['name'] || properties['NAME'] || properties['name_en'];
            if (!name)
                return;
            // Calculate centroid for label position
            const centroid = geoCentroid(geo);
            const projected = proj(centroid);
            if (!projected)
                return;
            const [x, y] = projected;
            const labelEl = this.renderer.createElement('text', 'svg');
            this.renderer.setAttribute(labelEl, 'x', String(x));
            this.renderer.setAttribute(labelEl, 'y', String(y));
            this.renderer.setAttribute(labelEl, 'text-anchor', 'middle');
            this.renderer.setAttribute(labelEl, 'alignment-baseline', 'central');
            this.renderer.setAttribute(labelEl, 'fill', this.labelColor());
            this.renderer.setAttribute(labelEl, 'font-size', String(this.labelFontSize()));
            this.renderer.setAttribute(labelEl, 'font-weight', String(this.labelFontWeight()));
            this.renderer.setAttribute(labelEl, 'font-family', 'sans-serif');
            this.renderer.setAttribute(labelEl, 'pointer-events', 'none');
            this.renderer.setStyle(labelEl, 'user-select', 'none');
            // Add text shadow for better readability
            this.renderer.setStyle(labelEl, 'text-shadow', '1px 1px 1px rgba(255,255,255,0.8), -1px -1px 1px rgba(255,255,255,0.8)');
            labelEl.textContent = String(name);
            this.renderer.appendChild(group, labelEl);
        });
    }
    updateTransform() {
        if (!this.zoomGroupElement)
            return;
        const w = this.width();
        const h = this.height();
        const s = this._scale();
        const tx = this._translateX();
        const ty = this._translateY();
        const transform = `translate(${w / 2 + tx}, ${h / 2 + ty}) scale(${s}) translate(${-w / 2}, ${-h / 2})`;
        this.renderer.setAttribute(this.zoomGroupElement.nativeElement, 'transform', transform);
    }
    setupZoomHandlers() {
        const svg = this.svgElement?.nativeElement;
        if (!svg)
            return;
        // Wheel zoom
        this.wheelHandler = (e) => {
            e.preventDefault();
            const delta = -e.deltaY * 0.001;
            const scaleFactor = 1 + delta;
            const currentScale = this._scale();
            const newScale = Math.max(this.minZoom(), Math.min(currentScale * scaleFactor, this.maxZoom()));
            if (newScale !== currentScale) {
                const rect = svg.getBoundingClientRect();
                const mouseX = e.clientX - rect.left - rect.width / 2;
                const mouseY = e.clientY - rect.top - rect.height / 2;
                const scaleRatio = newScale / currentScale;
                const svgScaleX = rect.width / this.width();
                const svgScaleY = rect.height / this.height();
                this._translateX.update(tx => tx - (mouseX / svgScaleX - tx) * (scaleRatio - 1));
                this._translateY.update(ty => ty - (mouseY / svgScaleY - ty) * (scaleRatio - 1));
                this._scale.set(newScale);
                this.updateTransform();
            }
        };
        svg.addEventListener('wheel', this.wheelHandler, { passive: false });
        // Pan handlers
        this.mouseDownHandler = (e) => {
            if (e.button !== 0)
                return;
            this.isDragging = true;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
            this.lastTranslateX = this._translateX();
            this.lastTranslateY = this._translateY();
        };
        this.mouseMoveHandler = (e) => {
            if (!this.isDragging)
                return;
            const rect = svg.getBoundingClientRect();
            const svgScaleX = rect.width / this.width();
            const svgScaleY = rect.height / this.height();
            const deltaX = (e.clientX - this.dragStartX) / svgScaleX;
            const deltaY = (e.clientY - this.dragStartY) / svgScaleY;
            this._translateX.set(this.lastTranslateX + deltaX);
            this._translateY.set(this.lastTranslateY + deltaY);
            this.updateTransform();
        };
        this.mouseUpHandler = () => {
            this.isDragging = false;
        };
        svg.addEventListener('mousedown', this.mouseDownHandler);
        window.addEventListener('mousemove', this.mouseMoveHandler);
        window.addEventListener('mouseup', this.mouseUpHandler);
    }
    cleanupZoomHandlers() {
        const svg = this.svgElement?.nativeElement;
        if (!svg)
            return;
        if (this.wheelHandler)
            svg.removeEventListener('wheel', this.wheelHandler);
        if (this.mouseDownHandler)
            svg.removeEventListener('mousedown', this.mouseDownHandler);
        if (this.mouseMoveHandler)
            window.removeEventListener('mousemove', this.mouseMoveHandler);
        if (this.mouseUpHandler)
            window.removeEventListener('mouseup', this.mouseUpHandler);
    }
    /**
     * Get fill color for a geography based on choropleth data
     */
    getChoroplethColor(geo) {
        const data = this.choroplethData();
        const config = this.choroplethConfig();
        if (!data)
            return null;
        const matchKey = config?.matchKey || 'name';
        const geoKey = geo.properties?.[matchKey];
        if (geoKey === undefined)
            return config?.nullColor || null;
        const value = data[String(geoKey)];
        if (value === undefined)
            return config?.nullColor || null;
        // Get color scale
        const colors = config?.colors || ['#E3F2FD', '#90CAF9', '#42A5F5', '#1E88E5', '#1565C0'];
        // Calculate min/max from data
        const values = Object.values(data);
        const minValue = config?.minValue ?? Math.min(...values);
        const maxValue = config?.maxValue ?? Math.max(...values);
        if (maxValue === minValue)
            return colors[Math.floor(colors.length / 2)];
        // Interpolate color
        const normalized = (value - minValue) / (maxValue - minValue);
        const colorIndex = Math.min(Math.floor(normalized * colors.length), colors.length - 1);
        return colors[colorIndex];
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: MapComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.0.8", type: MapComponent, isStandalone: true, selector: "asm-map", inputs: { geography: { classPropertyName: "geography", publicName: "geography", isSignal: true, isRequired: true, transformFunction: null }, width: { classPropertyName: "width", publicName: "width", isSignal: true, isRequired: false, transformFunction: null }, height: { classPropertyName: "height", publicName: "height", isSignal: true, isRequired: false, transformFunction: null }, maxWidth: { classPropertyName: "maxWidth", publicName: "maxWidth", isSignal: true, isRequired: false, transformFunction: null }, projection: { classPropertyName: "projection", publicName: "projection", isSignal: true, isRequired: false, transformFunction: null }, projectionConfig: { classPropertyName: "projectionConfig", publicName: "projectionConfig", isSignal: true, isRequired: false, transformFunction: null }, continents: { classPropertyName: "continents", publicName: "continents", isSignal: true, isRequired: false, transformFunction: null }, fill: { classPropertyName: "fill", publicName: "fill", isSignal: true, isRequired: false, transformFunction: null }, stroke: { classPropertyName: "stroke", publicName: "stroke", isSignal: true, isRequired: false, transformFunction: null }, strokeWidth: { classPropertyName: "strokeWidth", publicName: "strokeWidth", isSignal: true, isRequired: false, transformFunction: null }, hoverFill: { classPropertyName: "hoverFill", publicName: "hoverFill", isSignal: true, isRequired: false, transformFunction: null }, markers: { classPropertyName: "markers", publicName: "markers", isSignal: true, isRequired: false, transformFunction: null }, annotations: { classPropertyName: "annotations", publicName: "annotations", isSignal: true, isRequired: false, transformFunction: null }, markerColor: { classPropertyName: "markerColor", publicName: "markerColor", isSignal: true, isRequired: false, transformFunction: null }, markerSize: { classPropertyName: "markerSize", publicName: "markerSize", isSignal: true, isRequired: false, transformFunction: null }, lines: { classPropertyName: "lines", publicName: "lines", isSignal: true, isRequired: false, transformFunction: null }, lineColor: { classPropertyName: "lineColor", publicName: "lineColor", isSignal: true, isRequired: false, transformFunction: null }, lineStrokeWidth: { classPropertyName: "lineStrokeWidth", publicName: "lineStrokeWidth", isSignal: true, isRequired: false, transformFunction: null }, choroplethData: { classPropertyName: "choroplethData", publicName: "choroplethData", isSignal: true, isRequired: false, transformFunction: null }, choroplethConfig: { classPropertyName: "choroplethConfig", publicName: "choroplethConfig", isSignal: true, isRequired: false, transformFunction: null }, showGraticule: { classPropertyName: "showGraticule", publicName: "showGraticule", isSignal: true, isRequired: false, transformFunction: null }, graticuleConfig: { classPropertyName: "graticuleConfig", publicName: "graticuleConfig", isSignal: true, isRequired: false, transformFunction: null }, zoomable: { classPropertyName: "zoomable", publicName: "zoomable", isSignal: true, isRequired: false, transformFunction: null }, showZoomControls: { classPropertyName: "showZoomControls", publicName: "showZoomControls", isSignal: true, isRequired: false, transformFunction: null }, minZoom: { classPropertyName: "minZoom", publicName: "minZoom", isSignal: true, isRequired: false, transformFunction: null }, maxZoom: { classPropertyName: "maxZoom", publicName: "maxZoom", isSignal: true, isRequired: false, transformFunction: null }, zoomOnClick: { classPropertyName: "zoomOnClick", publicName: "zoomOnClick", isSignal: true, isRequired: false, transformFunction: null }, zoomOnClickLevel: { classPropertyName: "zoomOnClickLevel", publicName: "zoomOnClickLevel", isSignal: true, isRequired: false, transformFunction: null }, zoomAnimationDuration: { classPropertyName: "zoomAnimationDuration", publicName: "zoomAnimationDuration", isSignal: true, isRequired: false, transformFunction: null }, showTooltip: { classPropertyName: "showTooltip", publicName: "showTooltip", isSignal: true, isRequired: false, transformFunction: null }, tooltipConfig: { classPropertyName: "tooltipConfig", publicName: "tooltipConfig", isSignal: true, isRequired: false, transformFunction: null }, showLabels: { classPropertyName: "showLabels", publicName: "showLabels", isSignal: true, isRequired: false, transformFunction: null }, labelMinZoom: { classPropertyName: "labelMinZoom", publicName: "labelMinZoom", isSignal: true, isRequired: false, transformFunction: null }, labelFontSize: { classPropertyName: "labelFontSize", publicName: "labelFontSize", isSignal: true, isRequired: false, transformFunction: null }, labelColor: { classPropertyName: "labelColor", publicName: "labelColor", isSignal: true, isRequired: false, transformFunction: null }, labelFontWeight: { classPropertyName: "labelFontWeight", publicName: "labelFontWeight", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { countryClick: "countryClick", countryHover: "countryHover", countryLeave: "countryLeave", markerClick: "markerClick", lineClick: "lineClick" }, viewQueries: [{ propertyName: "svgElement", first: true, predicate: ["svgElement"], descendants: true }, { propertyName: "zoomGroupElement", first: true, predicate: ["zoomGroup"], descendants: true }], ngImport: i0, template: "<div class=\"asm-map-container\" [style.max-width]=\"maxWidth() ? maxWidth() + 'px' : '100%'\">\n  <svg\n    #svgElement\n    [attr.viewBox]=\"viewBox()\"\n    class=\"asm-map-svg\"\n    (mousemove)=\"onMouseMove($event)\">\n    <g #zoomGroup class=\"asm-map-content\">\n      <!-- Geographies will be rendered here -->\n    </g>\n  </svg>\n\n  <!-- Zoom Controls -->\n  @if (zoomable() && showZoomControls()) {\n    <div class=\"asm-map-zoom-controls\">\n      <button class=\"asm-map-zoom-btn\" (click)=\"zoomIn()\" title=\"Zoom in\">+</button>\n      <button class=\"asm-map-zoom-btn\" (click)=\"zoomOut()\" title=\"Zoom out\">-</button>\n      <button class=\"asm-map-zoom-btn\" (click)=\"resetZoom()\" title=\"Reset\">&#8634;</button>\n    </div>\n  }\n\n  <!-- Tooltip -->\n  @if (showTooltip() && tooltipVisible()) {\n    <div\n      class=\"asm-map-tooltip\"\n      [style.left]=\"tooltipX() + 'px'\"\n      [style.top]=\"tooltipY() + 'px'\"\n      [style.background-color]=\"tooltipConfig()?.backgroundColor || '#fff'\"\n      [style.color]=\"tooltipConfig()?.textColor || '#333'\"\n      [style.border-color]=\"tooltipConfig()?.borderColor || '#ccc'\"\n      [style.border-radius]=\"(tooltipConfig()?.borderRadius || 4) + 'px'\">\n      <div class=\"asm-map-tooltip-title\" [style.color]=\"tooltipConfig()?.titleColor\">\n        {{ tooltipContent() }}\n      </div>\n    </div>\n  }\n</div>", styles: [".asm-map-container{position:relative;width:100%;margin:auto}.asm-map-svg{width:100%;height:auto;display:block}.asm-map-content{cursor:grab}.asm-map-content:active{cursor:grabbing}.asm-map-zoom-controls{position:absolute;top:10px;right:10px;display:flex;flex-direction:column;gap:4px}.asm-map-zoom-btn{width:32px;height:32px;border:none;background:#fff;border-radius:4px;box-shadow:0 2px 4px #0003;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center}.asm-map-zoom-btn:hover{background:#f5f5f5}.asm-map-tooltip{position:fixed;pointer-events:none;z-index:1000;padding:8px 12px;border:1px solid;box-shadow:0 2px 8px #00000026;font-size:13px}.asm-map-tooltip-title{font-weight:600}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: MapComponent, decorators: [{
            type: Component,
            args: [{ selector: 'asm-map', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"asm-map-container\" [style.max-width]=\"maxWidth() ? maxWidth() + 'px' : '100%'\">\n  <svg\n    #svgElement\n    [attr.viewBox]=\"viewBox()\"\n    class=\"asm-map-svg\"\n    (mousemove)=\"onMouseMove($event)\">\n    <g #zoomGroup class=\"asm-map-content\">\n      <!-- Geographies will be rendered here -->\n    </g>\n  </svg>\n\n  <!-- Zoom Controls -->\n  @if (zoomable() && showZoomControls()) {\n    <div class=\"asm-map-zoom-controls\">\n      <button class=\"asm-map-zoom-btn\" (click)=\"zoomIn()\" title=\"Zoom in\">+</button>\n      <button class=\"asm-map-zoom-btn\" (click)=\"zoomOut()\" title=\"Zoom out\">-</button>\n      <button class=\"asm-map-zoom-btn\" (click)=\"resetZoom()\" title=\"Reset\">&#8634;</button>\n    </div>\n  }\n\n  <!-- Tooltip -->\n  @if (showTooltip() && tooltipVisible()) {\n    <div\n      class=\"asm-map-tooltip\"\n      [style.left]=\"tooltipX() + 'px'\"\n      [style.top]=\"tooltipY() + 'px'\"\n      [style.background-color]=\"tooltipConfig()?.backgroundColor || '#fff'\"\n      [style.color]=\"tooltipConfig()?.textColor || '#333'\"\n      [style.border-color]=\"tooltipConfig()?.borderColor || '#ccc'\"\n      [style.border-radius]=\"(tooltipConfig()?.borderRadius || 4) + 'px'\">\n      <div class=\"asm-map-tooltip-title\" [style.color]=\"tooltipConfig()?.titleColor\">\n        {{ tooltipContent() }}\n      </div>\n    </div>\n  }\n</div>", styles: [".asm-map-container{position:relative;width:100%;margin:auto}.asm-map-svg{width:100%;height:auto;display:block}.asm-map-content{cursor:grab}.asm-map-content:active{cursor:grabbing}.asm-map-zoom-controls{position:absolute;top:10px;right:10px;display:flex;flex-direction:column;gap:4px}.asm-map-zoom-btn{width:32px;height:32px;border:none;background:#fff;border-radius:4px;box-shadow:0 2px 4px #0003;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center}.asm-map-zoom-btn:hover{background:#f5f5f5}.asm-map-tooltip{position:fixed;pointer-events:none;z-index:1000;padding:8px 12px;border:1px solid;box-shadow:0 2px 8px #00000026;font-size:13px}.asm-map-tooltip-title{font-weight:600}\n"] }]
        }], ctorParameters: () => [], propDecorators: { svgElement: [{
                type: ViewChild,
                args: ['svgElement']
            }], zoomGroupElement: [{
                type: ViewChild,
                args: ['zoomGroup']
            }], geography: [{ type: i0.Input, args: [{ isSignal: true, alias: "geography", required: true }] }], width: [{ type: i0.Input, args: [{ isSignal: true, alias: "width", required: false }] }], height: [{ type: i0.Input, args: [{ isSignal: true, alias: "height", required: false }] }], maxWidth: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxWidth", required: false }] }], projection: [{ type: i0.Input, args: [{ isSignal: true, alias: "projection", required: false }] }], projectionConfig: [{ type: i0.Input, args: [{ isSignal: true, alias: "projectionConfig", required: false }] }], continents: [{ type: i0.Input, args: [{ isSignal: true, alias: "continents", required: false }] }], fill: [{ type: i0.Input, args: [{ isSignal: true, alias: "fill", required: false }] }], stroke: [{ type: i0.Input, args: [{ isSignal: true, alias: "stroke", required: false }] }], strokeWidth: [{ type: i0.Input, args: [{ isSignal: true, alias: "strokeWidth", required: false }] }], hoverFill: [{ type: i0.Input, args: [{ isSignal: true, alias: "hoverFill", required: false }] }], markers: [{ type: i0.Input, args: [{ isSignal: true, alias: "markers", required: false }] }], annotations: [{ type: i0.Input, args: [{ isSignal: true, alias: "annotations", required: false }] }], markerColor: [{ type: i0.Input, args: [{ isSignal: true, alias: "markerColor", required: false }] }], markerSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "markerSize", required: false }] }], lines: [{ type: i0.Input, args: [{ isSignal: true, alias: "lines", required: false }] }], lineColor: [{ type: i0.Input, args: [{ isSignal: true, alias: "lineColor", required: false }] }], lineStrokeWidth: [{ type: i0.Input, args: [{ isSignal: true, alias: "lineStrokeWidth", required: false }] }], choroplethData: [{ type: i0.Input, args: [{ isSignal: true, alias: "choroplethData", required: false }] }], choroplethConfig: [{ type: i0.Input, args: [{ isSignal: true, alias: "choroplethConfig", required: false }] }], showGraticule: [{ type: i0.Input, args: [{ isSignal: true, alias: "showGraticule", required: false }] }], graticuleConfig: [{ type: i0.Input, args: [{ isSignal: true, alias: "graticuleConfig", required: false }] }], zoomable: [{ type: i0.Input, args: [{ isSignal: true, alias: "zoomable", required: false }] }], showZoomControls: [{ type: i0.Input, args: [{ isSignal: true, alias: "showZoomControls", required: false }] }], minZoom: [{ type: i0.Input, args: [{ isSignal: true, alias: "minZoom", required: false }] }], maxZoom: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxZoom", required: false }] }], zoomOnClick: [{ type: i0.Input, args: [{ isSignal: true, alias: "zoomOnClick", required: false }] }], zoomOnClickLevel: [{ type: i0.Input, args: [{ isSignal: true, alias: "zoomOnClickLevel", required: false }] }], zoomAnimationDuration: [{ type: i0.Input, args: [{ isSignal: true, alias: "zoomAnimationDuration", required: false }] }], showTooltip: [{ type: i0.Input, args: [{ isSignal: true, alias: "showTooltip", required: false }] }], tooltipConfig: [{ type: i0.Input, args: [{ isSignal: true, alias: "tooltipConfig", required: false }] }], showLabels: [{ type: i0.Input, args: [{ isSignal: true, alias: "showLabels", required: false }] }], labelMinZoom: [{ type: i0.Input, args: [{ isSignal: true, alias: "labelMinZoom", required: false }] }], labelFontSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "labelFontSize", required: false }] }], labelColor: [{ type: i0.Input, args: [{ isSignal: true, alias: "labelColor", required: false }] }], labelFontWeight: [{ type: i0.Input, args: [{ isSignal: true, alias: "labelFontWeight", required: false }] }], countryClick: [{ type: i0.Output, args: ["countryClick"] }], countryHover: [{ type: i0.Output, args: ["countryHover"] }], countryLeave: [{ type: i0.Output, args: ["countryLeave"] }], markerClick: [{ type: i0.Output, args: ["markerClick"] }], lineClick: [{ type: i0.Output, args: ["lineClick"] }] } });

// Angular dependency injection token for sharing map data between components
// Uses Angular signals so components update when the map changes
const MAP_CONTEXT = new InjectionToken('MAP_CONTEXT', {
    providedIn: null,
    factory: () => {
        throw new Error('MAP_CONTEXT token must be provided by ComposableMapComponent. ' +
            'Ensure this component is wrapped in an asm-composable-map component.');
    }
});

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
class ComposableMapComponent {
    projectionService = inject(ProjectionService);
    constructor() {
        // Component initialized
    }
    /**
     * Map width in pixels
     */
    width = input(800, ...(ngDevMode ? [{ debugName: "width" }] : []));
    /**
     * Map height in pixels
     */
    height = input(400, ...(ngDevMode ? [{ debugName: "height" }] : []));
    /**
     * Maximum width in pixels (optional, for constraining responsive size)
     */
    maxWidth = input(null, ...(ngDevMode ? [{ debugName: "maxWidth" }] : []));
    /**
     * Projection type (default: geoEqualEarth)
     */
    projection = input('geoEqualEarth', ...(ngDevMode ? [{ debugName: "projection" }] : []));
    /**
     * Projection configuration options
     */
    projectionConfig = input({}, ...(ngDevMode ? [{ debugName: "projectionConfig" }] : []));
    /**
     * Map context signal - recomputes when inputs change
     */
    mapContext = computed(() => {
        const proj = this.projectionService.createProjection(this.projection(), this.projectionConfig(), this.width(), this.height());
        return {
            projection: proj,
            path: geoPath().projection(proj),
            width: this.width(),
            height: this.height()
        };
    }, ...(ngDevMode ? [{ debugName: "mapContext" }] : []));
    /**
     * SVG viewBox attribute
     */
    viewBox = computed(() => `0 0 ${this.width()} ${this.height()}`, ...(ngDevMode ? [{ debugName: "viewBox" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: ComposableMapComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "21.0.8", type: ComposableMapComponent, isStandalone: true, selector: "asm-composable-map", inputs: { width: { classPropertyName: "width", publicName: "width", isSignal: true, isRequired: false, transformFunction: null }, height: { classPropertyName: "height", publicName: "height", isSignal: true, isRequired: false, transformFunction: null }, maxWidth: { classPropertyName: "maxWidth", publicName: "maxWidth", isSignal: true, isRequired: false, transformFunction: null }, projection: { classPropertyName: "projection", publicName: "projection", isSignal: true, isRequired: false, transformFunction: null }, projectionConfig: { classPropertyName: "projectionConfig", publicName: "projectionConfig", isSignal: true, isRequired: false, transformFunction: null } }, providers: [
            {
                provide: MAP_CONTEXT,
                useFactory: () => {
                    const component = inject(ComposableMapComponent);
                    return component.mapContext;
                }
            }
        ], ngImport: i0, template: `
    <svg
      [attr.viewBox]="viewBox()"
      [style.max-width]="maxWidth() ? maxWidth() + 'px' : '100%'"
      class="asm-map">
      <ng-content></ng-content>
    </svg>
  `, isInline: true, styles: [":host{display:block;width:100%}.asm-map{width:100%;height:auto;display:block;margin:auto}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: ComposableMapComponent, decorators: [{
            type: Component,
            args: [{ selector: 'asm-composable-map', standalone: true, template: `
    <svg
      [attr.viewBox]="viewBox()"
      [style.max-width]="maxWidth() ? maxWidth() + 'px' : '100%'"
      class="asm-map">
      <ng-content></ng-content>
    </svg>
  `, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, providers: [
                        {
                            provide: MAP_CONTEXT,
                            useFactory: () => {
                                const component = inject(ComposableMapComponent);
                                return component.mapContext;
                            }
                        }
                    ], styles: [":host{display:block;width:100%}.asm-map{width:100%;height:auto;display:block;margin:auto}\n"] }]
        }], ctorParameters: () => [], propDecorators: { width: [{ type: i0.Input, args: [{ isSignal: true, alias: "width", required: false }] }], height: [{ type: i0.Input, args: [{ isSignal: true, alias: "height", required: false }] }], maxWidth: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxWidth", required: false }] }], projection: [{ type: i0.Input, args: [{ isSignal: true, alias: "projection", required: false }] }], projectionConfig: [{ type: i0.Input, args: [{ isSignal: true, alias: "projectionConfig", required: false }] }] } });

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
class TooltipComponent {
    /**
     * Whether the tooltip is visible
     */
    visible = input(false, ...(ngDevMode ? [{ debugName: "visible" }] : []));
    /**
     * X position (in pixels from viewport left)
     */
    x = input(0, ...(ngDevMode ? [{ debugName: "x" }] : []));
    /**
     * Y position (in pixels from viewport top)
     */
    y = input(0, ...(ngDevMode ? [{ debugName: "y" }] : []));
    /**
     * Tooltip data to display
     */
    data = input(null, ...(ngDevMode ? [{ debugName: "data" }] : []));
    /**
     * Offset from cursor (x direction)
     */
    offsetX = input(10, ...(ngDevMode ? [{ debugName: "offsetX" }] : []));
    /**
     * Offset from cursor (y direction)
     */
    offsetY = input(10, ...(ngDevMode ? [{ debugName: "offsetY" }] : []));
    /**
     * Keys to exclude from display
     */
    excludeKeys = input(['name'], ...(ngDevMode ? [{ debugName: "excludeKeys" }] : []));
    /**
     * Custom key labels mapping
     */
    keyLabels = input({}, ...(ngDevMode ? [{ debugName: "keyLabels" }] : []));
    /**
     * Background color
     */
    backgroundColor = input('#ffffff', ...(ngDevMode ? [{ debugName: "backgroundColor" }] : []));
    /**
     * Text color
     */
    textColor = input('#333333', ...(ngDevMode ? [{ debugName: "textColor" }] : []));
    /**
     * Title text color (defaults to textColor if not set)
     */
    titleColor = input(null, ...(ngDevMode ? [{ debugName: "titleColor" }] : []));
    /**
     * Label text color (defaults to textColor with opacity if not set)
     */
    labelColor = input(null, ...(ngDevMode ? [{ debugName: "labelColor" }] : []));
    /**
     * Border color
     */
    borderColor = input('#cccccc', ...(ngDevMode ? [{ debugName: "borderColor" }] : []));
    /**
     * Border radius in pixels
     */
    borderRadius = input(4, ...(ngDevMode ? [{ debugName: "borderRadius" }] : []));
    /**
     * Font size in pixels
     */
    fontSize = input(13, ...(ngDevMode ? [{ debugName: "fontSize" }] : []));
    /**
     * Padding in pixels
     */
    padding = input(12, ...(ngDevMode ? [{ debugName: "padding" }] : []));
    /**
     * Box shadow
     */
    boxShadow = input('0 2px 8px rgba(0, 0, 0, 0.15)', ...(ngDevMode ? [{ debugName: "boxShadow" }] : []));
    /**
     * Computed tooltip container styles
     */
    tooltipStyles = computed(() => ({
        left: `${this.x() + this.offsetX()}px`,
        top: `${this.y() + this.offsetY()}px`,
        backgroundColor: this.backgroundColor(),
        color: this.textColor(),
        border: `1px solid ${this.borderColor()}`,
        borderRadius: `${this.borderRadius()}px`,
        fontSize: `${this.fontSize()}px`,
        padding: `${this.padding()}px`,
        boxShadow: this.boxShadow()
    }), ...(ngDevMode ? [{ debugName: "tooltipStyles" }] : []));
    /**
     * Computed title styles
     */
    titleStyles = computed(() => ({
        color: this.titleColor() || this.textColor(),
        borderBottomColor: this.borderColor()
    }), ...(ngDevMode ? [{ debugName: "titleStyles" }] : []));
    /**
     * Computed label styles
     */
    labelStyles = computed(() => ({
        color: this.labelColor() || undefined
    }), ...(ngDevMode ? [{ debugName: "labelStyles" }] : []));
    /**
     * Computed display items from data
     */
    displayItems = computed(() => {
        const currentData = this.data();
        if (!currentData)
            return [];
        const excluded = new Set(this.excludeKeys());
        const labels = this.keyLabels();
        return Object.entries(currentData)
            .filter(([key, value]) => !excluded.has(key) && value !== null && value !== undefined)
            .map(([key, value]) => ({
            key,
            label: labels[key] || this.formatKey(key),
            value: this.formatValue(value)
        }));
    }, ...(ngDevMode ? [{ debugName: "displayItems" }] : []));
    formatKey(key) {
        return key
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }
    formatValue(value) {
        if (typeof value === 'number') {
            return value.toLocaleString();
        }
        return String(value);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: TooltipComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.0.8", type: TooltipComponent, isStandalone: true, selector: "asm-tooltip", inputs: { visible: { classPropertyName: "visible", publicName: "visible", isSignal: true, isRequired: false, transformFunction: null }, x: { classPropertyName: "x", publicName: "x", isSignal: true, isRequired: false, transformFunction: null }, y: { classPropertyName: "y", publicName: "y", isSignal: true, isRequired: false, transformFunction: null }, data: { classPropertyName: "data", publicName: "data", isSignal: true, isRequired: false, transformFunction: null }, offsetX: { classPropertyName: "offsetX", publicName: "offsetX", isSignal: true, isRequired: false, transformFunction: null }, offsetY: { classPropertyName: "offsetY", publicName: "offsetY", isSignal: true, isRequired: false, transformFunction: null }, excludeKeys: { classPropertyName: "excludeKeys", publicName: "excludeKeys", isSignal: true, isRequired: false, transformFunction: null }, keyLabels: { classPropertyName: "keyLabels", publicName: "keyLabels", isSignal: true, isRequired: false, transformFunction: null }, backgroundColor: { classPropertyName: "backgroundColor", publicName: "backgroundColor", isSignal: true, isRequired: false, transformFunction: null }, textColor: { classPropertyName: "textColor", publicName: "textColor", isSignal: true, isRequired: false, transformFunction: null }, titleColor: { classPropertyName: "titleColor", publicName: "titleColor", isSignal: true, isRequired: false, transformFunction: null }, labelColor: { classPropertyName: "labelColor", publicName: "labelColor", isSignal: true, isRequired: false, transformFunction: null }, borderColor: { classPropertyName: "borderColor", publicName: "borderColor", isSignal: true, isRequired: false, transformFunction: null }, borderRadius: { classPropertyName: "borderRadius", publicName: "borderRadius", isSignal: true, isRequired: false, transformFunction: null }, fontSize: { classPropertyName: "fontSize", publicName: "fontSize", isSignal: true, isRequired: false, transformFunction: null }, padding: { classPropertyName: "padding", publicName: "padding", isSignal: true, isRequired: false, transformFunction: null }, boxShadow: { classPropertyName: "boxShadow", publicName: "boxShadow", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0, template: `
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
  `, isInline: true, styles: [".asm-tooltip{position:fixed;pointer-events:none;z-index:1000;max-width:250px}.asm-tooltip-title{font-weight:600;margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid}.asm-tooltip-row{display:flex;justify-content:space-between;gap:12px;padding:2px 0}.asm-tooltip-label{opacity:.8}.asm-tooltip-value{font-weight:500}\n"], dependencies: [{ kind: "directive", type: NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: TooltipComponent, decorators: [{
            type: Component,
            args: [{ selector: 'asm-tooltip', standalone: true, imports: [NgStyle], changeDetection: ChangeDetectionStrategy.OnPush, template: `
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
  `, styles: [".asm-tooltip{position:fixed;pointer-events:none;z-index:1000;max-width:250px}.asm-tooltip-title{font-weight:600;margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid}.asm-tooltip-row{display:flex;justify-content:space-between;gap:12px;padding:2px 0}.asm-tooltip-label{opacity:.8}.asm-tooltip-value{font-weight:500}\n"] }]
        }], propDecorators: { visible: [{ type: i0.Input, args: [{ isSignal: true, alias: "visible", required: false }] }], x: [{ type: i0.Input, args: [{ isSignal: true, alias: "x", required: false }] }], y: [{ type: i0.Input, args: [{ isSignal: true, alias: "y", required: false }] }], data: [{ type: i0.Input, args: [{ isSignal: true, alias: "data", required: false }] }], offsetX: [{ type: i0.Input, args: [{ isSignal: true, alias: "offsetX", required: false }] }], offsetY: [{ type: i0.Input, args: [{ isSignal: true, alias: "offsetY", required: false }] }], excludeKeys: [{ type: i0.Input, args: [{ isSignal: true, alias: "excludeKeys", required: false }] }], keyLabels: [{ type: i0.Input, args: [{ isSignal: true, alias: "keyLabels", required: false }] }], backgroundColor: [{ type: i0.Input, args: [{ isSignal: true, alias: "backgroundColor", required: false }] }], textColor: [{ type: i0.Input, args: [{ isSignal: true, alias: "textColor", required: false }] }], titleColor: [{ type: i0.Input, args: [{ isSignal: true, alias: "titleColor", required: false }] }], labelColor: [{ type: i0.Input, args: [{ isSignal: true, alias: "labelColor", required: false }] }], borderColor: [{ type: i0.Input, args: [{ isSignal: true, alias: "borderColor", required: false }] }], borderRadius: [{ type: i0.Input, args: [{ isSignal: true, alias: "borderRadius", required: false }] }], fontSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "fontSize", required: false }] }], padding: [{ type: i0.Input, args: [{ isSignal: true, alias: "padding", required: false }] }], boxShadow: [{ type: i0.Input, args: [{ isSignal: true, alias: "boxShadow", required: false }] }] } });

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
class ZoomableGroupDirective {
    elementRef = inject(ElementRef);
    renderer = inject(Renderer2);
    mapContext = inject(MAP_CONTEXT);
    isDragging = false;
    dragStartX = 0;
    dragStartY = 0;
    lastTranslateX = 0;
    lastTranslateY = 0;
    // Bound event handlers for cleanup
    boundHandleWheel;
    boundHandleMouseDown;
    boundHandleMouseMove;
    boundHandleMouseUp;
    boundHandleTouchStart;
    boundHandleTouchMove;
    boundHandleTouchEnd;
    /**
     * Minimum zoom level
     */
    minZoom = input(1, ...(ngDevMode ? [{ debugName: "minZoom" }] : []));
    /**
     * Maximum zoom level
     */
    maxZoom = input(8, ...(ngDevMode ? [{ debugName: "maxZoom" }] : []));
    /**
     * Initial zoom level
     */
    initialZoom = input(1, ...(ngDevMode ? [{ debugName: "initialZoom" }] : []));
    /**
     * Initial center coordinates [x, y] in pixels (relative to map center)
     */
    center = input([0, 0], ...(ngDevMode ? [{ debugName: "center" }] : []));
    /**
     * Zoom sensitivity for mouse wheel (higher = faster zoom)
     */
    zoomSensitivity = input(0.001, ...(ngDevMode ? [{ debugName: "zoomSensitivity" }] : []));
    /**
     * Whether zoom on scroll is enabled
     */
    enableWheelZoom = input(true, ...(ngDevMode ? [{ debugName: "enableWheelZoom" }] : []));
    /**
     * Whether pan on drag is enabled
     */
    enablePan = input(true, ...(ngDevMode ? [{ debugName: "enablePan" }] : []));
    /**
     * Whether to enable touch gestures
     */
    enableTouch = input(true, ...(ngDevMode ? [{ debugName: "enableTouch" }] : []));
    /**
     * Emits when zoom or pan changes
     */
    zoomChange = output();
    /**
     * Emits when zoom starts (mouse down or touch start)
     */
    zoomStart = output();
    /**
     * Emits when zoom ends (mouse up or touch end)
     */
    zoomEnd = output();
    // Internal zoom state
    _scale = signal(1, ...(ngDevMode ? [{ debugName: "_scale" }] : []));
    _translateX = signal(0, ...(ngDevMode ? [{ debugName: "_translateX" }] : []));
    _translateY = signal(0, ...(ngDevMode ? [{ debugName: "_translateY" }] : []));
    /**
     * Current zoom scale (read-only)
     */
    scale = this._scale.asReadonly();
    /**
     * Current X translation (read-only)
     */
    translateX = this._translateX.asReadonly();
    /**
     * Current Y translation (read-only)
     */
    translateY = this._translateY.asReadonly();
    /**
     * Computed SVG transform string
     */
    transform = computed(() => {
        const ctx = this.mapContext();
        const centerX = ctx.width / 2;
        const centerY = ctx.height / 2;
        const s = this._scale();
        const tx = this._translateX();
        const ty = this._translateY();
        return `translate(${centerX + tx}, ${centerY + ty}) scale(${s}) translate(${-centerX}, ${-centerY})`;
    }, ...(ngDevMode ? [{ debugName: "transform" }] : []));
    constructor() {
        // Bind event handlers
        this.boundHandleWheel = this.handleWheel.bind(this);
        this.boundHandleMouseDown = this.handleMouseDown.bind(this);
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);
        this.boundHandleTouchStart = this.handleTouchStart.bind(this);
        this.boundHandleTouchMove = this.handleTouchMove.bind(this);
        this.boundHandleTouchEnd = this.handleTouchEnd.bind(this);
    }
    ngAfterViewInit() {
        // Set initial zoom
        this._scale.set(this.initialZoom());
        // Set initial center offset
        const [cx, cy] = this.center();
        this._translateX.set(cx);
        this._translateY.set(cy);
        // Apply initial transform
        this.updateTransform();
        // Set cursor style
        this.renderer.setStyle(this.elementRef.nativeElement, 'cursor', 'grab');
        // Get the SVG element (parent of our g element)
        const svg = this.getSvgElement();
        if (!svg)
            return;
        // Add event listeners
        if (this.enableWheelZoom()) {
            svg.addEventListener('wheel', this.boundHandleWheel, { passive: false });
        }
        if (this.enablePan()) {
            svg.addEventListener('mousedown', this.boundHandleMouseDown);
            window.addEventListener('mousemove', this.boundHandleMouseMove);
            window.addEventListener('mouseup', this.boundHandleMouseUp);
        }
        if (this.enableTouch()) {
            svg.addEventListener('touchstart', this.boundHandleTouchStart, { passive: false });
            window.addEventListener('touchmove', this.boundHandleTouchMove, { passive: false });
            window.addEventListener('touchend', this.boundHandleTouchEnd);
        }
    }
    ngOnDestroy() {
        const svg = this.getSvgElement();
        if (!svg)
            return;
        svg.removeEventListener('wheel', this.boundHandleWheel);
        svg.removeEventListener('mousedown', this.boundHandleMouseDown);
        window.removeEventListener('mousemove', this.boundHandleMouseMove);
        window.removeEventListener('mouseup', this.boundHandleMouseUp);
        svg.removeEventListener('touchstart', this.boundHandleTouchStart);
        window.removeEventListener('touchmove', this.boundHandleTouchMove);
        window.removeEventListener('touchend', this.boundHandleTouchEnd);
    }
    /**
     * Programmatically zoom in by a step
     */
    zoomIn(step = 1.5) {
        const newScale = Math.min(this._scale() * step, this.maxZoom());
        this._scale.set(newScale);
        this.updateTransform();
        this.emitZoomChange();
    }
    /**
     * Programmatically zoom out by a step
     */
    zoomOut(step = 1.5) {
        const newScale = Math.max(this._scale() / step, this.minZoom());
        this._scale.set(newScale);
        this.updateTransform();
        this.emitZoomChange();
    }
    /**
     * Reset zoom to initial state
     */
    resetZoom() {
        this._scale.set(this.initialZoom());
        const [cx, cy] = this.center();
        this._translateX.set(cx);
        this._translateY.set(cy);
        this.updateTransform();
        this.emitZoomChange();
    }
    /**
     * Set zoom to a specific level
     */
    setZoom(scale, translateX, translateY) {
        this._scale.set(Math.max(this.minZoom(), Math.min(scale, this.maxZoom())));
        if (translateX !== undefined) {
            this._translateX.set(translateX);
        }
        if (translateY !== undefined) {
            this._translateY.set(translateY);
        }
        this.updateTransform();
        this.emitZoomChange();
    }
    updateTransform() {
        const transformValue = this.transform();
        this.renderer.setAttribute(this.elementRef.nativeElement, 'transform', transformValue);
    }
    getSvgElement() {
        let element = this.elementRef.nativeElement;
        while (element && element.tagName !== 'svg') {
            element = element.parentElement;
        }
        return element;
    }
    handleWheel(event) {
        if (!this.enableWheelZoom())
            return;
        event.preventDefault();
        const sensitivity = this.zoomSensitivity();
        const delta = -event.deltaY * sensitivity;
        const scaleFactor = 1 + delta;
        const currentScale = this._scale();
        let newScale = currentScale * scaleFactor;
        newScale = Math.max(this.minZoom(), Math.min(newScale, this.maxZoom()));
        if (newScale !== currentScale) {
            // Zoom toward mouse position
            const svg = this.getSvgElement();
            if (svg) {
                const rect = svg.getBoundingClientRect();
                const ctx = this.mapContext();
                // Mouse position relative to SVG center
                const mouseX = event.clientX - rect.left - rect.width / 2;
                const mouseY = event.clientY - rect.top - rect.height / 2;
                // Adjust translation to zoom toward mouse
                const scaleRatio = newScale / currentScale;
                const tx = this._translateX();
                const ty = this._translateY();
                // Scale the SVG dimensions to get proper ratios
                const svgScaleX = rect.width / ctx.width;
                const svgScaleY = rect.height / ctx.height;
                this._translateX.set(tx - (mouseX / svgScaleX - tx) * (scaleRatio - 1));
                this._translateY.set(ty - (mouseY / svgScaleY - ty) * (scaleRatio - 1));
            }
            this._scale.set(newScale);
            this.updateTransform();
            this.emitZoomChange(event);
        }
    }
    handleMouseDown(event) {
        if (!this.enablePan() || event.button !== 0)
            return;
        this.isDragging = true;
        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;
        this.lastTranslateX = this._translateX();
        this.lastTranslateY = this._translateY();
        this.renderer.setStyle(this.elementRef.nativeElement, 'cursor', 'grabbing');
        this.emitZoomStart(event);
    }
    handleMouseMove(event) {
        if (!this.isDragging)
            return;
        const svg = this.getSvgElement();
        if (!svg)
            return;
        const rect = svg.getBoundingClientRect();
        const ctx = this.mapContext();
        // Calculate delta in SVG coordinate space
        const svgScaleX = rect.width / ctx.width;
        const svgScaleY = rect.height / ctx.height;
        const deltaX = (event.clientX - this.dragStartX) / svgScaleX;
        const deltaY = (event.clientY - this.dragStartY) / svgScaleY;
        this._translateX.set(this.lastTranslateX + deltaX);
        this._translateY.set(this.lastTranslateY + deltaY);
        this.updateTransform();
        this.emitZoomChange(event);
    }
    handleMouseUp(event) {
        if (this.isDragging) {
            this.isDragging = false;
            this.renderer.setStyle(this.elementRef.nativeElement, 'cursor', 'grab');
            this.emitZoomEnd(event);
        }
    }
    // Touch handling for pinch zoom
    lastTouchDistance = 0;
    lastTouchCenter = { x: 0, y: 0 };
    handleTouchStart(event) {
        if (!this.enableTouch())
            return;
        if (event.touches.length === 1) {
            // Single touch - pan
            event.preventDefault();
            this.isDragging = true;
            this.dragStartX = event.touches[0].clientX;
            this.dragStartY = event.touches[0].clientY;
            this.lastTranslateX = this._translateX();
            this.lastTranslateY = this._translateY();
            this.emitZoomStart(event);
        }
        else if (event.touches.length === 2) {
            // Two touches - pinch zoom
            event.preventDefault();
            this.lastTouchDistance = this.getTouchDistance(event.touches);
            this.lastTouchCenter = this.getTouchCenter(event.touches);
        }
    }
    handleTouchMove(event) {
        if (!this.enableTouch())
            return;
        if (event.touches.length === 1 && this.isDragging) {
            event.preventDefault();
            const svg = this.getSvgElement();
            if (!svg)
                return;
            const rect = svg.getBoundingClientRect();
            const ctx = this.mapContext();
            const svgScaleX = rect.width / ctx.width;
            const svgScaleY = rect.height / ctx.height;
            const deltaX = (event.touches[0].clientX - this.dragStartX) / svgScaleX;
            const deltaY = (event.touches[0].clientY - this.dragStartY) / svgScaleY;
            this._translateX.set(this.lastTranslateX + deltaX);
            this._translateY.set(this.lastTranslateY + deltaY);
            this.updateTransform();
            this.emitZoomChange(event);
        }
        else if (event.touches.length === 2) {
            event.preventDefault();
            const distance = this.getTouchDistance(event.touches);
            const scaleFactor = distance / this.lastTouchDistance;
            const currentScale = this._scale();
            let newScale = currentScale * scaleFactor;
            newScale = Math.max(this.minZoom(), Math.min(newScale, this.maxZoom()));
            this._scale.set(newScale);
            this.lastTouchDistance = distance;
            this.updateTransform();
            this.emitZoomChange(event);
        }
    }
    handleTouchEnd(event) {
        if (this.isDragging && event.touches.length === 0) {
            this.isDragging = false;
            this.emitZoomEnd(event);
        }
    }
    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    getTouchCenter(touches) {
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
        };
    }
    emitZoomChange(sourceEvent) {
        this.zoomChange.emit({
            scale: this._scale(),
            translateX: this._translateX(),
            translateY: this._translateY(),
            sourceEvent
        });
    }
    emitZoomStart(sourceEvent) {
        this.zoomStart.emit({
            scale: this._scale(),
            translateX: this._translateX(),
            translateY: this._translateY(),
            sourceEvent
        });
    }
    emitZoomEnd(sourceEvent) {
        this.zoomEnd.emit({
            scale: this._scale(),
            translateX: this._translateX(),
            translateY: this._translateY(),
            sourceEvent
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: ZoomableGroupDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "21.0.8", type: ZoomableGroupDirective, isStandalone: true, selector: "[asmZoomableGroup]", inputs: { minZoom: { classPropertyName: "minZoom", publicName: "minZoom", isSignal: true, isRequired: false, transformFunction: null }, maxZoom: { classPropertyName: "maxZoom", publicName: "maxZoom", isSignal: true, isRequired: false, transformFunction: null }, initialZoom: { classPropertyName: "initialZoom", publicName: "initialZoom", isSignal: true, isRequired: false, transformFunction: null }, center: { classPropertyName: "center", publicName: "center", isSignal: true, isRequired: false, transformFunction: null }, zoomSensitivity: { classPropertyName: "zoomSensitivity", publicName: "zoomSensitivity", isSignal: true, isRequired: false, transformFunction: null }, enableWheelZoom: { classPropertyName: "enableWheelZoom", publicName: "enableWheelZoom", isSignal: true, isRequired: false, transformFunction: null }, enablePan: { classPropertyName: "enablePan", publicName: "enablePan", isSignal: true, isRequired: false, transformFunction: null }, enableTouch: { classPropertyName: "enableTouch", publicName: "enableTouch", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { zoomChange: "zoomChange", zoomStart: "zoomStart", zoomEnd: "zoomEnd" }, exportAs: ["asmZoomableGroup"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: ZoomableGroupDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[asmZoomableGroup]',
                    exportAs: 'asmZoomableGroup',
                    standalone: true
                }]
        }], ctorParameters: () => [], propDecorators: { minZoom: [{ type: i0.Input, args: [{ isSignal: true, alias: "minZoom", required: false }] }], maxZoom: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxZoom", required: false }] }], initialZoom: [{ type: i0.Input, args: [{ isSignal: true, alias: "initialZoom", required: false }] }], center: [{ type: i0.Input, args: [{ isSignal: true, alias: "center", required: false }] }], zoomSensitivity: [{ type: i0.Input, args: [{ isSignal: true, alias: "zoomSensitivity", required: false }] }], enableWheelZoom: [{ type: i0.Input, args: [{ isSignal: true, alias: "enableWheelZoom", required: false }] }], enablePan: [{ type: i0.Input, args: [{ isSignal: true, alias: "enablePan", required: false }] }], enableTouch: [{ type: i0.Input, args: [{ isSignal: true, alias: "enableTouch", required: false }] }], zoomChange: [{ type: i0.Output, args: ["zoomChange"] }], zoomStart: [{ type: i0.Output, args: ["zoomStart"] }], zoomEnd: [{ type: i0.Output, args: ["zoomEnd"] }] } });

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
class ZoomControlsComponent {
    /**
     * Position from top edge
     */
    top = input('10px', ...(ngDevMode ? [{ debugName: "top" }] : []));
    /**
     * Position from right edge
     */
    right = input('10px', ...(ngDevMode ? [{ debugName: "right" }] : []));
    /**
     * Position from bottom edge (overrides top if set)
     */
    bottom = input(null, ...(ngDevMode ? [{ debugName: "bottom" }] : []));
    /**
     * Position from left edge (overrides right if set)
     */
    left = input(null, ...(ngDevMode ? [{ debugName: "left" }] : []));
    /**
     * Button size in pixels
     */
    buttonSize = input(32, ...(ngDevMode ? [{ debugName: "buttonSize" }] : []));
    /**
     * Button background color
     */
    backgroundColor = input('#ffffff', ...(ngDevMode ? [{ debugName: "backgroundColor" }] : []));
    /**
     * Button text/icon color
     */
    color = input('#333333', ...(ngDevMode ? [{ debugName: "color" }] : []));
    /**
     * Button border radius
     */
    borderRadius = input(4, ...(ngDevMode ? [{ debugName: "borderRadius" }] : []));
    /**
     * Box shadow
     */
    boxShadow = input('0 2px 4px rgba(0,0,0,0.2)', ...(ngDevMode ? [{ debugName: "boxShadow" }] : []));
    /**
     * Whether to show the reset button
     */
    showReset = input(true, ...(ngDevMode ? [{ debugName: "showReset" }] : []));
    /**
     * Emitted when zoom in is clicked
     */
    zoomIn = output();
    /**
     * Emitted when zoom out is clicked
     */
    zoomOut = output();
    /**
     * Emitted when reset is clicked
     */
    reset = output();
    /**
     * Computed container styles
     */
    containerStyles = () => ({
        position: 'absolute',
        top: this.bottom() ? 'auto' : this.top(),
        right: this.left() ? 'auto' : this.right(),
        bottom: this.bottom() || 'auto',
        left: this.left() || 'auto',
        zIndex: '10'
    });
    /**
     * Computed button styles
     */
    buttonStyles = () => ({
        width: `${this.buttonSize()}px`,
        height: `${this.buttonSize()}px`,
        backgroundColor: this.backgroundColor(),
        color: this.color(),
        borderRadius: `${this.borderRadius()}px`,
        boxShadow: this.boxShadow()
    });
    onZoomIn() {
        this.zoomIn.emit();
    }
    onZoomOut() {
        this.zoomOut.emit();
    }
    onReset() {
        this.reset.emit();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: ZoomControlsComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.0.8", type: ZoomControlsComponent, isStandalone: true, selector: "asm-zoom-controls", inputs: { top: { classPropertyName: "top", publicName: "top", isSignal: true, isRequired: false, transformFunction: null }, right: { classPropertyName: "right", publicName: "right", isSignal: true, isRequired: false, transformFunction: null }, bottom: { classPropertyName: "bottom", publicName: "bottom", isSignal: true, isRequired: false, transformFunction: null }, left: { classPropertyName: "left", publicName: "left", isSignal: true, isRequired: false, transformFunction: null }, buttonSize: { classPropertyName: "buttonSize", publicName: "buttonSize", isSignal: true, isRequired: false, transformFunction: null }, backgroundColor: { classPropertyName: "backgroundColor", publicName: "backgroundColor", isSignal: true, isRequired: false, transformFunction: null }, color: { classPropertyName: "color", publicName: "color", isSignal: true, isRequired: false, transformFunction: null }, borderRadius: { classPropertyName: "borderRadius", publicName: "borderRadius", isSignal: true, isRequired: false, transformFunction: null }, boxShadow: { classPropertyName: "boxShadow", publicName: "boxShadow", isSignal: true, isRequired: false, transformFunction: null }, showReset: { classPropertyName: "showReset", publicName: "showReset", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { zoomIn: "zoomIn", zoomOut: "zoomOut", reset: "reset" }, ngImport: i0, template: `
    <div class="asm-zoom-controls" [ngStyle]="containerStyles()">
      <button
        class="asm-zoom-btn"
        [ngStyle]="buttonStyles()"
        (click)="onZoomIn()"
        title="Zoom in"
        aria-label="Zoom in">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </button>
      <button
        class="asm-zoom-btn"
        [ngStyle]="buttonStyles()"
        (click)="onZoomOut()"
        title="Zoom out"
        aria-label="Zoom out">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3 8h10" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </button>
      @if (showReset()) {
        <button
          class="asm-zoom-btn"
          [ngStyle]="buttonStyles()"
          (click)="onReset()"
          title="Reset zoom"
          aria-label="Reset zoom">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l2 2M10 10l2 2M4 12l2-2M10 4l2 2" stroke="currentColor" stroke-width="1.5" fill="none"/>
          </svg>
        </button>
      }
    </div>
  `, isInline: true, styles: [".asm-zoom-controls{display:flex;flex-direction:column;gap:4px}.asm-zoom-btn{display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;transition:background-color .2s,transform .1s}.asm-zoom-btn:hover{filter:brightness(.95)}.asm-zoom-btn:active{transform:scale(.95)}.asm-zoom-btn:focus{outline:2px solid #4A90E2;outline-offset:2px}\n"], dependencies: [{ kind: "directive", type: NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: ZoomControlsComponent, decorators: [{
            type: Component,
            args: [{ selector: 'asm-zoom-controls', standalone: true, imports: [NgStyle], template: `
    <div class="asm-zoom-controls" [ngStyle]="containerStyles()">
      <button
        class="asm-zoom-btn"
        [ngStyle]="buttonStyles()"
        (click)="onZoomIn()"
        title="Zoom in"
        aria-label="Zoom in">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </button>
      <button
        class="asm-zoom-btn"
        [ngStyle]="buttonStyles()"
        (click)="onZoomOut()"
        title="Zoom out"
        aria-label="Zoom out">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3 8h10" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </button>
      @if (showReset()) {
        <button
          class="asm-zoom-btn"
          [ngStyle]="buttonStyles()"
          (click)="onReset()"
          title="Reset zoom"
          aria-label="Reset zoom">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l2 2M10 10l2 2M4 12l2-2M10 4l2 2" stroke="currentColor" stroke-width="1.5" fill="none"/>
          </svg>
        </button>
      }
    </div>
  `, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, styles: [".asm-zoom-controls{display:flex;flex-direction:column;gap:4px}.asm-zoom-btn{display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;transition:background-color .2s,transform .1s}.asm-zoom-btn:hover{filter:brightness(.95)}.asm-zoom-btn:active{transform:scale(.95)}.asm-zoom-btn:focus{outline:2px solid #4A90E2;outline-offset:2px}\n"] }]
        }], propDecorators: { top: [{ type: i0.Input, args: [{ isSignal: true, alias: "top", required: false }] }], right: [{ type: i0.Input, args: [{ isSignal: true, alias: "right", required: false }] }], bottom: [{ type: i0.Input, args: [{ isSignal: true, alias: "bottom", required: false }] }], left: [{ type: i0.Input, args: [{ isSignal: true, alias: "left", required: false }] }], buttonSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "buttonSize", required: false }] }], backgroundColor: [{ type: i0.Input, args: [{ isSignal: true, alias: "backgroundColor", required: false }] }], color: [{ type: i0.Input, args: [{ isSignal: true, alias: "color", required: false }] }], borderRadius: [{ type: i0.Input, args: [{ isSignal: true, alias: "borderRadius", required: false }] }], boxShadow: [{ type: i0.Input, args: [{ isSignal: true, alias: "boxShadow", required: false }] }], showReset: [{ type: i0.Input, args: [{ isSignal: true, alias: "showReset", required: false }] }], zoomIn: [{ type: i0.Output, args: ["zoomIn"] }], zoomOut: [{ type: i0.Output, args: ["zoomOut"] }], reset: [{ type: i0.Output, args: ["reset"] }] } });

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
class GeographiesDirective {
    geographyLoader = inject(GeographyLoaderService);
    mapContext = inject(MAP_CONTEXT);
    elementRef = inject(ElementRef);
    renderer = inject(Renderer2);
    /**
     * Geography data (URL string, TopoJSON, or GeoJSON)
     */
    geography = input.required({ ...(ngDevMode ? { debugName: "geography" } : {}), alias: 'asmGeographies' });
    /**
     * Optional custom parsing function
     */
    parseGeographies = input(...(ngDevMode ? [undefined, { debugName: "parseGeographies" }] : []));
    /**
     * Filter by continent(s) - can be a single continent or array of continents
     * Supported: 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Antarctica'
     */
    continents = input(null, ...(ngDevMode ? [{ debugName: "continents" }] : []));
    /**
     * Default fill color for all geographies
     */
    fill = input('#ECECEC', ...(ngDevMode ? [{ debugName: "fill" }] : []));
    /**
     * Default stroke color for all geographies
     */
    stroke = input('#D6D6D6', ...(ngDevMode ? [{ debugName: "stroke" }] : []));
    /**
     * Default stroke width for all geographies
     */
    strokeWidth = input(0.5, ...(ngDevMode ? [{ debugName: "strokeWidth" }] : []));
    /**
     * Hover fill color (optional)
     */
    hoverFill = input(null, ...(ngDevMode ? [{ debugName: "hoverFill" }] : []));
    /**
     * Pressed/active fill color (optional)
     */
    pressedFill = input(null, ...(ngDevMode ? [{ debugName: "pressedFill" }] : []));
    /**
     * Emitted when mouse enters a geography
     */
    geographyHover = output();
    /**
     * Emitted when mouse leaves a geography
     */
    geographyLeave = output();
    /**
     * Emitted when a geography is clicked
     */
    geographyClick = output();
    /**
     * Raw loaded geographies (before filtering)
     */
    rawGeographies = toSignal(toObservable(this.geography).pipe(switchMap(geo => this.geographyLoader.load(geo).pipe(map$1(data => data.features), catchError(err => {
        console.error('Error loading geographies:', err);
        return of([]);
    })))), { initialValue: [] });
    /**
     * Loaded and processed geographies signal (reactive to continents changes)
     */
    geographies = computed(() => {
        const features = this.rawGeographies();
        return this.processGeographies(features);
    }, ...(ngDevMode ? [{ debugName: "geographies" }] : []));
    constructor() {
        // Effect to render paths when geographies load
        effect(() => {
            const geos = this.geographies();
            if (geos.length > 0) {
                this.renderGeographies(geos);
            }
        });
    }
    renderGeographies(geos) {
        const hostElement = this.elementRef.nativeElement;
        const parentElement = this.renderer.parentNode(hostElement);
        const context = this.mapContext();
        // Clear any existing paths we created
        const existingPaths = parentElement.querySelectorAll('path[data-asm-geo]');
        existingPaths.forEach((path) => this.renderer.removeChild(parentElement, path));
        const baseFill = this.fill();
        const hoverFillColor = this.hoverFill();
        const pressedFillColor = this.pressedFill();
        // Create and append path elements directly to parent (SVG)
        geos.forEach(geo => {
            const path = this.renderer.createElement('path', 'svg');
            const pathData = context.path(geo) || '';
            this.renderer.setAttribute(path, 'd', pathData);
            this.renderer.setAttribute(path, 'fill', baseFill);
            this.renderer.setAttribute(path, 'stroke', this.stroke());
            this.renderer.setAttribute(path, 'stroke-width', String(this.strokeWidth()));
            this.renderer.setAttribute(path, 'data-asm-geo', 'true');
            this.renderer.setStyle(path, 'cursor', 'pointer');
            // Add event listeners
            this.renderer.listen(path, 'mouseenter', (event) => {
                if (hoverFillColor) {
                    this.renderer.setAttribute(path, 'fill', hoverFillColor);
                }
                this.geographyHover.emit({ event, geography: geo });
            });
            this.renderer.listen(path, 'mouseleave', (event) => {
                this.renderer.setAttribute(path, 'fill', baseFill);
                this.geographyLeave.emit({ event, geography: geo });
            });
            this.renderer.listen(path, 'mousedown', () => {
                if (pressedFillColor) {
                    this.renderer.setAttribute(path, 'fill', pressedFillColor);
                }
            });
            this.renderer.listen(path, 'mouseup', () => {
                if (hoverFillColor) {
                    this.renderer.setAttribute(path, 'fill', hoverFillColor);
                }
                else {
                    this.renderer.setAttribute(path, 'fill', baseFill);
                }
            });
            this.renderer.listen(path, 'click', (event) => {
                this.geographyClick.emit({ event, geography: geo });
            });
            // Insert after the host element
            const nextSibling = this.renderer.nextSibling(hostElement);
            if (nextSibling) {
                this.renderer.insertBefore(parentElement, path, nextSibling);
            }
            else {
                this.renderer.appendChild(parentElement, path);
            }
        });
    }
    processGeographies(features) {
        let processed = features;
        // Apply continent filtering if specified
        const continentFilter = this.continents();
        if (continentFilter) {
            processed = filterByContinents(processed, continentFilter);
        }
        // Apply custom parsing function if provided
        const parser = this.parseGeographies();
        if (parser) {
            processed = parser(processed);
        }
        return processed;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: GeographiesDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "21.0.8", type: GeographiesDirective, isStandalone: true, selector: "[asmGeographies]", inputs: { geography: { classPropertyName: "geography", publicName: "asmGeographies", isSignal: true, isRequired: true, transformFunction: null }, parseGeographies: { classPropertyName: "parseGeographies", publicName: "parseGeographies", isSignal: true, isRequired: false, transformFunction: null }, continents: { classPropertyName: "continents", publicName: "continents", isSignal: true, isRequired: false, transformFunction: null }, fill: { classPropertyName: "fill", publicName: "fill", isSignal: true, isRequired: false, transformFunction: null }, stroke: { classPropertyName: "stroke", publicName: "stroke", isSignal: true, isRequired: false, transformFunction: null }, strokeWidth: { classPropertyName: "strokeWidth", publicName: "strokeWidth", isSignal: true, isRequired: false, transformFunction: null }, hoverFill: { classPropertyName: "hoverFill", publicName: "hoverFill", isSignal: true, isRequired: false, transformFunction: null }, pressedFill: { classPropertyName: "pressedFill", publicName: "pressedFill", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { geographyHover: "geographyHover", geographyLeave: "geographyLeave", geographyClick: "geographyClick" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: GeographiesDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[asmGeographies]',
                    standalone: true
                }]
        }], ctorParameters: () => [], propDecorators: { geography: [{ type: i0.Input, args: [{ isSignal: true, alias: "asmGeographies", required: true }] }], parseGeographies: [{ type: i0.Input, args: [{ isSignal: true, alias: "parseGeographies", required: false }] }], continents: [{ type: i0.Input, args: [{ isSignal: true, alias: "continents", required: false }] }], fill: [{ type: i0.Input, args: [{ isSignal: true, alias: "fill", required: false }] }], stroke: [{ type: i0.Input, args: [{ isSignal: true, alias: "stroke", required: false }] }], strokeWidth: [{ type: i0.Input, args: [{ isSignal: true, alias: "strokeWidth", required: false }] }], hoverFill: [{ type: i0.Input, args: [{ isSignal: true, alias: "hoverFill", required: false }] }], pressedFill: [{ type: i0.Input, args: [{ isSignal: true, alias: "pressedFill", required: false }] }], geographyHover: [{ type: i0.Output, args: ["geographyHover"] }], geographyLeave: [{ type: i0.Output, args: ["geographyLeave"] }], geographyClick: [{ type: i0.Output, args: ["geographyClick"] }] } });

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
class AnnotationDirective {
    mapContext = inject(MAP_CONTEXT);
    elementRef = inject(ElementRef);
    renderer = inject(Renderer2);
    annotationGroup = null;
    /**
     * Geographic coordinates [longitude, latitude]
     */
    coordinates = input.required({ ...(ngDevMode ? { debugName: "coordinates" } : {}), alias: 'asmAnnotation' });
    /**
     * Annotation text
     */
    text = input('', ...(ngDevMode ? [{ debugName: "text" }] : []));
    /**
     * Horizontal offset from coordinate (pixels)
     */
    dx = input(30, ...(ngDevMode ? [{ debugName: "dx" }] : []));
    /**
     * Vertical offset from coordinate (pixels)
     */
    dy = input(-30, ...(ngDevMode ? [{ debugName: "dy" }] : []));
    /**
     * Connector curve amount (0 = straight, 1 = curved)
     */
    curve = input(0, ...(ngDevMode ? [{ debugName: "curve" }] : []));
    /**
     * Subject (point) radius
     */
    subjectRadius = input(4, ...(ngDevMode ? [{ debugName: "subjectRadius" }] : []));
    /**
     * Subject fill color
     */
    subjectFill = input('#FF5533', ...(ngDevMode ? [{ debugName: "subjectFill" }] : []));
    /**
     * Subject stroke color
     */
    subjectStroke = input('#FFFFFF', ...(ngDevMode ? [{ debugName: "subjectStroke" }] : []));
    /**
     * Subject stroke width
     */
    subjectStrokeWidth = input(1, ...(ngDevMode ? [{ debugName: "subjectStrokeWidth" }] : []));
    /**
     * Connector stroke color
     */
    connectorStroke = input('#FF5533', ...(ngDevMode ? [{ debugName: "connectorStroke" }] : []));
    /**
     * Connector stroke width
     */
    connectorStrokeWidth = input(1, ...(ngDevMode ? [{ debugName: "connectorStrokeWidth" }] : []));
    /**
     * Text fill color
     */
    textFill = input('#000000', ...(ngDevMode ? [{ debugName: "textFill" }] : []));
    /**
     * Text font size
     */
    fontSize = input(14, ...(ngDevMode ? [{ debugName: "fontSize" }] : []));
    /**
     * Text font weight
     */
    fontWeight = input('normal', ...(ngDevMode ? [{ debugName: "fontWeight" }] : []));
    /**
     * Text anchor (alignment)
     */
    textAnchor = input('start', ...(ngDevMode ? [{ debugName: "textAnchor" }] : []));
    constructor() {
        effect(() => {
            this.renderAnnotation();
        });
    }
    renderAnnotation() {
        const context = this.mapContext();
        const coords = this.coordinates();
        const hostElement = this.elementRef.nativeElement;
        const parentElement = this.renderer.parentNode(hostElement);
        // Project coordinates to pixel space
        const projected = context.projection(coords);
        if (!projected) {
            console.warn('Failed to project annotation coordinates:', coords);
            return;
        }
        const [x, y] = projected;
        const endX = x + this.dx();
        const endY = y + this.dy();
        // Remove existing annotation group if any
        if (this.annotationGroup) {
            this.renderer.removeChild(parentElement, this.annotationGroup);
        }
        // Create annotation group
        this.annotationGroup = this.renderer.createElement('g', 'svg');
        this.renderer.setAttribute(this.annotationGroup, 'data-asm-annotation', 'true');
        // Create connector line (curved if curve > 0)
        const connector = this.renderer.createElement('path', 'svg');
        const pathData = this.curve() > 0
            ? this.createCurvedPath(x, y, endX, endY, this.curve())
            : `M${x},${y} L${endX},${endY}`;
        this.renderer.setAttribute(connector, 'd', pathData);
        this.renderer.setAttribute(connector, 'stroke', this.connectorStroke());
        this.renderer.setAttribute(connector, 'stroke-width', String(this.connectorStrokeWidth()));
        this.renderer.setAttribute(connector, 'fill', 'none');
        this.renderer.appendChild(this.annotationGroup, connector);
        // Create subject (point marker)
        const subject = this.renderer.createElement('circle', 'svg');
        this.renderer.setAttribute(subject, 'cx', String(x));
        this.renderer.setAttribute(subject, 'cy', String(y));
        this.renderer.setAttribute(subject, 'r', String(this.subjectRadius()));
        this.renderer.setAttribute(subject, 'fill', this.subjectFill());
        this.renderer.setAttribute(subject, 'stroke', this.subjectStroke());
        this.renderer.setAttribute(subject, 'stroke-width', String(this.subjectStrokeWidth()));
        this.renderer.appendChild(this.annotationGroup, subject);
        // Create text label
        if (this.text()) {
            const textElement = this.renderer.createElement('text', 'svg');
            this.renderer.setAttribute(textElement, 'x', String(endX));
            this.renderer.setAttribute(textElement, 'y', String(endY));
            this.renderer.setAttribute(textElement, 'fill', this.textFill());
            this.renderer.setAttribute(textElement, 'font-size', String(this.fontSize()));
            this.renderer.setAttribute(textElement, 'font-weight', String(this.fontWeight()));
            this.renderer.setAttribute(textElement, 'text-anchor', this.textAnchor());
            this.renderer.setAttribute(textElement, 'dy', '0.35em');
            const textNode = this.renderer.createText(this.text());
            this.renderer.appendChild(textElement, textNode);
            this.renderer.appendChild(this.annotationGroup, textElement);
        }
        // Insert annotation group into SVG
        const nextSibling = this.renderer.nextSibling(hostElement);
        if (nextSibling) {
            this.renderer.insertBefore(parentElement, this.annotationGroup, nextSibling);
        }
        else {
            this.renderer.appendChild(parentElement, this.annotationGroup);
        }
    }
    createCurvedPath(x1, y1, x2, y2, curve) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        // Control point for quadratic curve
        const controlX = x1 + dx / 2;
        const controlY = y1 + dy / 2 - (dx * curve * 0.5);
        return `M${x1},${y1} Q${controlX},${controlY} ${x2},${y2}`;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: AnnotationDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "21.0.8", type: AnnotationDirective, isStandalone: true, selector: "[asmAnnotation]", inputs: { coordinates: { classPropertyName: "coordinates", publicName: "asmAnnotation", isSignal: true, isRequired: true, transformFunction: null }, text: { classPropertyName: "text", publicName: "text", isSignal: true, isRequired: false, transformFunction: null }, dx: { classPropertyName: "dx", publicName: "dx", isSignal: true, isRequired: false, transformFunction: null }, dy: { classPropertyName: "dy", publicName: "dy", isSignal: true, isRequired: false, transformFunction: null }, curve: { classPropertyName: "curve", publicName: "curve", isSignal: true, isRequired: false, transformFunction: null }, subjectRadius: { classPropertyName: "subjectRadius", publicName: "subjectRadius", isSignal: true, isRequired: false, transformFunction: null }, subjectFill: { classPropertyName: "subjectFill", publicName: "subjectFill", isSignal: true, isRequired: false, transformFunction: null }, subjectStroke: { classPropertyName: "subjectStroke", publicName: "subjectStroke", isSignal: true, isRequired: false, transformFunction: null }, subjectStrokeWidth: { classPropertyName: "subjectStrokeWidth", publicName: "subjectStrokeWidth", isSignal: true, isRequired: false, transformFunction: null }, connectorStroke: { classPropertyName: "connectorStroke", publicName: "connectorStroke", isSignal: true, isRequired: false, transformFunction: null }, connectorStrokeWidth: { classPropertyName: "connectorStrokeWidth", publicName: "connectorStrokeWidth", isSignal: true, isRequired: false, transformFunction: null }, textFill: { classPropertyName: "textFill", publicName: "textFill", isSignal: true, isRequired: false, transformFunction: null }, fontSize: { classPropertyName: "fontSize", publicName: "fontSize", isSignal: true, isRequired: false, transformFunction: null }, fontWeight: { classPropertyName: "fontWeight", publicName: "fontWeight", isSignal: true, isRequired: false, transformFunction: null }, textAnchor: { classPropertyName: "textAnchor", publicName: "textAnchor", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: AnnotationDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[asmAnnotation]',
                    standalone: true
                }]
        }], ctorParameters: () => [], propDecorators: { coordinates: [{ type: i0.Input, args: [{ isSignal: true, alias: "asmAnnotation", required: true }] }], text: [{ type: i0.Input, args: [{ isSignal: true, alias: "text", required: false }] }], dx: [{ type: i0.Input, args: [{ isSignal: true, alias: "dx", required: false }] }], dy: [{ type: i0.Input, args: [{ isSignal: true, alias: "dy", required: false }] }], curve: [{ type: i0.Input, args: [{ isSignal: true, alias: "curve", required: false }] }], subjectRadius: [{ type: i0.Input, args: [{ isSignal: true, alias: "subjectRadius", required: false }] }], subjectFill: [{ type: i0.Input, args: [{ isSignal: true, alias: "subjectFill", required: false }] }], subjectStroke: [{ type: i0.Input, args: [{ isSignal: true, alias: "subjectStroke", required: false }] }], subjectStrokeWidth: [{ type: i0.Input, args: [{ isSignal: true, alias: "subjectStrokeWidth", required: false }] }], connectorStroke: [{ type: i0.Input, args: [{ isSignal: true, alias: "connectorStroke", required: false }] }], connectorStrokeWidth: [{ type: i0.Input, args: [{ isSignal: true, alias: "connectorStrokeWidth", required: false }] }], textFill: [{ type: i0.Input, args: [{ isSignal: true, alias: "textFill", required: false }] }], fontSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "fontSize", required: false }] }], fontWeight: [{ type: i0.Input, args: [{ isSignal: true, alias: "fontWeight", required: false }] }], textAnchor: [{ type: i0.Input, args: [{ isSignal: true, alias: "textAnchor", required: false }] }] } });

// Directive to put markers at specific places on the map
// You can use simple circles or create your own custom marker shapes
// Must be used inside the map's SVG
//
// Simple example: <ng-container [asmMarker]="[-74.006, 40.7128]"></ng-container>
// Custom shape: Add an <ng-template> with your own SVG inside
class MarkerDirective {
    mapContext = inject(MAP_CONTEXT);
    elementRef = inject(ElementRef);
    renderer = inject(Renderer2);
    viewContainerRef = inject(ViewContainerRef);
    markerGroup = null;
    embeddedView = null;
    // Where to place the marker on the map
    coordinates = input.required({ ...(ngDevMode ? { debugName: "coordinates" } : {}), alias: 'asmMarker' });
    // How big the circle should be (if using default marker)
    radius = input(5, ...(ngDevMode ? [{ debugName: "radius" }] : []));
    // What color to fill the marker with
    fill = input('#FF5533', ...(ngDevMode ? [{ debugName: "fill" }] : []));
    // Color for the marker's border
    stroke = input('#FFFFFF', ...(ngDevMode ? [{ debugName: "stroke" }] : []));
    // How thick the border should be
    strokeWidth = input(1, ...(ngDevMode ? [{ debugName: "strokeWidth" }] : []));
    // How see-through the marker should be (0-1)
    opacity = input(1, ...(ngDevMode ? [{ debugName: "opacity" }] : []));
    // Custom SVG content to use instead of a circle
    customTemplate = contentChild(TemplateRef, ...(ngDevMode ? [{ debugName: "customTemplate" }] : []));
    constructor() {
        effect(() => {
            this.renderMarker();
        });
    }
    renderMarker() {
        const context = this.mapContext();
        const coords = this.coordinates();
        const hostElement = this.elementRef.nativeElement;
        const parentElement = this.renderer.parentNode(hostElement);
        // Convert lat/lng to screen pixels
        const projected = context.projection(coords);
        if (!projected) {
            console.warn('Failed to project marker coordinates:', coords);
            return;
        }
        const [x, y] = projected;
        // Clean up any old marker that was already drawn
        if (this.markerGroup) {
            this.renderer.removeChild(parentElement, this.markerGroup);
            if (this.embeddedView) {
                this.embeddedView.destroy();
                this.embeddedView = null;
            }
        }
        // Make a group to hold all the marker elements
        this.markerGroup = this.renderer.createElement('g', 'svg');
        this.renderer.setAttribute(this.markerGroup, 'data-asm-marker', 'true');
        this.renderer.setAttribute(this.markerGroup, 'transform', `translate(${x}, ${y})`);
        const template = this.customTemplate();
        if (template) {
            // Use the custom SVG template
            this.embeddedView = this.viewContainerRef.createEmbeddedView(template);
            this.embeddedView.detectChanges();
            // Put the custom elements into our marker group
            this.embeddedView.rootNodes.forEach(node => {
                this.renderer.appendChild(this.markerGroup, node);
            });
        }
        else {
            // Just draw a simple circle
            const circle = this.renderer.createElement('circle', 'svg');
            this.renderer.setAttribute(circle, 'r', String(this.radius()));
            this.renderer.setAttribute(circle, 'fill', this.fill());
            this.renderer.setAttribute(circle, 'stroke', this.stroke());
            this.renderer.setAttribute(circle, 'stroke-width', String(this.strokeWidth()));
            this.renderer.setAttribute(circle, 'opacity', String(this.opacity()));
            this.renderer.appendChild(this.markerGroup, circle);
        }
        // Add the marker to the map
        const nextSibling = this.renderer.nextSibling(hostElement);
        if (nextSibling) {
            this.renderer.insertBefore(parentElement, this.markerGroup, nextSibling);
        }
        else {
            this.renderer.appendChild(parentElement, this.markerGroup);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: MarkerDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.2.0", version: "21.0.8", type: MarkerDirective, isStandalone: true, selector: "[asmMarker]", inputs: { coordinates: { classPropertyName: "coordinates", publicName: "asmMarker", isSignal: true, isRequired: true, transformFunction: null }, radius: { classPropertyName: "radius", publicName: "radius", isSignal: true, isRequired: false, transformFunction: null }, fill: { classPropertyName: "fill", publicName: "fill", isSignal: true, isRequired: false, transformFunction: null }, stroke: { classPropertyName: "stroke", publicName: "stroke", isSignal: true, isRequired: false, transformFunction: null }, strokeWidth: { classPropertyName: "strokeWidth", publicName: "strokeWidth", isSignal: true, isRequired: false, transformFunction: null }, opacity: { classPropertyName: "opacity", publicName: "opacity", isSignal: true, isRequired: false, transformFunction: null } }, queries: [{ propertyName: "customTemplate", first: true, predicate: TemplateRef, descendants: true, isSignal: true }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.0.8", ngImport: i0, type: MarkerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[asmMarker]',
                    standalone: true
                }]
        }], ctorParameters: () => [], propDecorators: { coordinates: [{ type: i0.Input, args: [{ isSignal: true, alias: "asmMarker", required: true }] }], radius: [{ type: i0.Input, args: [{ isSignal: true, alias: "radius", required: false }] }], fill: [{ type: i0.Input, args: [{ isSignal: true, alias: "fill", required: false }] }], stroke: [{ type: i0.Input, args: [{ isSignal: true, alias: "stroke", required: false }] }], strokeWidth: [{ type: i0.Input, args: [{ isSignal: true, alias: "strokeWidth", required: false }] }], opacity: [{ type: i0.Input, args: [{ isSignal: true, alias: "opacity", required: false }] }], customTemplate: [{ type: i0.ContentChild, args: [i0.forwardRef(() => TemplateRef), { isSignal: true }] }] } });

// Everything you can import and use from ng-simple-maps
//
// Simple, beautiful SVG maps for Angular
// The main map component (this is what most people will use)

/**
 * Generated bundle index. Do not edit.
 */

export { AnnotationDirective, COUNTRY_NAME_TO_CONTINENT, COUNTRY_TO_CONTINENT, ComposableMapComponent, GeographiesDirective, GeographyLoaderService, MAP_CONTEXT, MapComponent, MarkerDirective, MarkerRendererUtil, PathHelperUtil, ProjectionService, TooltipComponent, ZoomControlsComponent, ZoomableGroupDirective as ZoomableGroupComponent, ZoomableGroupDirective, addKeysToGeographies, filterByContinents, generateRsmKey, getContinentForGeography, getProjectionFactory, projectCoordinates, projectionMap };
//# sourceMappingURL=ng-simple-maps.mjs.map
