import { Bell, Search, Moon, Sun, User, LogOut, ShieldAlert, X } from 'lucide-react';
import useStore from '../store/useStore';

const Navbar = ({ isConnected }) => {
    const { isDarkMode, toggleTheme, user, logout, searchQuery, setSearchQuery } = useStore();

    return (
        <nav className="navbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldAlert size={28} color="var(--accent)" />
                <h1 style={{ fontSize: '20px', letterSpacing: '-0.5px' }}>DisasterSense</h1>

                <div style={{ marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="status-indicator">
                        <span className={`status-dot ${isConnected ? 'live' : 'disconnected'}`}></span>
                        {isConnected ? 'LIVE STREAM' : 'DISCONNECTED'}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search keywords or location..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            background: 'var(--bg-color)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '20px',
                            padding: '8px 32px 8px 36px',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                            width: '240px',
                            outline: 'none',
                            fontFamily: 'var(--font-body)'
                        }}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                <button
                    className="btn"
                    onClick={toggleTheme}
                    aria-label="Toggle Theme"
                    style={{ padding: '8px', borderRadius: '50%' }}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <button className="btn" style={{ padding: '8px', borderRadius: '50%', position: 'relative' }}>
                    <Bell size={20} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
                    <div className="avatar" style={{ background: 'var(--primary)', color: 'var(--bg-color)', textTransform: 'uppercase' }}>
                        {user?.name ? user.name.charAt(0) : <User size={18} />}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
                        <span style={{ fontWeight: 600 }}>{user?.name || 'Analyst'}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{user?.role || 'Guest'}</span>
                    </div>

                    <button
                        className="btn"
                        onClick={logout}
                        title="Secure Logout"
                        style={{ padding: '6px', marginLeft: '8px', border: '1px solid var(--border-color)' }}
                    >
                        <LogOut size={16} color="var(--accent)" />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
