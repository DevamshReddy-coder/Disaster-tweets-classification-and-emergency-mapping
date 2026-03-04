import { useState, useMemo } from 'react';
import { CheckCircle, Clock, AlertOctagon, Bell, Filter, BellOff, Radio } from 'lucide-react';

const SEVERITY_LABELS = { 1: 'Low', 2: 'Low', 3: 'Medium', 4: 'High', 5: 'Critical' };
const SEVERITY_COLORS = { 1: '#10b981', 2: '#10b981', 3: '#f59e0b', 4: '#f97316', 5: '#ef4444' };

const AlertsModule = ({ alerts, onDismiss }) => {
    const [statusFilter, setStatusFilter] = useState('All');
    const [acknowledged, setAcknowledged] = useState(new Set());
    const [broadcasted, setBroadcasted] = useState(new Set());

    const filtered = useMemo(() => {
        if (statusFilter === 'Active') return alerts.filter(a => !acknowledged.has(a.id));
        if (statusFilter === 'Acknowledged') return alerts.filter(a => acknowledged.has(a.id));
        return alerts;
    }, [alerts, statusFilter, acknowledged]);

    const handleAck = (id) => {
        setAcknowledged(prev => new Set([...prev, id]));
    };

    const handleBroadcast = async (alert) => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/api/alerts/${alert.id}/broadcast`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setBroadcasted(prev => new Set([...prev, alert.id]));
                // Trigger a JS alert to show the operator that messages were sent
                window.alert(`🚨 EMERGENCY BROADCAST SENT\n\nSMS Warning successfully broadcasted to people in the affected zone for Incident: ${alert.id}`);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const activeCount = alerts.filter(a => !acknowledged.has(a.id)).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px' }}>Alerts & Incidents</h2>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {activeCount} active alerts · {acknowledged.size} acknowledged
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{ padding: '8px 12px', background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                    >
                        <option>All</option>
                        <option>Active</option>
                        <option>Acknowledged</option>
                    </select>
                    <button className="btn btn-primary" onClick={() => alerts.forEach(a => acknowledged.has(a.id) || handleAck(a.id))}>
                        <CheckCircle size={14} /> Acknowledge All
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px', flexShrink: 0 }}>
                {[
                    { label: 'Critical', value: alerts.filter(a => a.severity >= 5).length, color: '#ef4444' },
                    { label: 'High', value: alerts.filter(a => a.severity === 4).length, color: '#f97316' },
                    { label: 'Medium', value: alerts.filter(a => a.severity === 3).length, color: '#f59e0b' },
                ].map(stat => (
                    <div key={stat.label} style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{stat.label} Severity</div>
                    </div>
                ))}
            </div>

            {/* Alerts List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                        <BellOff size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                        <p>No alerts match your filter.</p>
                    </div>
                ) : (
                    filtered.map(alert => {
                        const isAcked = acknowledged.has(alert.id);
                        const sev = alert.severity || 5;
                        const color = SEVERITY_COLORS[sev] || '#ef4444';
                        const label = SEVERITY_LABELS[sev] || 'Critical';
                        const time = new Date(alert.created_at || Date.now()).toLocaleTimeString();

                        return (
                            <div key={alert.id} style={{
                                background: 'var(--panel-bg)', border: `1px solid ${isAcked ? 'var(--border-color)' : color}`,
                                borderLeft: `4px solid ${isAcked ? 'var(--border-color)' : color}`,
                                borderRadius: '8px', padding: '16px',
                                opacity: isAcked ? 0.6 : 1, transition: 'all 0.3s'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                            <AlertOctagon size={16} color={color} />
                                            <span style={{ fontWeight: 700, fontSize: '14px', color }}>
                                                {label.toUpperCase()} ALERT
                                            </span>
                                            <span style={{
                                                background: `${color}20`, color,
                                                padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600
                                            }}>
                                                {label}
                                            </span>
                                            {isAcked && <span style={{ background: '#10b98120', color: '#10b981', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>✓ Acknowledged</span>}
                                        </div>
                                        <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--text-primary)' }}>{alert.message}</p>
                                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {time}</span>
                                            <span>ID: {alert.id}</span>
                                        </div>
                                        {alert.locationName && (
                                            <div style={{ marginTop: '12px', background: 'var(--bg-color)', padding: '12px', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <strong>📍 {alert.locationName}</strong>
                                                    <span>{alert.confidence}% AI Confidence</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                                                    <span><strong>Lat:</strong> {alert.lat?.toFixed(4)}</span>
                                                    <span><strong>Lng:</strong> {alert.lng?.toFixed(4)}</span>
                                                    <a href={`https://www.google.com/maps/search/?api=1&query=${alert.lat},${alert.lng}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                                        🗺️ View on Map
                                                    </a>
                                                </div>
                                                {broadcasted.has(alert.id) && (
                                                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)', color: '#10b981', fontWeight: 600 }}>
                                                        ✓ Emergency SMS Broadcasted to Local Police, Fire, and Ambulance (20km radius).
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '16px' }}>
                                        {!isAcked && (
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleAck(alert.id)}
                                                style={{ padding: '6px 14px', fontSize: '12px' }}
                                            >
                                                <CheckCircle size={13} /> Acknowledge
                                            </button>
                                        )}
                                        {!broadcasted.has(alert.id) ? (
                                            <button
                                                className="btn"
                                                onClick={() => handleBroadcast(alert)}
                                                style={{ padding: '6px 14px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444' }}
                                                title="Send emergency SMS broadcast to responders (20km radius)"
                                            >
                                                <Radio size={13} style={{ marginRight: '4px' }} /> Broadcast SMS
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, padding: '4px 8px', background: '#10b98120', borderRadius: '4px' }}>
                                                SMS Broadcasted
                                            </span>
                                        )}
                                        <button
                                            className="btn"
                                            onClick={() => onDismiss(alert.id)}
                                            style={{ padding: '6px 12px', fontSize: '12px' }}
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default AlertsModule;
