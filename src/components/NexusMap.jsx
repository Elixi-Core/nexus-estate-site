import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

// Dark CartoDB tiles (free, no API key). Falls back to OSM if blocked.
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

export default function NexusMap({ points = [], center = [39.5, -98.35], zoom = 4, height = 360 }) {
  const validPoints = points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-border">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
        {validPoints.map((p, i) => (
          <CircleMarker
            key={p.id ?? i}
            center={[p.lat, p.lng]}
            radius={6 + (p.weight ?? 0) * 3}
            pathOptions={{ color: '#00FF9D', fillColor: '#00FF9D', fillOpacity: 0.6, weight: 1 }}
          >
            <Popup>
              <div className="text-xs">
                <div className="font-semibold">{p.label ?? 'Lead'}</div>
                {p.sublabel && <div className="text-muted">{p.sublabel}</div>}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
