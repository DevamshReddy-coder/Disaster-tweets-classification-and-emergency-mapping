import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis } from 'recharts';
import { SlidersHorizontal, Download } from 'lucide-react';

const InsightsPanel = ({ tweets, metrics }) => {
    // Compute basic stats - prefer metrics from API if available
    const total = metrics?.total_analyzed || tweets.length;
    const highRisk = metrics?.high_risk_events || tweets.filter(t => t.severity_level >= 4).length;

    // Prepare data for donut chart
    let typesCount = metrics?.disaster_distribution;
    if (!typesCount || Object.keys(typesCount).length === 0) {
        typesCount = tweets.reduce((acc, current) => {
            acc[current.predicted_label] = (acc[current.predicted_label] || 0) + 1;
            return acc;
        }, {});
    }

    const pieData = Object.keys(typesCount).map(key => ({
        name: key,
        value: typesCount[key]
    }));

    const COLORS = {
        'Fire': '#EF4444',
        'Flood': '#3B82F6',
        'Earthquake': '#8B5CF6',
        'Explosion': '#F97316',
        'Other': '#64748B',
        'Wildfire': '#EF4444',
        'Floods': '#3B82F6',
        'Hurricanes': '#0EA5E9',
        'Tornadoes': '#A855F7',
        'Drought': '#EAB308'
    };

    // Mock sentiment data trend
    const mockLine = [
        { time: '10:00', val: 0.1 },
        { time: '10:05', val: 0.4 },
        { time: '10:10', val: 0.8 },
        { time: '10:15', val: 0.5 },
        { time: '10:20', val: 0.9 },
    ];

    return (
        <div className="zone insights-zone">
            <div className="zone-header">
                <div>Classification Insights</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" style={{ padding: '6px' }} title="Filters">
                        <SlidersHorizontal size={16} />
                    </button>
                    <button className="btn" style={{ padding: '6px' }} title="Export Report">
                        <Download size={16} />
                    </button>
                </div>
            </div>
            <div className="zone-content">
                <div className="stats-grid" style={{ marginBottom: '16px' }}>
                    <div className="stat-box">
                        <span className="stat-label">Total Analyzed</span>
                        <span className="stat-value pulse" style={{ color: 'var(--primary)' }}>{total}</span>
                    </div>
                    <div className="stat-box" style={{ borderColor: 'var(--accent)' }}>
                        <span className="stat-label" style={{ color: 'var(--accent)' }}>High Risk Events</span>
                        <span className="stat-value" style={{ color: 'var(--accent)' }}>{highRisk}</span>
                    </div>
                </div>

                <div className="card" style={{ height: '220px' }}>
                    <div style={{ fontWeight: 600, marginBottom: '16px' }}>Disaster Distribution</div>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS['Other']} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>No Data Yet</div>
                    )}
                </div>

                <div className="card" style={{ height: '180px', marginBottom: 0 }}>
                    <div style={{ fontWeight: 600, marginBottom: '12px' }}>Severity Trend</div>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mockLine}>
                            <XAxis dataKey="time" hide />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                                itemStyle={{ color: 'var(--text-primary)' }}
                            />
                            <Line type="monotone" dataKey="val" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default InsightsPanel;
