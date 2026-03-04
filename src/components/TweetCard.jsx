import { CheckCircle, AlertTriangle, Shield, Flag } from 'lucide-react';

const getDisasterColor = (type) => {
    switch (type) {
        case 'Fire': return 'var(--disaster-fire)';
        case 'Flood': return 'var(--disaster-flood)';
        case 'Earthquake': return 'var(--disaster-earthquake)';
        case 'Explosion': return 'var(--disaster-explosion)';
        default: return 'var(--disaster-other)';
    }
};

const getDisasterBadgeClass = (type) => {
    switch (type) {
        case 'Fire': return 'badge-fire';
        case 'Flood': return 'badge-flood';
        case 'Earthquake': return 'badge-earthquake';
        case 'Explosion': return 'badge-explosion';
        default: return 'badge-other';
    }
};

const TweetCard = ({ tweet }) => {
    const timeStr = new Date(tweet.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const badgeClass = getDisasterBadgeClass(tweet.predicted_label);
    const color = getDisasterColor(tweet.predicted_label);

    const confidencePct = Math.round(tweet.confidence_score);

    return (
        <div className="tweet-card">
            <div className="tweet-header">
                <div className="avatar">
                    {tweet.username.charAt(1).toUpperCase()}
                </div>
                <div className="tweet-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="tweet-user">{tweet.username}</span>
                        {tweet.isVerified && <CheckCircle size={14} color="var(--secondary)" />}
                    </div>
                    <span className="tweet-time">{timeStr} • {tweet.locationName}</span>
                </div>
            </div>

            <div className="tweet-text">
                {tweet.tweet_text}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className={`badge ${badgeClass}`}>
                    {tweet.severity_level >= 4 && <AlertTriangle size={12} />}
                    {tweet.predicted_label}
                </span>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {confidencePct}% Confidence
                </div>
            </div>

            <div className="progress-container">
                <div
                    className="progress-fill"
                    style={{ width: `${confidencePct}%`, backgroundColor: color }}
                ></div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button className="btn" style={{ flex: 1, padding: '4px 8px', fontSize: '12px' }}>
                    <Shield size={14} /> Verify
                </button>
                <button className="btn" style={{ flex: 1, padding: '4px 8px', fontSize: '12px' }}>
                    <Flag size={14} /> Flag
                </button>
            </div>
        </div>
    );
};

export default TweetCard;
