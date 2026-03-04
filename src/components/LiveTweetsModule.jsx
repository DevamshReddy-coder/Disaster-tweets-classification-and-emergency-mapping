import { useState, useMemo } from 'react';
import { Filter, Pause, Play, Search, X } from 'lucide-react';
import TweetCard from './TweetCard';

const DISASTER_TYPES = ['All', 'Wildfire', 'Floods', 'Earthquake', 'Drought', 'Explosion', 'Hurricanes', 'Tornadoes', 'Other'];
const SEVERITY_LEVELS = ['All', 'Low (1-2)', 'Medium (3)', 'High (4)', 'Critical (5)'];

const LiveTweetsModule = ({ tweets, isConnected }) => {
    const [isPaused, setIsPaused] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [severityFilter, setSeverityFilter] = useState('All');
    const [showFilters, setShowFilters] = useState(false);

    const filtered = useMemo(() => {
        let data = isPaused ? tweets.slice(0, tweets.length) : tweets;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            data = data.filter(t =>
                (t.tweet_text || '').toLowerCase().includes(q) ||
                (t.username || '').toLowerCase().includes(q) ||
                (t.locationName || '').toLowerCase().includes(q)
            );
        }
        if (typeFilter !== 'All') {
            data = data.filter(t => t.predicted_label === typeFilter);
        }
        if (severityFilter !== 'All') {
            const lvl = parseInt(severityFilter.match(/\d+/)[0]);
            data = data.filter(t => t.severity_level === lvl);
        }
        return data;
    }, [tweets, searchQuery, typeFilter, severityFilter, isPaused]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px' }}>Live Tweets Feed</h2>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Real-time disaster classified social signals — {filtered.length} results
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{
                        padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                        background: isConnected ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        color: isConnected ? '#10b981' : '#ef4444'
                    }}>
                        ● {isConnected ? 'LIVE' : 'OFFLINE'}
                    </span>
                    <button className="btn" onClick={() => setIsPaused(!isPaused)} style={{ gap: '6px' }}>
                        {isPaused ? <><Play size={14} /> Resume</> : <><Pause size={14} /> Pause</>}
                    </button>
                    <button className="btn" onClick={() => setShowFilters(!showFilters)} style={{ gap: '6px' }}>
                        <Filter size={14} /> Filters
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', marginBottom: '12px', flexShrink: 0 }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                    type="text"
                    placeholder="Search by keyword, username, or location..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%', padding: '10px 36px 10px 40px',
                        background: 'var(--panel-bg)', border: '1px solid var(--border-color)',
                        borderRadius: '8px', color: 'var(--text-primary)',
                        fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                    }}
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Filters Row */}
            {showFilters && (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexShrink: 0, flexWrap: 'wrap' }}>
                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Disaster Type</label>
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '6px 12px', background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }}>
                            {DISASTER_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Severity</label>
                        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} style={{ padding: '6px 12px', background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }}>
                            {SEVERITY_LEVELS.map(l => <option key={l}>{l}</option>)}
                        </select>
                    </div>
                    <button className="btn" style={{ alignSelf: 'flex-end' }} onClick={() => { setTypeFilter('All'); setSeverityFilter('All'); setSearchQuery(''); }}>
                        <X size={14} /> Clear All
                    </button>
                </div>
            )}

            {/* Tweet List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px', alignContent: 'start' }}>
                {filtered.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                        {tweets.length === 0 ? '⏳ Waiting for live signals...' : '🔍 No results matching your filters.'}
                    </div>
                ) : (
                    filtered.map(tweet => <TweetCard key={tweet.id} tweet={tweet} />)
                )}
            </div>
        </div>
    );
};

export default LiveTweetsModule;
