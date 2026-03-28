import React, { useState, useEffect } from 'react';
import { Activity, Search, Shield, Clock } from 'lucide-react';

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                // Fetching same activity endpoint for now as audit log
                const res = await fetch('/api/dashboard/activity');
                const data = await res.json();
                setLogs(data);
            } catch (error) {
                console.error('Error fetching audit logs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div style={{ animation: 'fade-in-up 0.5s ease-out' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>Security Audit Log</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Comprehensive history of administrative actions and system events.</p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                        type="text"
                        placeholder="Filter logs..."
                        className="form-input"
                        style={{ paddingLeft: '40px', width: '300px', marginBottom: 0 }}
                    />
                </div>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '1.25rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event Type</th>
                            <th style={{ padding: '1.25rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
                            <th style={{ padding: '1.25rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timestamp</th>
                            <th style={{ padding: '1.25rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Decrypting secure audit streams...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No security events recorded.</td></tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s hover:background:rgba(255,255,255,0.01)' }}>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                                                <Shield size={14} />
                                            </div>
                                            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{log.type}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#e2e8f0' }}>{log.message}</td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                                            <Clock size={12} />
                                            {new Date(log.time).toLocaleString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                                        <button style={{ fontSize: '0.75rem', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Details</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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

export default AuditLog;
