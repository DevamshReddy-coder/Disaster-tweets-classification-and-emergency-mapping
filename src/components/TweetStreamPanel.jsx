import { Filter, Pause, Play } from 'lucide-react';
import { useState } from 'react';
import TweetCard from './TweetCard';

const TweetStreamPanel = ({ tweets }) => {
    const [isPaused, setIsPaused] = useState(false);

    return (
        <div className="zone tweet-stream-zone">
            <div className="zone-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Live Stream</span>
                    <span style={{
                        background: 'rgba(239,68,68,0.1)',
                        color: 'var(--accent)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        display: 'inline-block'
                    }} className={!isPaused ? 'pulse' : ''}>
                        {!isPaused ? `${tweets.length} events` : 'Paused'}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" style={{ padding: '6px' }} onClick={() => setIsPaused(!isPaused)}>
                        {isPaused ? <Play size={16} /> : <Pause size={16} />}
                    </button>
                    <button className="btn" style={{ padding: '6px' }}>
                        <Filter size={16} />
                    </button>
                </div>
            </div>
            <div className="zone-content">
                {tweets.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
                        Waiting for signals...
                    </div>
                ) : (
                    tweets.map(tweet => (
                        <TweetCard key={tweet.id} tweet={tweet} />
                    ))
                )}
            </div>
        </div>
    );
};

export default TweetStreamPanel;
