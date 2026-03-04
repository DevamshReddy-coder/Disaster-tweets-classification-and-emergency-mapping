import { X } from 'lucide-react';

const AlertsPanel = ({ alerts, onDismiss }) => {
    if (alerts.length === 0) return null;

    return (
        <div className="alerts-container">
            {alerts.map((alert) => {
                const alertTime = new Date(alert.t || alert.created_at || Date.now());
                const alertTitle = alert.title || (alert.severity >= 4 ? 'CRITICAL ALERT' : 'SYSTEM ALERT');

                return (
                    <div key={alert.id} className="alert-toast">
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: '4px' }}>
                                {alertTitle}
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                                {alert.message}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {alertTime.toLocaleTimeString()}
                            </div>
                        </div>
                        <button
                            onClick={() => onDismiss(alert.id)}
                            style={{
                                background: 'transparent', border: 'none',
                                color: 'var(--text-secondary)', cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default AlertsPanel;
