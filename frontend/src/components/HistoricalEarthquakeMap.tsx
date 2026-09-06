import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import {
  fetchHistoricalEarthquakes,
  minimumMagnitudeForRange,
  type ArchiveRange,
  type ArchiveRegion,
  type HistoricalEarthquake,
  type HistoricalEarthquakeResult,
} from '../services/usgsEarthquakeCatalog';

interface HistoricalEarthquakeMapProps {
  compact?: boolean;
}

interface MapBounds {
  west: number;
  east: number;
  north: number;
  south: number;
}

const MAP_BOUNDS: MapBounds = { west: 94, east: 142, north: 9, south: -12.5 };
const TILE_ZOOM = 5;

function longitudeToWorldX(longitude: number, zoom: number) {
  return ((longitude + 180) / 360) * 256 * 2 ** zoom;
}

function latitudeToWorldY(latitude: number, zoom: number) {
  const radians = (Math.max(-85.0511, Math.min(85.0511, latitude)) * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2) * 256 * 2 ** zoom;
}

function project(latitude: number, longitude: number, bounds = MAP_BOUNDS) {
  const left = longitudeToWorldX(bounds.west, TILE_ZOOM);
  const right = longitudeToWorldX(bounds.east, TILE_ZOOM);
  const top = latitudeToWorldY(bounds.north, TILE_ZOOM);
  const bottom = latitudeToWorldY(bounds.south, TILE_ZOOM);
  return {
    x: (longitudeToWorldX(longitude, TILE_ZOOM) - left) / (right - left),
    y: (latitudeToWorldY(latitude, TILE_ZOOM) - top) / (bottom - top),
  };
}

function createTiles(bounds = MAP_BOUNDS) {
  const left = longitudeToWorldX(bounds.west, TILE_ZOOM);
  const right = longitudeToWorldX(bounds.east, TILE_ZOOM);
  const top = latitudeToWorldY(bounds.north, TILE_ZOOM);
  const bottom = latitudeToWorldY(bounds.south, TILE_ZOOM);
  const tiles = [];
  for (let x = Math.floor(left / 256); x <= Math.floor(right / 256); x += 1) {
    for (let y = Math.floor(top / 256); y <= Math.floor(bottom / 256); y += 1) {
      tiles.push({
        key: `${x}-${y}`,
        src: `https://tile.openstreetmap.org/${TILE_ZOOM}/${x}/${y}.png`,
        left: `${((x * 256 - left) / (right - left)) * 100}%`,
        top: `${((y * 256 - top) / (bottom - top)) * 100}%`,
        width: `${(256 / (right - left)) * 100}%`,
        height: `${(256 / (bottom - top)) * 100}%`,
      });
    }
  }
  return tiles;
}

function markerColour(magnitude: number) {
  if (magnitude >= 6) return '#ef4454';
  if (magnitude >= 5) return '#f2b544';
  return '#18dcc9';
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('en-MY', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kuala_Lumpur',
  }).format(new Date(timestamp));
}

