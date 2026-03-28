import React, { useState, useEffect } from 'react';
import { Users, Activity, ShieldCheck, Clock } from 'lucide-react';

const DashboardHome = () => {
    const [stats, setStats] = useState({ totalUsers: 0, activeSessions: 0, systemStatus: 'Loading...' });
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await fetch('/api/dashboard/stats');
                const statsData = await statsRes.json();
                setStats(statsData);

                const activityRes = await fetch('/api/dashboard/activity');
                const activityData = await activityRes.json();
                setActivities(activityData);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div style={{ animation: 'fade-in-up 0.5s ease-out' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '0.5rem', background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Dashboard Overview
                </h1>
                <p style={{ color: '#94a3b8' }}>Real-time platform metrics and system health monitoring.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: '0.1' }}><Users size={120} /></div>
                    <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Total Users</h3>
                    <p style={{ fontSize: '3rem', fontWeight: '900', margin: 0, color: '#fff' }}>{(stats?.totalUsers || 0).toLocaleString()}</p>
                    <div style={{ color: '#10b981', fontSize: '0.75rem', marginTop: '0.5rem' }}>Active database records</div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: '0.1' }}><Activity size={120} /></div>
                    <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Active Admins</h3>
                    <p style={{ fontSize: '3rem', fontWeight: '900', margin: 0, color: '#6366f1' }}>{stats.activeSessions}</p>
                    <div style={{ color: '#6366f1', fontSize: '0.75rem', marginTop: '0.5rem' }}>Current active status</div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: '0.1' }}><ShieldCheck size={120} /></div>
                    <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>System Health</h3>
                    <p style={{ fontSize: '3rem', fontWeight: '900', margin: 0, color: '#10b981' }}>{stats.systemStatus}</p>
                    <div style={{ color: '#10b981', fontSize: '0.75rem', marginTop: '0.5rem' }}>All services operational</div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Recent System Activity</h2>
                    <button style={{ color: '#6366f1', fontSize: '0.875rem', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {(!Array.isArray(activities) || activities.length === 0) ? (
                        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>{loading ? 'Analyzing system streams...' : 'No recent activity found.'}</p>
                    ) : (
                        activities.map((activity, idx) => (
                            <div key={activity.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                                    <Clock size={20} style={{ color: '#6366f1', margin: 'auto' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontWeight: '600', fontSize: '0.925rem' }}>{activity.message}</p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{new Date(activity.time).toLocaleString()}</p>
                                </div>
                                <div style={{ fontSize: '0.75rem', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                                    {activity.type}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default DashboardHome;
