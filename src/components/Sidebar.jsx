import {
    LayoutDashboard,
    Activity,
    Map as MapIcon,
    BarChart2,
    AlertTriangle,
    Settings,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import useStore from '../store/useStore';

const Sidebar = () => {
    const { isSidebarCollapsed, toggleSidebar, activeTab, setActiveTab } = useStore();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'Live Tweets', icon: Activity },
        { name: 'Map View', icon: MapIcon },
        { name: 'Analytics', icon: BarChart2 },
        { name: 'Alerts', icon: AlertTriangle },
        { name: 'Settings', icon: Settings }
    ];

    return (
        <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
            <div style={{ flex: 1, padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {menuItems.map((item, idx) => {
                    const isActive = activeTab === item.name;
                    return (
                        <div
                            key={idx}
                            onClick={() => setActiveTab(item.name)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 24px',
                                cursor: 'pointer',
                                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                background: isActive ? 'rgba(15, 23, 42, 0.05)' : 'transparent',
                                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                                transition: 'var(--transition)'
                            }}
                        >
                            <item.icon size={20} style={{ minWidth: '20px' }} />
                            {!isSidebarCollapsed && <span style={{ marginLeft: '16px', fontWeight: 500 }}>{item.name}</span>}
                        </div>
                    );
                })}
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center' }}>
                <button
                    className="btn"
                    onClick={toggleSidebar}
                    style={{ width: '100%' }}
                >
                    {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
