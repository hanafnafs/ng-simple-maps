import { GeographyObject } from '../models';

// All the continents we support
export type Continent = 'Africa' | 'Asia' | 'Europe' | 'North America' | 'South America' | 'Oceania' | 'Antarctica';

// Map country names to continents
// Includes different spellings and abbreviations you might find in map data
export const COUNTRY_NAME_TO_CONTINENT: Record<string, Continent> = {
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
export const COUNTRY_TO_CONTINENT: Record<string, Continent> = {
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
export function getContinentForGeography(geography: GeographyObject): Continent | null {
  if (!geography.properties) {
    return null;
  }

  const props = geography.properties;

  // Some map data already has continent info
  const continent = props['CONTINENT'] || props['continent'];
  if (continent && typeof continent === 'string') {
    return continent as Continent;
  }

  // Look for 3-letter country codes in various places
  const countryCode = props['ISO_A3'] || props['iso_a3'] ||
                      props['ADM0_A3'] || props['adm0_a3'] ||
                      props['SOV_A3'] || props['sov_a3'] ||
                      props['ISO3'] || props['iso3'];

  if (countryCode && typeof countryCode === 'string') {
    const result = COUNTRY_TO_CONTINENT[countryCode.toUpperCase()];
    if (result) return result;
  }

  // Look for country name in various fields
  const countryName = props['name'] || props['NAME'] ||
                      props['ADMIN'] || props['admin'] ||
                      props['NAME_LONG'] || props['name_long'] ||
                      props['SOVEREIGNT'] || props['sovereignt'];

  if (countryName && typeof countryName === 'string') {
    const result = COUNTRY_NAME_TO_CONTINENT[countryName];
    if (result) return result;
  }

  return null;
}

// Keep only countries from specific continents
export function filterByContinents(
  geographies: GeographyObject[],
  continents: Continent | Continent[]
): GeographyObject[] {
  const continentSet = new Set(Array.isArray(continents) ? continents : [continents]);

  return geographies.filter(geo => {
    const continent = getContinentForGeography(geo);
    return continent && continentSet.has(continent);
  });
}
