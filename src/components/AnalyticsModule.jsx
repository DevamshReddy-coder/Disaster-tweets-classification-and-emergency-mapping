import React, { useMemo, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { Filter, Download, Activity, ShieldCheck, AlertOctagon } from 'lucide-react';

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#10b981', '#64748b', '#06b6d4', '#84cc16'];

const AnalyticsModule = ({ tweets, metrics }) => {
    const [timeRange, setTimeRange] = useState('24h');

    const typeData = useMemo(() => {
        const dist = {};
        tweets.forEach(t => {
            const label = t.predicted_label || t.label || 'Other';
            dist[label] = (dist[label] || 0) + 1;
        });
        return Object.entries(dist).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [tweets]);

    const severityTrendData = useMemo(() => {
        const trends = [];
        const chunkSize = Math.max(1, Math.floor(tweets.length / 10));
        for (let i = 0; i < 10 && i * chunkSize < tweets.length; i++) {
            const slice = tweets.slice(i * chunkSize, (i + 1) * chunkSize);
            const critical = slice.filter(t => (t.severity_level || t.severity || 0) >= 4).length;
            trends.push({ time: `T-${10 - i}h`, critical, volume: slice.length });
        }
        return trends;
    }, [tweets]);

    const locationData = useMemo(() => {
        const loc = {};
        tweets.forEach(t => {
            const place = t.locationName || t.location;
            if (place && place !== 'Unknown') loc[place] = (loc[place] || 0) + 1;
        });
        return Object.entries(loc).map(([city, reports]) => ({ city, reports })).sort((a, b) => b.reports - a.reports).slice(0, 7);
    }, [tweets]);

    const avgConfidence = useMemo(() => {
        if (!tweets.length) return 0;
        const sum = tweets.reduce((acc, t) => acc + (t.confidence_score || t.confidence || 0), 0);
        return Math.round(sum / tweets.length);
    }, [tweets]);

    return (
        <div style={{ padding: '24px', overflowY: 'auto', height: '100%', width: '100%' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', margin: 0 }}>Historical Analytics</h2>
                    <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Deep-dive analysis on disaster volume, severities, and verification.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}
                        style={{ padding: '8px 16px', background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none' }}>
                        <option value="1h">Last 1 Hour</option>
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                    </select>
                    <button className="btn"><Filter size={16} /> Filter</button>
                    <button className="btn btn-primary"><Download size={16} /> Export Report</button>
                </div>
            </div>

            {/* Top Value Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
                {[
                    { label: 'Total Pipeline Intake', icon: <Activity size={18} color="var(--primary)" />, value: metrics.total_analyzed || tweets.length, color: null },
                    { label: 'Critical Severe Events', icon: <AlertOctagon size={18} color="#ef4444" />, value: metrics.high_risk_events || tweets.filter(t => (t.severity_level || t.severity || 0) >= 4).length, color: '#ef4444' },
                    { label: 'Average ML Confidence', icon: <ShieldCheck size={18} color="#10b981" />, value: `${avgConfidence}%`, color: '#10b981' },
                    { label: 'Verified Reports', icon: <ShieldCheck size={18} color="#f59e0b" />, value: metrics.verified_reports || 0, color: null },
                ].map(c => (
                    <div key={c.label} className="stat-box" style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{c.label}</span>
                            {c.icon}
                        </div>
                        <div className="stat-value" style={{ color: c.color || 'var(--text-primary)' }}>{c.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Area Chart */}
                <div className="zone" style={{ padding: '20px', background: 'var(--panel-bg)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Event Velocity & Critical Volume</h3>
                    <div style={{ width: '100%', height: 280 }}>
                        <ResponsiveContainer>
                            <AreaChart data={severityTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                                <Legend />
                                <Area type="monotone" dataKey="volume" name="Total Events" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                                <Area type="monotone" dataKey="critical" name="Critical Events" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="zone" style={{ padding: '20px', background: 'var(--panel-bg)', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Disaster Distribution</h3>
                    <div style={{ flex: 1, minHeight: 280 }}>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={typeData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                                    {typeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Bar Chart */}
            <div className="zone" style={{ padding: '20px', background: 'var(--panel-bg)', marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Top Affected Locations</h3>
                <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer>
                        <BarChart data={locationData} layout="vertical" margin={{ left: 40, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={true} vertical={false} />
                            <XAxis type="number" stroke="var(--text-secondary)" fontSize={12} />
                            <YAxis dataKey="city" type="category" stroke="var(--text-secondary)" fontSize={12} width={100} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                            <Bar dataKey="reports" name="Reports Count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsModule;
