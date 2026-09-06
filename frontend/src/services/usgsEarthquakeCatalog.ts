export type ArchiveRange = '30d' | '1y' | '10y' | 'archive';
export type ArchiveRegion = 'all' | 'indonesia' | 'malaysia';

export interface HistoricalEarthquake {
  id: string;
  magnitude: number;
  place: string;
  time: number;
  updated: number;
  longitude: number;
  latitude: number;
  depthKm: number;
  felt: number | null;
  tsunami: boolean;
  alert: string | null;
  detailUrl: string;
  jurisdiction: 'Indonesia' | 'Malaysia' | 'Regional corridor';
}

export interface HistoricalEarthquakeResult {
  events: HistoricalEarthquake[];
  generatedAt: number;
  sourceUrl: string;
  coverage: string;
  effectiveMinimumMagnitude: number;
}

export interface HistoricalEarthquakeQuery {
  range: ArchiveRange;
  region: ArchiveRegion;
  minimumMagnitude: number;
}

interface UsgsFeature {
  id?: string;
  properties?: {
    mag?: number | null;
    place?: string | null;
    time?: number | null;
    updated?: number | null;
    felt?: number | null;
    tsunami?: number | null;
    alert?: string | null;
    url?: string | null;
    type?: string | null;
  };
  geometry?: { coordinates?: [number, number, number] };
}

interface UsgsResponse {
  metadata?: { generated?: number; url?: string; count?: number };
  features?: UsgsFeature[];
}

interface SearchBox {
  id: Exclude<ArchiveRegion, 'all'>;
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
}

const USGS_ENDPOINT = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
const MAX_EVENTS_PER_QUERY = 20_000;
const CACHE_TTL_MS = 15 * 60 * 1000;

const SEARCH_BOXES: Record<Exclude<ArchiveRegion, 'all'>, SearchBox> = {
  indonesia: {
    id: 'indonesia',
    minLatitude: -11.5,
    maxLatitude: 6.5,
    minLongitude: 94.5,
    maxLongitude: 141.5,
  },
  malaysia: {
    id: 'malaysia',
    minLatitude: 0.5,
    maxLatitude: 7.8,
    minLongitude: 99,
    maxLongitude: 119.5,
  },
};

const minimumByRange: Record<ArchiveRange, number> = {
  '30d': 2.5,
  '1y': 3,
  '10y': 4,
  archive: 4.5,
};

const cache = new Map<string, { cachedAt: number; value: HistoricalEarthquakeResult }>();

export function minimumMagnitudeForRange(range: ArchiveRange) {
  return minimumByRange[range];
}

function startTimeForRange(range: ArchiveRange) {
  if (range === 'archive') return '1900-01-01';
  const date = new Date();
  if (range === '30d') date.setUTCDate(date.getUTCDate() - 30);
  if (range === '1y') date.setUTCFullYear(date.getUTCFullYear() - 1);
  if (range === '10y') date.setUTCFullYear(date.getUTCFullYear() - 10);
  return date.toISOString();
}

function classifyJurisdiction(place: string) {
  if (/malaysia|sabah|sarawak|ranau|lahad datu|sandakan|kota kinabalu/i.test(place)) return 'Malaysia' as const;
  if (/indonesia|sumatra|java|bali|lombok|sulawesi|papua|maluku|flores|nias|aceh/i.test(place)) return 'Indonesia' as const;
  return 'Regional corridor' as const;
}

function buildQueryUrl(box: SearchBox, startTime: string, minimumMagnitude: number) {
  const params = new URLSearchParams({
    format: 'geojson',
    eventtype: 'earthquake',
    orderby: 'time',
    starttime: startTime,
    minmagnitude: minimumMagnitude.toString(),
    minlatitude: box.minLatitude.toString(),
    maxlatitude: box.maxLatitude.toString(),
    minlongitude: box.minLongitude.toString(),
    maxlongitude: box.maxLongitude.toString(),
    limit: MAX_EVENTS_PER_QUERY.toString(),
  });
  return `${USGS_ENDPOINT}?${params.toString()}`;
}

function parseFeature(feature: UsgsFeature): HistoricalEarthquake | null {
  const properties = feature.properties;
  const coordinates = feature.geometry?.coordinates;
  if (!feature.id || !properties || !coordinates || properties.type !== 'earthquake') return null;
  const [longitude, latitude, depthKm] = coordinates;
  const magnitude = properties.mag;
  const time = properties.time;
  if (![longitude, latitude, depthKm, magnitude, time].every((value) => typeof value === 'number' && Number.isFinite(value))) return null;
  const place = properties.place?.trim() || 'Unnamed regional event';
  return {
    id: feature.id,
    magnitude: magnitude as number,
    place,
    time: time as number,
    updated: typeof properties.updated === 'number' ? properties.updated : (time as number),
    longitude,
    latitude,
    depthKm,
    felt: typeof properties.felt === 'number' ? properties.felt : null,
    tsunami: properties.tsunami === 1,
    alert: properties.alert ?? null,
    detailUrl: properties.url || 'https://earthquake.usgs.gov/earthquakes/search/',
    jurisdiction: classifyJurisdiction(place),
  };
}

export async function fetchHistoricalEarthquakes(
  query: HistoricalEarthquakeQuery,
  signal?: AbortSignal,
): Promise<HistoricalEarthquakeResult> {
  const effectiveMinimumMagnitude = Math.max(query.minimumMagnitude, minimumMagnitudeForRange(query.range));
  const cacheKey = `${query.range}:${query.region}:${effectiveMinimumMagnitude}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) return cached.value;

  const boxes = query.region === 'all'
    ? [SEARCH_BOXES.indonesia, SEARCH_BOXES.malaysia]
    : [SEARCH_BOXES[query.region]];
  const startTime = startTimeForRange(query.range);
  const urls = boxes.map((box) => buildQueryUrl(box, startTime, effectiveMinimumMagnitude));
  const responses = await Promise.all(urls.map(async (url) => {
    const response = await fetch(url, { signal, headers: { Accept: 'application/geo+json, application/json' } });
    if (!response.ok) throw new Error(`USGS catalog request failed with ${response.status}`);
    return response.json() as Promise<UsgsResponse>;
  }));

  const eventsById = new Map<string, HistoricalEarthquake>();
  responses.forEach((response) => {
    response.features?.forEach((feature) => {
      const event = parseFeature(feature);
      if (event) eventsById.set(event.id, event);
    });
  });

  const events = [...eventsById.values()].sort((a, b) => b.time - a.time);
  const generatedAt = Math.max(...responses.map((response) => response.metadata?.generated ?? 0), Date.now());
  const coverage = query.range === 'archive'
    ? `1900–present · M${effectiveMinimumMagnitude.toFixed(1)}+`
    : `${query.range.toUpperCase()} · M${effectiveMinimumMagnitude.toFixed(1)}+`;
  const value = {
    events,
    generatedAt,
    sourceUrl: responses[0]?.metadata?.url || urls[0],
    coverage,
    effectiveMinimumMagnitude,
  };
  cache.set(cacheKey, { cachedAt: Date.now(), value });
  return value;
}
