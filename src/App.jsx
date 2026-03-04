import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TweetStreamPanel from './components/TweetStreamPanel';
import InsightsPanel from './components/InsightsPanel';
import MapPanel from './components/MapPanel';
import AlertsPanel from './components/AlertsPanel';
import Login from './components/Login';
import AnalyticsModule from './components/AnalyticsModule';
import LiveTweetsModule from './components/LiveTweetsModule';
import MapViewModule from './components/MapViewModule';
import AlertsModule from './components/AlertsModule';
import SettingsModule from './components/SettingsModule';
import useStore from './store/useStore';
import axios from 'axios';

export default function App() {
  const {
    isAuthenticated,
    isDarkMode,
    activeTab,
    tweets,
    alerts, dismissAlert,
    metrics, setMetrics,
    isConnected, setIsConnected,
    searchQuery
  } = useStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      console.log('Connected to DisasterSense Streaming Gateway');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'tweet:new') {
          useStore.setState((state) => ({
            tweets: [data.payload, ...state.tweets].slice(0, 1000)
          }));
        }
        if (data.type === 'alert:new') {
          useStore.setState((state) => ({
            // Cap visible floating alerts at 3 max
            alerts: [data.payload, ...state.alerts].slice(0, 50)
          }));
        }
      } catch (err) {
        console.error("WS Message Error", err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => ws.close();
  }, [isAuthenticated, setIsConnected]);

  // Fetch analytics on load and every 15s
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchAnalytics = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const res = await axios.get(`${apiUrl}/api/analytics/summary`);
        if (res.status === 200) setMetrics(res.data);
      } catch (e) { /* backend offline */ }
    };
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, setMetrics]);

  // Theme toggle
  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  if (!isAuthenticated) return <Login />;

  // Global search filtering of tweets for the Dashboard panel
  const filteredTweets = searchQuery
    ? tweets.filter(t =>
      (t.tweet_text || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.locationName || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    : tweets;

  // Floating alerts — only show max 3 at a time to prevent flood
  const visibleAlerts = alerts.slice(0, 3);

  const renderModule = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="content-area" style={{ padding: '24px' }}>
            <div className="zone tweet-stream-zone">
              <TweetStreamPanel tweets={filteredTweets} isConnected={isConnected} />
            </div>
            <div className="zone insights-zone">
              <InsightsPanel tweets={filteredTweets} metrics={metrics} />
            </div>
            <div className="zone map-zone">
              <MapPanel tweets={filteredTweets} />
            </div>
          </div>
        );
      case 'Live Tweets':
        return <LiveTweetsModule tweets={tweets} isConnected={isConnected} />;
      case 'Map View':
        return <MapViewModule tweets={tweets} />;
      case 'Analytics':
        return <AnalyticsModule tweets={tweets} metrics={metrics} />;
      case 'Alerts':
        return <AlertsModule alerts={alerts} onDismiss={dismissAlert} />;
      case 'Settings':
        return <SettingsModule />;
      default:
        return null;
    }
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : ''}`}>
      <Navbar isConnected={isConnected} />

      <div className="main-content">
        <Sidebar />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {renderModule()}
        </div>
      </div>

      {/* Floating Alerts — capped to 3 */}
      <AlertsPanel alerts={visibleAlerts} onDismiss={dismissAlert} />
    </div>
  );
}