export function HistoricalEarthquakeMap({ compact = false }: HistoricalEarthquakeMapProps) {
  const [range, setRange] = useState<ArchiveRange>(compact ? '30d' : 'archive');
  const [region, setRegion] = useState<ArchiveRegion>('all');
  const [minimumMagnitude, setMinimumMagnitude] = useState(compact ? 2.5 : 4.5);
  const [result, setResult] = useState<HistoricalEarthquakeResult | null>(null);
  const [selected, setSelected] = useState<HistoricalEarthquake | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tiles = useMemo(() => createTiles(), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetchHistoricalEarthquakes({ range, region, minimumMagnitude }, controller.signal)
      .then((catalog) => {
        setResult(catalog);
        setSelected((current) => catalog.events.find((event) => event.id === current?.id) ?? catalog.events[0] ?? null);
      })
      .catch((catalogError: unknown) => {
        if (controller.signal.aborted) return;
        setError(catalogError instanceof Error ? catalogError.message : 'USGS catalog is temporarily unavailable.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [range, region, minimumMagnitude, refreshKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !result) return undefined;
    const draw = () => {
      const bounds = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(bounds.width * scale));
      canvas.height = Math.max(1, Math.round(bounds.height * scale));
      const context = canvas.getContext('2d');
      if (!context) return;
      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.clearRect(0, 0, bounds.width, bounds.height);
      result.events.forEach((event) => {
        const point = project(event.latitude, event.longitude);
        if (point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1) return;
        const radius = Math.max(2.2, Math.min(8, event.magnitude * 0.85));
        context.beginPath();
        context.arc(point.x * bounds.width, point.y * bounds.height, radius, 0, Math.PI * 2);
        context.fillStyle = markerColour(event.magnitude);
        context.globalAlpha = selected?.id === event.id ? 1 : 0.72;
        context.fill();
        context.lineWidth = selected?.id === event.id ? 2.5 : 0.75;
        context.strokeStyle = selected?.id === event.id ? '#ffffff' : '#041014';
        context.stroke();
      });
      context.globalAlpha = 1;
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [result, selected]);

  const strongest = result?.events.reduce<HistoricalEarthquake | null>((current, event) => (
    !current || event.magnitude > current.magnitude ? event : current
  ), null);

  const chooseRange = (nextRange: ArchiveRange) => {
    setRange(nextRange);
    setMinimumMagnitude((current) => Math.max(current, minimumMagnitudeForRange(nextRange)));
  };

  const onMapClick = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!result) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - bounds.left;
    const clickY = event.clientY - bounds.top;
    let nearest: { distance: number; event: HistoricalEarthquake } | null = null;
    for (const earthquake of result.events) {
      const point = project(earthquake.latitude, earthquake.longitude);
      const distance = Math.hypot(point.x * bounds.width - clickX, point.y * bounds.height - clickY);
      if (distance <= 12 && (!nearest || distance < nearest.distance)) nearest = { distance, event: earthquake };
    }
    if (nearest) setSelected(nearest.event);
  };

  return (
    <section className={`historical-map ${compact ? 'compact' : ''}`} aria-busy={loading}>
      <div className="catalog-toolbar">
        <div>
          <span className="catalog-kicker">OBSERVED EARTHQUAKE CATALOG</span>
          <strong>Nusantara · Indonesia + Malaysia</strong>
          <small>USGS observations for preparedness and research—not an official alert.</small>
        </div>
        <div className="catalog-controls">
          <label>Coverage
            <select value={range} onChange={(event) => chooseRange(event.target.value as ArchiveRange)}>
              <option value="30d">Last 30 days</option>
              <option value="1y">Last 1 year</option>
              <option value="10y">Last 10 years</option>
              <option value="archive">Archive 1900–present</option>
            </select>
          </label>
          {!compact && <label>Region
            <select value={region} onChange={(event) => setRegion(event.target.value as ArchiveRegion)}>
              <option value="all">Indonesia + Malaysia</option>
              <option value="indonesia">Indonesia corridor</option>
              <option value="malaysia">Malaysia corridor</option>
            </select>
          </label>}
          <label>Minimum magnitude
            <select value={minimumMagnitude} onChange={(event) => setMinimumMagnitude(Number(event.target.value))}>
              {[2.5, 3, 4, 4.5, 5, 6].filter((value) => value >= minimumMagnitudeForRange(range)).map((value) => (
                <option key={value} value={value}>M{value.toFixed(1)}+</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="catalog-summary" aria-live="polite">
        <div><span>Catalogued events</span><b>{loading ? '…' : result?.events.length.toLocaleString('en-MY') ?? '0'}</b></div>
        <div><span>Coverage</span><b>{result?.coverage ?? 'Loading catalog'}</b></div>
        <div><span>Strongest loaded</span><b>{strongest ? `M${strongest.magnitude.toFixed(1)}` : '—'}</b></div>
        <div><span>Source</span><b>USGS FDSN</b></div>
      </div>

      <div className="catalog-map-frame">
        <div className="catalog-tiles" aria-hidden="true">
          {tiles.map((tile) => <img key={tile.key} src={tile.src} alt="" loading="lazy" style={tile} />)}
        </div>
        <div className="catalog-map-shade" aria-hidden="true" />
        <canvas
          ref={canvasRef}
          className="catalog-markers"
          onClick={onMapClick}
          role="img"
          aria-label={`Map of ${result?.events.length ?? 0} catalogued earthquakes across the Indonesia and Malaysia corridor`}
        />
        {loading && <div className="catalog-overlay"><i className="radar-loader" /><b>Querying historical catalog…</b></div>}
        {error && <div className="catalog-overlay error"><b>Catalog unavailable</b><span>{error}</span><button className="btn ghost" onClick={() => setRefreshKey((key) => key + 1)}>Retry catalog</button></div>}
        <div className="catalog-legend">
          <span><i className="magnitude-low" /> M2.5–4.9</span>
          <span><i className="magnitude-mid" /> M5.0–5.9</span>
          <span><i className="magnitude-high" /> M6.0+</span>
        </div>
        <a className="osm-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>
      </div>

      {!compact && result && (
        <div className="catalog-detail-grid">
          <article className="catalog-selected">
            <span className="catalog-kicker">SELECTED OBSERVATION</span>
            {selected ? <>
              <div className="catalog-selected-head"><h3>{selected.place}</h3><strong>M{selected.magnitude.toFixed(1)}</strong></div>
              <dl>
                <div><dt>Observed</dt><dd>{formatDate(selected.time)} MYT</dd></div>
                <div><dt>Depth</dt><dd>{selected.depthKm.toFixed(1)} km</dd></div>
                <div><dt>Coordinates</dt><dd>{selected.latitude.toFixed(3)}, {selected.longitude.toFixed(3)}</dd></div>
                <div><dt>Jurisdiction hint</dt><dd>{selected.jurisdiction}</dd></div>
              </dl>
              <a href={selected.detailUrl} target="_blank" rel="noreferrer">Open official USGS event record ↗</a>
            </> : <p>Select a marker or event row to inspect its catalog record.</p>}
          </article>
          <div className="catalog-event-list" aria-label="Latest catalogued earthquakes">
            <div className="catalog-list-head"><span>Latest observations</span><small>{result.events.length.toLocaleString('en-MY')} loaded</small></div>
            {result.events.slice(0, 6).map((earthquake) => (
              <button key={earthquake.id} className={selected?.id === earthquake.id ? 'active' : ''} onClick={() => setSelected(earthquake)}>
                <span><b>M{earthquake.magnitude.toFixed(1)}</b><small>{earthquake.jurisdiction}</small></span>
                <span><strong>{earthquake.place}</strong><small>{formatDate(earthquake.time)} MYT · {earthquake.depthKm.toFixed(0)} km deep</small></span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="catalog-provenance">
        <span>USGS Earthquake Catalog · query limit respected</span>
        <span>BMKG / METMalaysia verification layer: planned</span>
        <span>Archive thresholds prevent oversized 20,000+ event requests</span>
      </div>
    </section>
  );
}
