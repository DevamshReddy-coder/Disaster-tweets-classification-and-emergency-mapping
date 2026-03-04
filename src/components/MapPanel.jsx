import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Layers, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

// fix generic leaflet icons since we don't load them explicitly
delete L.Icon.Default.prototype._getIconUrl;

const COLOR_MAP = {
    'Fire': '#EF4444',
    'Flood': '#3B82F6',
    'Earthquake': '#8B5CF6',
    'Explosion': '#F97316',
    'Other': '#64748B'
};

const createMarkerIcon = (color) => {
    return L.divIcon({
        className: 'custom-icon',
        html: `
      <div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: white;"></div>
      </div>
    `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
    });
};

const MapPanel = ({ tweets }) => {
    const [focusHighSeverity, setFocusHighSeverity] = useState(false);

    // default center somewhere near our mock data (San Francisco district)
    const defaultCenter = [37.7749, -122.4194];

    const visibleTweets = focusHighSeverity
        ? tweets.filter(t => t.severity_level >= 4)
        : tweets;

    return (
        <div className="zone map-zone">
            <div className="zone-header" style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', zIndex: 1000, background: 'var(--panel-bg)', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={20} color="var(--primary)" />
                    <span>Interactive Emergency Map</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className={`btn ${focusHighSeverity ? 'btn-primary' : ''}`}
                        onClick={() => setFocusHighSeverity(!focusHighSeverity)}
                        style={{ fontSize: '13px', padding: '6px 12px' }}
                    >
                        {focusHighSeverity ? 'Viewing Critical Only' : 'Focus High Severity'}
                    </button>
                    <button className="btn" style={{ padding: '6px' }}>
                        <Layers size={16} />
                    </button>
                </div>
            </div>

            <MapContainer
                center={defaultCenter}
                zoom={12}
                zoomControl={false}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {visibleTweets.map((tweet) => {
                    const color = COLOR_MAP[tweet.predicted_label] || COLOR_MAP['Other'];
                    const isHighSeverity = tweet.severity_level >= 4;

                    return (
                        <Marker
                            key={tweet.id}
                            position={[tweet.latitude, tweet.longitude]}
                            icon={createMarkerIcon(color)}
                        >
                            <Popup className="custom-popup">
                                <div style={{ padding: '8px', minWidth: '200px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span style={{
                                            background: color, color: '#fff',
                                            padding: '2px 8px', borderRadius: '12px',
                                            fontSize: '12px', fontWeight: 600, textTransform: 'uppercase'
                                        }}>
                                            {tweet.predicted_label}
                                        </span>
                                        <span style={{ fontSize: '12px', color: 'gray' }}>
                                            Level {tweet.severity_level}
                                        </span>
                                    </div>
                                    <strong style={{ display: 'block', marginBottom: '4px' }}>{tweet.locationName}</strong>
                                    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.4 }}>{tweet.tweet_text}</p>
                                </div>
                            </Popup>

                            {isHighSeverity && (
                                <CircleMarker
                                    center={[tweet.latitude, tweet.longitude]}
                                    radius={40}
                                    color={color}
                                    fillColor={color}
                                    fillOpacity={0.2}
                                    stroke={false}
                                />
                            )}
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Map Legend */}
            <div style={{
                position: 'absolute', bottom: '16px', right: '16px',
                zIndex: 1000, background: 'var(--panel-bg)',
                padding: '12px', borderRadius: '8px',
                boxShadow: 'var(--shadow)', border: '1px solid var(--border-color)',
                fontSize: '12px'
            }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Legend</div>
                {Object.entries(COLOR_MAP).map(([key, col]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: col }}></div>
                        <span>{key}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MapPanel;
