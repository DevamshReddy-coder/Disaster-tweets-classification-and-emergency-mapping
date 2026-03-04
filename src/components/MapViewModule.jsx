import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Layers, MapPin, Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';

delete L.Icon.Default.prototype._getIconUrl;

const COLOR_MAP = {
    'Wildfire': '#EF4444',
    'Floods': '#3B82F6',
    'Earthquake': '#8B5CF6',
    'Drought': '#F59E0B',
    'Explosion': '#F97316',
    'Hurricanes': '#06B6D4',
    'Tornadoes': '#84CC16',
    'Fire': '#EF4444',
    'Flood': '#3B82F6',
    'Other': '#64748B'
};

const createMarkerIcon = (color, size = 24) => {
    return L.divIcon({
        className: 'custom-icon',
        html: `<div style="background-color:${color};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 6px rgba(0,0,0,0.3);"><div style="width:${size / 3}px;height:${size / 3}px;border-radius:50%;background:white;"></div></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
    });
};

const MapViewModule = ({ tweets }) => {
    const [focusHighSeverity, setFocusHighSeverity] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('All');

    const visibleTweets = useMemo(() => {
        let data = focusHighSeverity ? tweets.filter(t => t.severity_level >= 4) : tweets;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            data = data.filter(t => (t.locationName || '').toLowerCase().includes(q) || (t.tweet_text || '').toLowerCase().includes(q));
        }
        if (selectedType !== 'All') {
            data = data.filter(t => t.predicted_label === selectedType);
        }
        // Only render tweets that have valid coordinates
        return data.filter(t => t.latitude && t.longitude).slice(0, 500);
    }, [tweets, focusHighSeverity, searchQuery, selectedType]);

    const uniqueTypes = ['All', ...Object.keys(COLOR_MAP).filter(k => k !== 'Fire' && k !== 'Flood')];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px' }}>Interactive Emergency Map</h2>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {visibleTweets.length} active incidents plotted
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                        className={`btn ${focusHighSeverity ? 'btn-primary' : ''}`}
                        onClick={() => setFocusHighSeverity(!focusHighSeverity)}
                    >
                        {focusHighSeverity ? '🔴 Critical Only' : 'Focus High Severity'}
                    </button>
                </div>
            </div>

            {/* Search + Type Filter */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexShrink: 0 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search locations, keywords..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%', padding: '8px 32px 8px 38px', boxSizing: 'border-box',
                            background: 'var(--panel-bg)', border: '1px solid var(--border-color)',
                            borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none'
                        }}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <X size={14} />
                        </button>
                    )}
                </div>
                <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={{ padding: '8px 12px', background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}>
                    {uniqueTypes.map(t => <option key={t}>{t}</option>)}
                </select>
            </div>

            {/* Map */}
            <div style={{ flex: 1, borderRadius: 'var(--radius)', overflow: 'hidden', position: 'relative', border: '1px solid var(--border-color)' }}>
                <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    {visibleTweets.map((tweet) => {
                        const color = COLOR_MAP[tweet.predicted_label] || COLOR_MAP['Other'];
                        const isHighSeverity = tweet.severity_level >= 4;
                        const markerSize = isHighSeverity ? 28 : 20;

                        return (
                            <Marker
                                key={tweet.id}
                                position={[tweet.latitude, tweet.longitude]}
                                icon={createMarkerIcon(color, markerSize)}
                            >
                                <Popup>
                                    <div style={{ padding: '8px', minWidth: '220px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <span style={{ background: color, color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                                                {tweet.predicted_label}
                                            </span>
                                            <span style={{ fontSize: '12px', color: '#888' }}>Sev. {tweet.severity_level}/5</span>
                                        </div>
                                        <strong style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>📍 {tweet.locationName}</strong>
                                        <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#555', lineHeight: 1.4 }}>{(tweet.tweet_text || '').slice(0, 120)}...</p>
                                        <div style={{ fontSize: '11px', color: '#888' }}>
                                            {tweet.username} • {Math.round(tweet.confidence_score)}% conf.
                                        </div>
                                    </div>
                                </Popup>

                                {isHighSeverity && (
                                    <CircleMarker
                                        center={[tweet.latitude, tweet.longitude]}
                                        radius={40}
                                        color={color}
                                        fillColor={color}
                                        fillOpacity={0.15}
                                        stroke={false}
                                    />
                                )}
                            </Marker>
                        );
                    })}
                </MapContainer>

                {/* Legend */}
                <div style={{ position: 'absolute', bottom: '16px', right: '16px', zIndex: 1000, background: 'var(--panel-bg)', padding: '12px 16px', borderRadius: '8px', boxShadow: 'var(--shadow)', border: '1px solid var(--border-color)', fontSize: '12px' }}>
                    <div style={{ fontWeight: 700, marginBottom: '8px' }}>Legend</div>
                    {Object.entries(COLOR_MAP).filter(([k]) => !['Fire', 'Flood'].includes(k)).map(([key, col]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', cursor: 'pointer' }} onClick={() => setSelectedType(selectedType === key ? 'All' : key)}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: col, flexShrink: 0 }}></div>
                            <span style={{ color: selectedType === key ? col : 'var(--text-primary)' }}>{key}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MapViewModule;
