import { useState } from 'react';
import useStore from '../store/useStore';
import { Sun, Moon, Bell, BellOff, Shield, User, Save } from 'lucide-react';

const SettingsModule = () => {
    const { isDarkMode, toggleTheme, user } = useStore();
    const [notifications, setNotifications] = useState(true);
    const [alertThreshold, setAlertThreshold] = useState(4);
    const [streamRate, setStreamRate] = useState(2500);
    const [profileName, setProfileName] = useState(user?.name || '');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '24px' }}>Settings & Preferences</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Manage your operator profile and platform configuration.</p>

            {/* Profile */}
            <div className="stat-box" style={{ marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <User size={18} color="var(--primary)" />
                    <h3 style={{ margin: 0, fontSize: '16px' }}>Operator Profile</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                        <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Display Name</label>
                        <input
                            value={profileName}
                            onChange={e => setProfileName(e.target.value)}
                            style={{ padding: '10px 12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none', width: '320px' }}
                        />
                    </div>
                    <div style={{ fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Email: </span>
                        <span>{user?.email || 'admin@disastersense.com'}</span>
                    </div>
                    <div style={{ fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Clearance Level: </span>
                        <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>{user?.role || 'Admin'}</span>
                    </div>
                </div>
            </div>

            {/* Appearance */}
            <div className="stat-box" style={{ marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    {isDarkMode ? <Moon size={18} color="var(--primary)" /> : <Sun size={18} color="var(--primary)" />}
                    <h3 style={{ margin: 0, fontSize: '16px' }}>Appearance</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Toggle interface theme</div>
                    </div>
                    <button
                        onClick={toggleTheme}
                        style={{
                            width: '48px', height: '26px', borderRadius: '13px',
                            background: isDarkMode ? 'var(--primary)' : 'var(--border-color)',
                            border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s'
                        }}
                    >
                        <div style={{
                            position: 'absolute', top: '3px',
                            left: isDarkMode ? '24px' : '3px',
                            width: '20px', height: '20px',
                            borderRadius: '50%', background: 'white',
                            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }} />
                    </button>
                </div>
            </div>

            {/* Notifications */}
            <div className="stat-box" style={{ marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Bell size={18} color="var(--primary)" />
                    <h3 style={{ margin: 0, fontSize: '16px' }}>Notifications</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>Alert Popups</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Show real-time alert toasts</div>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            style={{ width: '48px', height: '26px', borderRadius: '13px', background: notifications ? 'var(--primary)' : 'var(--border-color)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}
                        >
                            <div style={{ position: 'absolute', top: '3px', left: notifications ? '24px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                        </button>
                    </div>

                    <div>
                        <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                            Alert Severity Threshold: <strong style={{ color: 'var(--text-primary)' }}>Level {alertThreshold}</strong>
                        </label>
                        <input
                            type="range" min={1} max={5} value={alertThreshold}
                            onChange={e => setAlertThreshold(parseInt(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--primary)' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            <span>Low (1)</span><span>Medium (3)</span><span>Critical (5)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stream Settings */}
            <div className="stat-box" style={{ marginBottom: '24px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Shield size={18} color="var(--primary)" />
                    <h3 style={{ margin: 0, fontSize: '16px' }}>Stream Configuration</h3>
                </div>
                <div>
                    <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                        Feed Rate: <strong style={{ color: 'var(--text-primary)' }}>{streamRate}ms between signals</strong>
                    </label>
                    <input
                        type="range" min={500} max={5000} step={500} value={streamRate}
                        onChange={e => setStreamRate(parseInt(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--primary)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        <span>Fast (0.5s)</span><span>Balanced (2.5s)</span><span>Slow (5s)</span>
                    </div>
                </div>
            </div>

            <button className="btn btn-primary" onClick={handleSave} style={{ padding: '12px 28px', fontSize: '15px' }}>
                <Save size={16} /> {saved ? '✓ Saved!' : 'Save Preferences'}
            </button>
        </div>
    );
};

export default SettingsModule;
